"use node";

/**
 * The honest tailoring pipeline.
 *
 * Six small model calls, each with its own schema, its own token cap and its
 * own usage row, with deterministic code between them: boilerplate is stripped
 * before anything is read, evidence ids are checked against the profile, the
 * resume is reassembled from the profile so its structure cannot drift, and a
 * verifier pass turns anything the model added into a claim the user has to
 * confirm before the draft can be approved.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, action } from "../_generated/server";
import type {
  AnswerConfidence,
  AnswerDraft,
  ChangeLogEntry,
  EvidenceMapEntry,
  EvidenceStrength,
  JobQuestion,
  NeedsHumanEntry,
} from "../validators";
import { generateJson, type JsonSchema } from "./client";
import {
  ANSWERS_MAX_TOKENS,
  ANSWERS_SCHEMA,
  ANSWERS_SYSTEM,
  COVER_MAX_TOKENS,
  COVER_OPENING_ID,
  COVER_SCHEMA,
  COVER_SYSTEM,
  EXTRACT_MAX_TOKENS,
  EXTRACT_SCHEMA,
  EXTRACT_SYSTEM,
  MAP_MAX_TOKENS,
  MAP_SCHEMA,
  MAP_SYSTEM,
  REVIEW_MAX_TOKENS,
  REVIEW_SCHEMA,
  REVIEW_SYSTEM,
  REWRITE_MAX_TOKENS,
  REWRITE_SCHEMA,
  REWRITE_SYSTEM,
  coverLetterPrompt,
  extractRequirementsPrompt,
  mapEvidencePrompt,
  reviewPrompt,
  rewriteResumePrompt,
  screeningAnswersPrompt,
} from "./prompts";
import { resolveUserModel, type ResolvedModel } from "./resolve";
import {
  JOB_DESCRIPTION_CHARS,
  MAX_ANSWER_WORDS,
  NEEDS_ANSWER,
  buildFactRegistry,
  clampWords,
  coerceToOption,
  computeAtsScore,
  computeMatchScore,
  evidenceIdSet,
  filterEvidenceIds,
  gapsFrom,
  optionValuesFor,
  reassembleResume,
  resolveBankAnswer,
  splitKeywords,
  stripJobBoilerplate,
  sumUsage,
  type ProfileFact,
  type RewriteOutput,
  type StepUsage,
  type TailoredBullet,
} from "./tailor";
import { verifyTailoring, type VerifyInput, type VerifyResult } from "./verify";

const PROFILE_REQUIRED_MESSAGE = "Confirm your profile first";

/** Each step's own usage row, so the cost meter can show where money went. */
type Purpose =
  | "tailor:extract"
  | "tailor:map"
  | "tailor:rewrite"
  | "tailor:cover"
  | "tailor:answers"
  | "tailor:review";

const MAX_LIST_ENTRIES = 15;
const MAX_LINE_CHARS = 140;
const STRENGTHS: EvidenceStrength[] = ["direct", "analogous", "transferable", "none"];

type Requirements = {
  required: string[];
  preferred: string[];
  keywords: string[];
  seniority: string;
  hardGates: string[];
};

type StepContext = {
  userId: Id<"users">;
  applicationId: Id<"applications"> | null;
  resolved: ResolvedModel;
  usage: StepUsage[];
};

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to build an apply kit.");
  }
  return userId;
}

/** One model call plus its usage row. Every step in the pipeline goes here. */
async function runStep<T>(
  ctx: ActionCtx,
  step: StepContext,
  call: {
    purpose: Purpose;
    system: string;
    user: string;
    schema: JsonSchema;
    schemaName: string;
    maxTokens: number;
    temperature?: number;
  },
): Promise<T> {
  const completion = await generateJson<T>({
    provider: step.resolved.provider,
    model: step.resolved.model,
    apiKey: step.resolved.apiKey,
    system: call.system,
    user: call.user,
    schema: call.schema,
    schemaName: call.schemaName,
    maxTokens: call.maxTokens,
    temperature: call.temperature ?? 0,
  });

  step.usage.push({
    inputTokens: completion.usage.inputTokens,
    outputTokens: completion.usage.outputTokens,
    costUsd: completion.costUsd,
  });

  await ctx.runMutation(internal.aiSettings.recordUsage, {
    userId: step.userId,
    provider: completion.provider,
    model: completion.model,
    purpose: call.purpose,
    inputTokens: completion.usage.inputTokens,
    outputTokens: completion.usage.outputTokens,
    costUsd: completion.costUsd,
    ...(step.applicationId ? { applicationId: step.applicationId } : {}),
  });

  return completion.data;
}

