/**
 * The master profile: a fact registry parsed from the resume and confirmed by
 * the user. Everything later phases claim about the candidate has to come from
 * here, which is why entries carry short stable ids.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { withBulletIds, withEntryIds } from "./lib/profileIds";
import {
  certificationEntry,
  educationEntry,
  experienceEntry,
  jobPreferences,
  projectEntry,
  skillEntry,
  type AnswerBankEntry,
  type CertificationEntry,
  type EducationEntry,
  type ExperienceEntry,
  type JobPreferences,
  type ProjectEntry,
  type SkillEntry,
} from "./validators";

/** Screening questions every applicant meets, seeded empty for the user. */
export const ANSWER_BANK_SEED: Array<{ key: string; question: string }> = [
  { key: "work_authorization", question: "Are you legally authorized to work where this role is based?" },
  { key: "needs_sponsorship", question: "Do you now or will you in future need visa sponsorship?" },
  { key: "relocation", question: "Are you willing to relocate for the right role?" },
  { key: "start_date", question: "How soon could you start?" },
  { key: "salary_expectation", question: "What are your salary expectations?" },
  { key: "notice_period", question: "What notice do you have to give your current employer?" },
  { key: "years_experience", question: "How many years of relevant experience do you have?" },
  { key: "highest_degree", question: "What is your highest completed degree?" },
  { key: "security_clearance", question: "Do you hold an active security clearance?" },
  { key: "why_leaving", question: "Why are you leaving your current role?" },
  { key: "referral_source", question: "How did you hear about this role?" },
];

export const DEFAULT_PREFERENCES: JobPreferences = {
  targetTitles: [],
  locations: [],
  remote: "any",
  employmentTypes: [],
  dealBreakers: [],
  mustHaves: [],
};

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to edit your profile.");
  }
  return userId;
}

function cleanText(value: string | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function positiveNumber(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (trimmed.length === 0 || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function normalizeExperiences(entries: ExperienceEntry[]): ExperienceEntry[] {
  const kept = entries.filter(
    (entry) => entry.company.trim().length > 0 || entry.title.trim().length > 0,
  );
  const bulletIds = new Set<string>();

  return withEntryIds(kept, "exp").map((entry, index) => ({
    id: entry.id,
    company: entry.company.trim(),
    title: entry.title.trim(),
    location: cleanText(entry.location),
    startDate: entry.startDate.trim(),
    endDate: cleanText(entry.endDate),
    bullets: withBulletIds(
      entry.bullets.filter((bullet) => bullet.text.trim().length > 0),
      index,
      bulletIds,
    ).map((bullet) => ({ id: bullet.id, text: bullet.text.trim() })),
  }));
}

function normalizeSkills(entries: SkillEntry[]): SkillEntry[] {
  const kept = entries.filter((entry) => entry.name.trim().length > 0);
  return withEntryIds(kept, "sk").map((entry) => ({
    id: entry.id,
    name: entry.name.trim(),
    category: cleanText(entry.category),
    years: positiveNumber(entry.years),
  }));
}

function normalizeEducation(entries: EducationEntry[]): EducationEntry[] {
  const kept = entries.filter(
    (entry) => entry.school.trim().length > 0 || entry.degree.trim().length > 0,
  );
  return withEntryIds(kept, "edu").map((entry) => ({
    id: entry.id,
    school: entry.school.trim(),
    degree: entry.degree.trim(),
    field: cleanText(entry.field),
    year: cleanText(entry.year),
  }));
}

function normalizeCertifications(entries: CertificationEntry[]): CertificationEntry[] {
  const kept = entries.filter((entry) => entry.name.trim().length > 0);
  return withEntryIds(kept, "cert").map((entry) => ({
    id: entry.id,
    name: entry.name.trim(),
    issuer: cleanText(entry.issuer),
    year: cleanText(entry.year),
  }));
}

function normalizeProjects(entries: ProjectEntry[]): ProjectEntry[] {
  const kept = entries.filter((entry) => entry.name.trim().length > 0);
  return withEntryIds(kept, "proj").map((entry) => ({
    id: entry.id,
    name: entry.name.trim(),
    description: entry.description.trim(),
    link: cleanText(entry.link),
  }));
}

function normalizePreferences(preferences: JobPreferences): JobPreferences {
  return {
    targetTitles: cleanList(preferences.targetTitles),
    locations: cleanList(preferences.locations),
    remote: preferences.remote,
    salaryMin: positiveNumber(preferences.salaryMin),
    salaryCurrency: cleanText(preferences.salaryCurrency)?.toUpperCase(),
    employmentTypes: cleanList(preferences.employmentTypes),
    dealBreakers: cleanList(preferences.dealBreakers),
    mustHaves: cleanList(preferences.mustHaves),
  };
}

/** Keeps the user's answers and adds any seed question they do not have yet. */
export function mergeAnswerBank(existing: AnswerBankEntry[]): AnswerBankEntry[] {
  const byKey = new Map(existing.map((entry) => [entry.key, entry]));

  const seeded = ANSWER_BANK_SEED.map((seed) => {
    const saved = byKey.get(seed.key);
    byKey.delete(seed.key);
    return {
      id: `ans_${seed.key}`,
      key: seed.key,
      question: saved?.question.trim() || seed.question,
      answer: saved?.answer.trim() ?? "",
    };
  });

  // Anything the user added beyond the seeded set stays, in its own order.
  return [...seeded, ...byKey.values()];
}

function emptyProfileFields(userId: Id<"users">, now: number) {
  return {
    userId,
    experiences: [],
    skills: [],
    education: [],
    certifications: [],
    projects: [],
    preferences: DEFAULT_PREFERENCES,
    answerBank: mergeAnswerBank([]),
    sourceResumeText: "",
    createdAt: now,
    updatedAt: now,
  };
}

async function profileForUser(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("careerProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await profileForUser(ctx, userId);
    if (!profile) return null;

    return { ...profile, answerBank: mergeAnswerBank(profile.answerBank) };
  },
});

/** Full replace of whichever sections are sent; the rest are left alone. */
export const upsert = mutation({
  args: {
    experiences: v.optional(v.array(experienceEntry)),
    skills: v.optional(v.array(skillEntry)),
    education: v.optional(v.array(educationEntry)),
    certifications: v.optional(v.array(certificationEntry)),
    projects: v.optional(v.array(projectEntry)),
    summary: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    preferences: v.optional(jobPreferences),
    sourceResumeText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await profileForUser(ctx, userId);

    const patch = {
      ...(args.experiences ? { experiences: normalizeExperiences(args.experiences) } : {}),
      ...(args.skills ? { skills: normalizeSkills(args.skills) } : {}),
      ...(args.education ? { education: normalizeEducation(args.education) } : {}),
      ...(args.certifications
        ? { certifications: normalizeCertifications(args.certifications) }
        : {}),
      ...(args.projects ? { projects: normalizeProjects(args.projects) } : {}),
      ...(args.summary === undefined ? {} : { summary: cleanText(args.summary) }),
      ...(args.writingStyle === undefined ? {} : { writingStyle: cleanText(args.writingStyle) }),
      ...(args.preferences ? { preferences: normalizePreferences(args.preferences) } : {}),
      ...(args.sourceResumeText === undefined
        ? {}
        : { sourceResumeText: args.sourceResumeText.trim() }),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("careerProfiles", {
      ...emptyProfileFields(userId, now),
      ...patch,
    });
  },
});

export const confirm = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await profileForUser(ctx, userId);
    if (!existing) {
      throw new Error("Parse or fill in your profile before confirming it.");
    }
    if (existing.experiences.length === 0 && existing.skills.length === 0) {
      throw new Error("Add at least one role or skill before confirming your profile.");
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, { confirmedAt: now, updatedAt: now });
    return now;
  },
});

