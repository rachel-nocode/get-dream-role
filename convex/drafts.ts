"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { ActionCtx, action } from "./_generated/server";
import { generateJson, type JsonSchema } from "./ai/client";
import { resolveUserModel } from "./ai/resolve";

type GeneratedDraft = {
  atsScore: number;
  matchScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  tailoredBullets: string[];
  optimizedResume: string;
  coverLetter: string;
  answerDrafts: Array<{
    question: string;
    answer: string;
    required: boolean;
  }>;
  summary: string;
};

const DRAFT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    atsScore: { type: "number", description: "ATS compatibility from 0 to 100" },
    matchScore: { type: "number", description: "Keyword match from 0 to 100" },
    missingKeywords: { type: "array", items: { type: "string" } },
    presentKeywords: { type: "array", items: { type: "string" } },
    tailoredBullets: { type: "array", items: { type: "string" } },
    optimizedResume: { type: "string" },
    coverLetter: { type: "string" },
    answerDrafts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
          required: { type: "boolean" },
        },
      },
    },
    summary: { type: "string" },
  },
};

const SYSTEM_PROMPT = `You are GetDreamRole Apply Copilot. Generate application materials that improve fit while staying honest.

Rules:
- Never fabricate employers, degrees, titles, metrics, or skills.
- If a needed detail is absent, phrase it as a suggested placeholder the user should verify.
- Keep the cover letter human, specific, and under 260 words.
- Draft application answers only for questions provided by the job board.
- Scores are integers from 0 to 100.`;

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to generate an application pack.");
  }
  return userId;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function clampScore(value: unknown) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeGeneratedDraft(value: unknown): GeneratedDraft {
  if (typeof value !== "object" || value === null) {
    throw new Error("The model returned an invalid draft.");
  }

  const record = value as Record<string, unknown>;
  const answerDrafts = Array.isArray(record.answerDrafts)
    ? record.answerDrafts
        .filter((item): item is Record<string, unknown> => {
          return typeof item === "object" && item !== null;
        })
        .map((item) => ({
          question: String(item.question ?? ""),
          answer: String(item.answer ?? ""),
          required: Boolean(item.required),
        }))
        .filter((item) => item.question.length > 0 || item.answer.length > 0)
    : [];

  return {
    atsScore: clampScore(record.atsScore),
    matchScore: clampScore(record.matchScore),
    missingKeywords: asStringArray(record.missingKeywords),
    presentKeywords: asStringArray(record.presentKeywords),
    tailoredBullets: asStringArray(record.tailoredBullets),
    optimizedResume: String(record.optimizedResume ?? ""),
    coverLetter: String(record.coverLetter ?? ""),
    answerDrafts,
    summary: String(record.summary ?? ""),
  };
}

function buildUserPrompt(args: {
  resumeSource: string;
  jobTitle: string;
  company: string;
  location?: string;
  description: string;
  questions: Array<{ label: string; required: boolean }>;
}) {
  return `JOB
Title: ${args.jobTitle}
Company: ${args.company}
Location: ${args.location ?? "Not specified"}

Description:
${args.description}

Questions:
${JSON.stringify(args.questions)}

Candidate resume/source material:
${args.resumeSource}`;
}

export const generateForJob = action({
  args: {
    jobImportId: v.id("jobImports"),
    resumeSource: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ draftId: Id<"applicationDrafts">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    const job = (await ctx.runQuery(internal.jobs.getForUser, {
      userId,
      jobImportId: args.jobImportId,
    })) as Doc<"jobImports"> | null;

    if (!job) {
      throw new Error("Could not find that imported job.");
    }

    const profile = (await ctx.runQuery(internal.draftSupport.getProfileForUser, {
      userId,
    })) as Doc<"profiles"> | null;
    const resumeSource: string = (args.resumeSource ?? profile?.resumeText ?? "").trim();
    if (!resumeSource) {
      throw new Error("Add resume text before generating a draft.");
    }

    if (process.env.APPLY_COPILOT_REQUIRE_SUBSCRIPTION === "true") {
      const hasAccess = await ctx.runQuery(internal.draftSupport.hasApplyCopilotAccess, {
        userId,
      });
      if (!hasAccess) {
        throw new Error("Apply Copilot requires an active subscription.");
      }
    }

    const resolved = await resolveUserModel(ctx, userId);
    const completion = await generateJson<unknown>({
      provider: resolved.provider,
      model: resolved.model,
      apiKey: resolved.apiKey,
      system: SYSTEM_PROMPT,
      user: buildUserPrompt({
        resumeSource,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        questions: job.questions.map((question: Doc<"jobImports">["questions"][number]) => ({
          label: question.label,
          required: question.required,
        })),
      }),
      schema: DRAFT_SCHEMA,
      schemaName: "application_draft",
      maxTokens: 4096,
      temperature: 0.35,
    });

    const saved = (await ctx.runMutation(internal.draftSupport.saveGeneratedDraft, {
      userId,
      jobImportId: args.jobImportId,
      resumeSource,
      ...normalizeGeneratedDraft(completion.data),
    })) as { draftId: Id<"applicationDrafts">; applicationId: Id<"applications"> };

    await ctx.runMutation(internal.aiSettings.recordUsage, {
      userId,
      provider: completion.provider,
      model: completion.model,
      purpose: "tailor",
      inputTokens: completion.usage.inputTokens,
      outputTokens: completion.usage.outputTokens,
      costUsd: completion.costUsd,
      applicationId: saved.applicationId,
    });

    return saved;
  },
});