// --- reading what the model returned ---------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function lines(value: unknown, limit = MAX_LIST_ENTRIES): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    const text = String(entry ?? "").trim().slice(0, MAX_LINE_CHARS);
    const key = text.toLowerCase();
    if (text.length === 0 || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length >= limit) break;
  }

  return result;
}

function toRequirements(value: unknown): Requirements {
  const record = asRecord(value);
  return {
    required: lines(record.required),
    preferred: lines(record.preferred),
    keywords: lines(record.keywords, MAX_LIST_ENTRIES * 2),
    seniority: String(record.seniority ?? "").trim().slice(0, MAX_LINE_CHARS),
    hardGates: lines(record.hardGates),
  };
}

function toStrength(value: unknown): EvidenceStrength {
  const text = String(value ?? "").trim().toLowerCase();
  return STRENGTHS.find((strength) => strength === text) ?? "none";
}

/**
 * One entry per requirement we asked about, in our order. Ids the profile does
 * not have are dropped here, so a hallucinated citation can never be stored.
 */
function toEvidenceMap(
  value: unknown,
  requirements: readonly string[],
  validIds: Set<string>,
): EvidenceMapEntry[] {
  const matches = new Map<string, Record<string, unknown>>();
  for (const match of asRecords(asRecord(value).matches)) {
    matches.set(String(match.requirement ?? "").trim().toLowerCase(), match);
  }

  return requirements.map((requirement) => {
    const match = matches.get(requirement.toLowerCase());
    const strength = toStrength(match?.strength);
    const rawIds = match && Array.isArray(match.evidenceIds) ? match.evidenceIds : [];
    const evidenceIds =
      strength === "none"
        ? []
        : filterEvidenceIds(
            rawIds.map((id) => String(id)),
            validIds,
          );

    // A requirement with no surviving evidence is a gap, whatever it claimed.
    return { requirement, evidenceIds, strength: evidenceIds.length === 0 ? "none" : strength };
  });
}

function toRewrite(value: unknown): RewriteOutput {
  const record = asRecord(value);

  return {
    summary: String(record.summary ?? "").trim(),
    experiences: asRecords(record.experiences).map((experience) => ({
      id: String(experience.id ?? "").trim(),
      bullets: asRecords(experience.bullets).map((bullet) => ({
        id: String(bullet.id ?? "").trim(),
        text: String(bullet.text ?? "").trim(),
        evidenceIds: Array.isArray(bullet.evidenceIds)
          ? bullet.evidenceIds.map((id) => String(id).trim())
          : [],
      })),
    })),
    skillsOrder: Array.isArray(record.skillsOrder)
      ? record.skillsOrder.map((name) => String(name ?? "").trim()).filter(Boolean)
      : [],
  };
}

function toReviewRewrites(value: unknown): Map<string, string> {
  const rewrites = new Map<string, string>();
  for (const entry of asRecords(asRecord(value).rewrites)) {
    const id = String(entry.bulletId ?? "").trim();
    const text = String(entry.text ?? "").trim();
    if (id.length > 0 && text.length > 0) rewrites.set(id, text);
  }
  return rewrites;
}

// --- screening answers ------------------------------------------------------

type QuestionSpec = { question: string; required: boolean; options: string[] };

/** One answer plus, when it is still the user's to give, why it is theirs. */
type ResolvedAnswer = {
  question: string;
  required: boolean;
  answer: string;
  confidence: AnswerConfidence;
  sourceKey?: string;
  needsHuman?: string;
};

function questionSpecs(questions: JobQuestion[]): QuestionSpec[] {
  return questions.map((question) => ({
    question: question.label,
    required: question.required,
    options: optionValuesFor(question),
  }));
}

/**
 * Answers about visa status, salary, clearance or dates are never guessed:
 * they come from the answer bank word for word, or they go back to the user.
 */