export const updateAnswer = mutation({
  args: { key: v.string(), answer: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await profileForUser(ctx, userId);
    if (!existing) {
      throw new Error("Create your profile before answering screening questions.");
    }

    const key = args.key.trim();
    const answer = args.answer.trim();
    const merged = mergeAnswerBank(existing.answerBank);
    const found = merged.some((entry) => entry.key === key);
    if (!found) {
      throw new Error("That screening question is not in your answer bank.");
    }

    await ctx.db.patch(existing._id, {
      answerBank: merged.map((entry) => (entry.key === key ? { ...entry, answer } : entry)),
      updatedAt: Date.now(),
    });
  },
});

export const getForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await profileForUser(ctx, args.userId);
  },
});

/**
 * Stores a freshly parsed registry. Preferences, the answer bank and the
 * writing style are the user's own work, so a re-parse never touches them,
 * and the profile always needs confirming again afterwards.
 */
export const saveParsed = internalMutation({
  args: {
    userId: v.id("users"),
    sourceResumeText: v.string(),
    summary: v.optional(v.string()),
    experiences: v.array(experienceEntry),
    skills: v.array(skillEntry),
    education: v.array(educationEntry),
    certifications: v.array(certificationEntry),
    projects: v.array(projectEntry),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    const existing = await profileForUser(ctx, args.userId);

    const parsed = {
      experiences: normalizeExperiences(args.experiences),
      skills: normalizeSkills(args.skills),
      education: normalizeEducation(args.education),
      certifications: normalizeCertifications(args.certifications),
      projects: normalizeProjects(args.projects),
      summary: cleanText(args.summary),
      sourceResumeText: args.sourceResumeText.trim(),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...parsed, confirmedAt: undefined });
      return existing._id;
    }

    return await ctx.db.insert("careerProfiles", {
      ...emptyProfileFields(args.userId, now),
      ...parsed,
    });
  },
});