function fromAnswerBank(
  spec: QuestionSpec,
  bank: Doc<"careerProfiles">["answerBank"],
): ResolvedAnswer | null {
  const banked = resolveBankAnswer(spec.question, bank);
  if (banked === null) return null;

  return { question: spec.question, required: spec.required, ...banked };
}

function draftedAnswer(spec: QuestionSpec, raw: string | undefined): ResolvedAnswer {
  const answer = coerceToOption(clampWords(raw ?? "", MAX_ANSWER_WORDS), spec.options);
  const base = { question: spec.question, required: spec.required };

  return answer.length === 0 || answer === NEEDS_ANSWER
    ? {
        ...base,
        answer: NEEDS_ANSWER,
        confidence: "low",
        needsHuman: "Nothing in your profile answers this one.",
      }
    : { ...base, answer, confidence: "medium" };
}

async function answerQuestions(
  ctx: ActionCtx,
  step: StepContext,
  args: {
    job: Doc<"jobImports">;
    facts: ProfileFact[];
    bank: Doc<"careerProfiles">["answerBank"];
    specs: QuestionSpec[];
  },
): Promise<ResolvedAnswer[]> {
  const banked = args.specs.map((spec) => ({ spec, answer: fromAnswerBank(spec, args.bank) }));
  const forModel = banked.filter((entry) => entry.answer === null).map((entry) => entry.spec);

  const byQuestion = new Map<string, string>();
  const inOrder: string[] = [];

  if (forModel.length > 0) {
    const data = await runStep<unknown>(ctx, step, {
      purpose: "tailor:answers",
      system: ANSWERS_SYSTEM,
      user: screeningAnswersPrompt({
        job: args.job,
        questions: forModel,
        facts: args.facts,
      }),
      schema: ANSWERS_SCHEMA,
      schemaName: "screening_answers",
      maxTokens: ANSWERS_MAX_TOKENS,
    });

    for (const entry of asRecords(asRecord(data).answers)) {
      const question = String(entry.question ?? "").trim();
      const answer = String(entry.answer ?? "").trim();
      inOrder.push(answer);
      if (question.length > 0) byQuestion.set(question, answer);
    }
  }

  const resolved: ResolvedAnswer[] = [];
  let drafted = 0;

  for (const entry of banked) {
    if (entry.answer !== null) {
      resolved.push(entry.answer);
      continue;
    }

    // Some models echo the question back with small edits, so fall back to
    // the answer in the position we asked the question in.
    const raw = byQuestion.get(entry.spec.question) ?? inOrder[drafted];
    drafted += 1;
    resolved.push(draftedAnswer(entry.spec, raw));
  }

  return resolved;
}

function toAnswerDrafts(answers: ResolvedAnswer[]): AnswerDraft[] {
  return answers.map((answer) => ({
    question: answer.question,
    required: answer.required,
    answer: answer.answer,
    confidence: answer.confidence,
    sourceKey: answer.sourceKey,
  }));
}

function toNeedsHuman(answers: ResolvedAnswer[]): NeedsHumanEntry[] {
  return answers
    .filter((answer) => answer.needsHuman !== undefined)
    .map((answer) => ({ question: answer.question, reason: answer.needsHuman ?? "" }));
}

// --- the run ----------------------------------------------------------------

function profileHaystack(profile: Doc<"careerProfiles">): string {
  return [
    profile.sourceResumeText,
    profile.summary ?? "",
    ...profile.experiences.map((entry) => `${entry.title} ${entry.company} ${entry.location ?? ""}`),
    ...profile.skills.map((skill) => skill.name),
    ...profile.certifications.map((entry) => `${entry.name} ${entry.issuer ?? ""}`),
    ...profile.education.map((entry) => `${entry.degree} ${entry.field ?? ""} ${entry.school}`),
    ...(profile.userConfirmedFacts ?? []).map((fact) => fact.text),
  ].join("\n");
}

function changeReason(bullet: TailoredBullet, evidenceMap: EvidenceMapEntry[]): string {
  if (bullet.text === bullet.original) return "Kept exactly as you wrote it.";

  const covered = evidenceMap
    .filter((entry) => entry.evidenceIds.some((id) => bullet.evidenceIds.includes(id)))
    .map((entry) => entry.requirement);

  return covered.length > 0
    ? `Rewritten for: ${covered.slice(0, 2).join("; ")}`
    : "Rewritten in the posting's words, from facts you already have.";
}

function toChangeLog(
  verified: VerifyResult,
  evidenceMap: EvidenceMapEntry[],
): ChangeLogEntry[] {
  return verified.experiences.flatMap((experience) =>
    experience.bullets.map((bullet) => ({
      bulletId: bullet.id,
      original: bullet.original,
      rewritten: bullet.text,
      reason: changeReason(bullet, evidenceMap),
      evidenceIds: bullet.evidenceIds,
    })),
  );
}

/** Swaps the cover letter's first sentence for the reviewer's version. */
function replaceOpeningSentence(letter: string, replacement: string | undefined): string {
  if (!replacement) return letter;
  const match = letter.match(/^[\s\S]*?[.!?](\s|$)/);
  return match ? `${replacement.trim()} ${letter.slice(match[0].length)}`.trim() : replacement.trim();
}

function withReviewerRewrites(rewrite: RewriteOutput, rewrites: Map<string, string>): RewriteOutput {
  return {
    ...rewrite,
    experiences: rewrite.experiences.map((experience) => ({
      id: experience.id,
      bullets: experience.bullets.map((bullet) => {
        const replacement = rewrites.get(bullet.id);
        return replacement ? { ...bullet, text: replacement } : bullet;
      }),
    })),
  };
}

/** Steps 1 and 2: what the posting asks for, and which facts answer it. */
async function readPosting(
  ctx: ActionCtx,
  step: StepContext,
  job: Doc<"jobImports">,
  facts: ProfileFact[],
): Promise<{ requirements: Requirements; evidenceMap: EvidenceMapEntry[] }> {
  const description = stripJobBoilerplate(job.description).slice(0, JOB_DESCRIPTION_CHARS);

  const requirements = toRequirements(
    await runStep<unknown>(ctx, step, {
      purpose: "tailor:extract",
      system: EXTRACT_SYSTEM,
      user: extractRequirementsPrompt({
        title: job.title,
        company: job.company,
        location: job.location,
        description,
      }),
      schema: EXTRACT_SCHEMA,
      schemaName: "job_requirements",
      maxTokens: EXTRACT_MAX_TOKENS,
    }),
  );

  // One list, deduplicated: a posting often repeats a must-have as a
  // nice-to-have, and asking about it twice costs tokens and reads badly.
  const allRequirements = lines(
    [...requirements.required, ...requirements.preferred],
    MAX_LIST_ENTRIES * 2,
  );

  const evidenceMap = toEvidenceMap(
    await runStep<unknown>(ctx, step, {
      purpose: "tailor:map",
      system: MAP_SYSTEM,
      user: mapEvidencePrompt({ requirements: allRequirements, facts }),
      schema: MAP_SCHEMA,
      schemaName: "evidence_map",
      maxTokens: MAP_MAX_TOKENS,
    }),
    allRequirements,
    evidenceIdSet(facts),
  );

  return { requirements, evidenceMap };
}

/**
 * Steps 6 and 7: the deterministic honesty pass, then a fresh reader on the
 * wording, then the honesty pass again so the flagged claims match what the
 * user is actually being shown.
 */
async function verifyAndReview(
  ctx: ActionCtx,
  step: StepContext,
  args: {
    input: Omit<VerifyInput, "rewrite" | "coverLetter">;
    rewrite: RewriteOutput;
    coverLetter: string;
  },
): Promise<{ verified: VerifyResult; coverLetter: string }> {
  const verified = verifyTailoring({
    ...args.input,
    rewrite: args.rewrite,
    coverLetter: args.coverLetter,
  });

  const tailored = verified.experiences
    .flatMap((experience) => experience.bullets)
    .filter((bullet) => bullet.text !== bullet.original);

  if (tailored.length === 0 && args.coverLetter.length === 0) {
    return { verified, coverLetter: args.coverLetter };
  }

  const rewrites = toReviewRewrites(
    await runStep<unknown>(ctx, step, {
      purpose: "tailor:review",
      system: REVIEW_SYSTEM,
      user: reviewPrompt({ bullets: tailored, coverLetter: args.coverLetter }),
      schema: REVIEW_SCHEMA,
      schemaName: "reviewer_notes",
      maxTokens: REVIEW_MAX_TOKENS,
      temperature: 0.2,
    }),
  );

  if (rewrites.size === 0) return { verified, coverLetter: args.coverLetter };

  const coverLetter = replaceOpeningSentence(args.coverLetter, rewrites.get(COVER_OPENING_ID));

  return {
    verified: verifyTailoring({
      ...args.input,
      rewrite: withReviewerRewrites(args.rewrite, rewrites),
      coverLetter,
    }),
    coverLetter,
  };
}

async function requireAccess(ctx: ActionCtx, userId: Id<"users">): Promise<void> {
  if (process.env.APPLY_COPILOT_REQUIRE_SUBSCRIPTION !== "true") return;

  const hasAccess = await ctx.runQuery(internal.draftSupport.hasApplyCopilotAccess, { userId });
  if (!hasAccess) {
    throw new Error("Apply Copilot requires an active subscription.");
  }
}

async function confirmedProfile(
  ctx: ActionCtx,
  userId: Id<"users">,
): Promise<Doc<"careerProfiles">> {
  const profile = await ctx.runQuery(internal.careerProfile.getForUser, { userId });
  if (!profile || profile.confirmedAt === undefined) {
    throw new Error(PROFILE_REQUIRED_MESSAGE);
  }
  if (profile.experiences.length === 0) {
    throw new Error("Add at least one role to your profile before tailoring.");
  }
  return profile;
}

async function jobForUser(
  ctx: ActionCtx,
  userId: Id<"users">,
  jobImportId: Id<"jobImports">,
): Promise<Doc<"jobImports">> {
  const job = await ctx.runQuery(internal.jobs.getForUser, { userId, jobImportId });
  if (!job) {
    throw new Error("Could not find that imported job.");
  }
  return job;
}

export const generateApplyKit = action({
  args: { jobImportId: v.id("jobImports") },
  handler: async (
    ctx,
    args,
  ): Promise<{ draftId: Id<"applicationDrafts">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    await requireAccess(ctx, userId);

    const job = await jobForUser(ctx, userId, args.jobImportId);
    const profile = await confirmedProfile(ctx, userId);
    const contact = await ctx.runQuery(internal.draftSupport.getProfileForUser, { userId });
    const applicationId = await ctx.runQuery(internal.draftSupport.getApplicationIdForJob, {
      userId,
      jobImportId: args.jobImportId,
    });

    const step: StepContext = {
      userId,
      applicationId,
      resolved: await resolveUserModel(ctx, userId),
      usage: [],
    };

    const facts = buildFactRegistry(profile);
    const { requirements, evidenceMap } = await readPosting(ctx, step, job, facts);

    // 3. Bullets only: employers, titles and dates are added back in code.
    const rewrite = toRewrite(
      await runStep<unknown>(ctx, step, {
        purpose: "tailor:rewrite",
        system: REWRITE_SYSTEM,
        user: rewriteResumePrompt({
          job,
          required: requirements.required,
          preferred: requirements.preferred,
          keywords: requirements.keywords,
          seniority: requirements.seniority,
          hardGates: requirements.hardGates,
          evidenceMap,
          experiences: profile.experiences,
          skills: profile.skills,
          currentSummary: profile.summary,
          writingStyle: profile.writingStyle,
        }),
        schema: REWRITE_SCHEMA,
        schemaName: "tailored_resume",
        maxTokens: REWRITE_MAX_TOKENS,
        temperature: 0.3,
      }),
    );

    // 4. The letter, from facts the evidence map already proved.
    const drafted = String(
      asRecord(
        await runStep<unknown>(ctx, step, {
          purpose: "tailor:cover",
          system: COVER_SYSTEM,
          user: coverLetterPrompt({
            job,
            required: requirements.required,
            evidenceMap,
            facts,
            writingStyle: profile.writingStyle,
          }),
          schema: COVER_SCHEMA,
          schemaName: "cover_letter",
          maxTokens: COVER_MAX_TOKENS,
          temperature: 0.3,
        }),
      ).coverLetter ?? "",
    ).trim();

    // 5. Screening answers: the bank first, a model draft only for the rest.
    const answers = await answerQuestions(ctx, step, {
      job,
      facts,
      bank: profile.answerBank,
      specs: questionSpecs(job.questions),
    });

    const { verified, coverLetter } = await verifyAndReview(ctx, step, {
      input: {
        facts,
        experiences: profile.experiences,
        profileText: profileHaystack(profile),
        allowedContext: [job.company, job.title],
        jobKeywords: requirements.keywords,
      },
      rewrite,
      coverLetter: drafted,
    });

    const optimizedResume = reassembleResume({
      contact: {
        fullName: contact?.fullName,
        email: contact?.email,
        phone: contact?.phone,
        location: contact?.location,
        links: contact?.links,
      },
      summary: verified.summary,
      profile,
      experiences: verified.experiences,
      skillsOrder: verified.skillsOrder,
    });

    const changeLog = toChangeLog(verified, evidenceMap);
    const pending = verified.flaggedClaims.filter((claim) => claim.status === "pending").length;
    const keywords = splitKeywords(requirements.keywords, optimizedResume);
    const totals = sumUsage(step.usage);

    return await ctx.runMutation(internal.draftSupport.saveGeneratedDraft, {
      userId,
      jobImportId: args.jobImportId,
      resumeSource: profile.sourceResumeText,
      atsScore: computeAtsScore(verified.report.issues.length, pending),
      matchScore: computeMatchScore(evidenceMap, requirements.required),
      missingKeywords: keywords.missing,
      presentKeywords: keywords.present,
      tailoredBullets: changeLog
        .filter((entry) => entry.rewritten !== entry.original)
        .map((entry) => entry.rewritten),
      optimizedResume,
      coverLetter,
      answerDrafts: toAnswerDrafts(answers),
      summary: verified.summary,
      changeLog,
      gaps: gapsFrom(evidenceMap, requirements.required),
      flaggedClaims: verified.flaggedClaims,
      evidenceMap,
      needsHuman: toNeedsHuman(answers),
      verifierReport: verified.report,
      provider: step.resolved.provider,
      model: step.resolved.model,
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
      costUsd: totals.costUsd,
      profileSnapshotAt: profile.updatedAt,
    });
  },
});

/** Re-runs one screening answer, normally after the user filled the bank. */
export const regenerateAnswer = action({
  args: { draftId: v.id("applicationDrafts"), question: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ answer: string; confidence: AnswerConfidence; sourceKey?: string }> => {
    const userId = await requireUserId(ctx);
    const draft = await ctx.runQuery(internal.draftSupport.getDraftForUser, {
      userId,
      draftId: args.draftId,
    });
    if (!draft) {
      throw new Error("Could not find that draft.");
    }

    const job = await jobForUser(ctx, userId, draft.jobImportId);
    const profile = await confirmedProfile(ctx, userId);
    const existing = draft.answerDrafts.find((entry) => entry.question === args.question);
    if (!existing) {
      throw new Error("That question is not part of this draft.");
    }

    const spec = questionSpecs(job.questions).find(
      (entry) => entry.question === args.question,
    ) ?? { question: args.question, required: existing.required, options: [] };

    const step: StepContext = {
      userId,
      applicationId: await ctx.runQuery(internal.draftSupport.getApplicationIdForJob, {
        userId,
        jobImportId: draft.jobImportId,
      }),
      resolved: await resolveUserModel(ctx, userId),
      usage: [],
    };

    const [answer] = await answerQuestions(ctx, step, {
      job,
      facts: buildFactRegistry(profile),
      bank: profile.answerBank,
      specs: [spec],
    });

    await ctx.runMutation(internal.draftSupport.saveAnswerDraft, {
      userId,
      draftId: args.draftId,
      question: args.question,
      answer: answer.answer,
      confidence: answer.confidence,
      sourceKey: answer.sourceKey,
      needsHuman: answer.needsHuman,
    });

    return {
      answer: answer.answer,
      confidence: answer.confidence,
      sourceKey: answer.sourceKey,
    };
  },
});
