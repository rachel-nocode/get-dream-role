"use node";

/**
 * Scanning sources and scoring what they return.
 *
 * Runs in the Node runtime because scoring goes through the shared AI client.
 * Every read and write goes through the internal queries and mutations in
 * `discovery/sources.ts` and `discovery/jobs.ts`.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, action, internalAction } from "../_generated/server";
import { AiError, generateJson, type JsonSchema } from "../ai/client";
import { resolveUserModel, type ResolvedModel } from "../ai/resolve";
import type { JobPreferences } from "../validators";
import { fetchSource, type NormalizedJob } from "./fetchers";
import {
  DEFAULT_SCORE_BATCH,
  MAX_SCORE_BATCH,
  PREFILTER_LLM_THRESHOLD,
  dedupeKey,
  prefilterScoreFor,
} from "./prefilter";

/** Scoring calls run a few at a time: enough to be quick, not enough to burst. */
const SCORE_CONCURRENCY = 3;
const SCORE_MAX_TOKENS = 600;
const MAX_REASONS = 3;
const MAX_REASON_CHARS = 120;
const MAX_HARD_GATES = 5;
const SKILL_SUMMARY_LIMIT = 25;
const RECENT_ROLE_LIMIT = 3;

/** A hard gate the candidate fails caps the score, whatever the model said. */
const HARD_GATE_SCORE_CAP = 30;

export type ScanSummary = {
  scanned: number;
  inserted: number;
  updated: number;
  errors: Array<{ label: string; message: string }>;
};

export type ScoreSummary = {
  scored: number;
  skippedForBudget: number;
  costUsd: number;
};

type ScoringCandidate = {
  id: Id<"discoveredJobs">;
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  prefilterScore: number;
  description: string;
};

type ScoreVerdict = {
  fitScore: number;
  dimensions: {
    skills: number;
    level: number;
    location: number;
    compensation: number;
    trajectory: number;
  };
  reasons: string[];
  hardGateFails: string[];
};

const SCORE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    fitScore: { type: "number", description: "Overall fit from 0 to 100" },
    dimensions: {
      type: "object",
      properties: {
        skills: { type: "number" },
        level: { type: "number" },
        location: { type: "number" },
        compensation: { type: "number" },
        trajectory: { type: "number" },
      },
    },
    reasons: {
      type: "array",
      description: "At most three short reasons, each under 120 characters",
      items: { type: "string" },
    },
    hardGateFails: {
      type: "array",
      description: "Requirements the candidate clearly cannot meet, or empty",
      items: { type: "string" },
    },
  },
};

const SCORE_SYSTEM = `You score how well one job fits one candidate. You are the cheap gate before anything is written, so be decisive and honest.

Rules:
- Score 0-100 on skills, level, location, compensation and trajectory, then an overall fitScore.
- Judge only from the profile given. Never assume a skill, a visa status or a salary the profile does not state.
- A hard gate is a stated requirement the candidate clearly cannot meet: a missing must-have, a deal-breaker the posting requires, a location the candidate ruled out, or pay below their floor. List it in hardGateFails.
- Give at most three reasons, each a short phrase under 120 characters, specific to this posting.
- No hedging, no marketing language, no advice.`;

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to scan for jobs.");
  }
  return userId;
}

function userMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function chunked<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function clampScore(value: unknown): number {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function shortLines(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry ?? "").trim().slice(0, MAX_REASON_CHARS))
    .filter((entry) => entry.length > 0)
    .slice(0, limit);
}

function toVerdict(value: unknown): ScoreVerdict {
  const record = (typeof value === "object" && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  const rawDimensions = (
    typeof record.dimensions === "object" && record.dimensions !== null
      ? record.dimensions
      : {}
  ) as Record<string, unknown>;

  const hardGateFails = shortLines(record.hardGateFails, MAX_HARD_GATES);
  const fitScore = clampScore(record.fitScore);

  return {
    // A failed hard gate caps the score in code, not in the prompt.
    fitScore: hardGateFails.length > 0 ? Math.min(fitScore, HARD_GATE_SCORE_CAP) : fitScore,
    dimensions: {
      skills: clampScore(rawDimensions.skills),
      level: clampScore(rawDimensions.level),
      location: clampScore(rawDimensions.location),
      compensation: clampScore(rawDimensions.compensation),
      trajectory: clampScore(rawDimensions.trajectory),
    },
    reasons: shortLines(record.reasons, MAX_REASONS),
    hardGateFails,
  };
}

// --- scanning ---------------------------------------------------------------

async function scanForUser(
  ctx: ActionCtx,
  userId: Id<"users">,
  sourceId?: Id<"jobSources">,
): Promise<ScanSummary> {
  const sources = await ctx.runQuery(internal.discovery.sources.listEnabledForUser, {
    userId,
    sourceId,
  });
  const profile = await ctx.runQuery(internal.careerProfile.getForUser, { userId });
  const preferences: JobPreferences | null = profile?.preferences ?? null;
  const searchTitle = preferences?.targetTitles[0];

  const summary: ScanSummary = { scanned: 0, inserted: 0, updated: 0, errors: [] };
  const seen = new Set<string>();
  const now = Date.now();

  for (const source of sources) {
    try {
      const postings = await fetchSource(source.kind, source.identifier, { searchTitle });
      const jobs: Array<NormalizedJob & { prefilterScore: number }> = [];

      for (const posting of postings) {
        const key = dedupeKey(posting);
        if (seen.has(key)) continue;
        seen.add(key);
        jobs.push({ ...posting, prefilterScore: prefilterScoreFor(posting, preferences, now) });
      }

      const written = await ctx.runMutation(internal.discovery.jobs.upsertBatch, {
        userId,
        sourceId: source._id,
        kind: source.kind,
        jobs,
      });

      summary.scanned += postings.length;
      summary.inserted += written.inserted;
      summary.updated += written.updated;

      await ctx.runMutation(internal.discovery.sources.recordScan, {
        sourceId: source._id,
        scannedAt: Date.now(),
        count: jobs.length,
      });
    } catch (error) {
      // One board being down must not stop the rest of the scan.
      const message = userMessage(error);
      summary.errors.push({ label: source.label, message });
      await ctx.runMutation(internal.discovery.sources.recordScan, {
        sourceId: source._id,
        scannedAt: Date.now(),
        error: message,
      });
    }
  }

  return summary;
}

// --- scoring ----------------------------------------------------------------

function yearsOfExperience(profile: Doc<"careerProfiles">): string {
  const answered = profile.answerBank.find((entry) => entry.key === "years_experience")?.answer;
  if (answered && answered.trim().length > 0) return answered.trim();

  const years = profile.experiences
    .map((entry) => Number(entry.startDate.match(/\d{4}/)?.[0]))
    .filter((year) => Number.isFinite(year));
  if (years.length === 0) return "not stated";

  return `about ${Math.max(1, new Date().getFullYear() - Math.min(...years))}`;
}

function profileSummary(profile: Doc<"careerProfiles">): string {
  const preferences = profile.preferences;
  const skills = profile.skills.slice(0, SKILL_SUMMARY_LIMIT).map((skill) => skill.name);
  const recentRoles = profile.experiences
    .slice(0, RECENT_ROLE_LIMIT)
    .map((entry) => `${entry.title} at ${entry.company} (${entry.startDate}-${entry.endDate ?? "Present"})`);

  return [
    `Target titles: ${preferences.targetTitles.join(", ") || "not stated"}`,
    `Years of experience: ${yearsOfExperience(profile)}`,
    `Recent roles: ${recentRoles.join("; ") || "not stated"}`,
    `Skills: ${skills.join(", ") || "not stated"}`,
    `Work setup: ${preferences.remote}`,
    `Locations: ${preferences.locations.join(", ") || "not stated"}`,
    `Salary floor: ${
      preferences.salaryMin === undefined
        ? "not stated"
        : `${preferences.salaryMin} ${preferences.salaryCurrency ?? "USD"}`
    }`,
    `Must haves: ${preferences.mustHaves.join(", ") || "none"}`,
    `Deal breakers: ${preferences.dealBreakers.join(", ") || "none"}`,
  ].join("\n");
}

function jobPrompt(job: ScoringCandidate): string {
  const salary =
    job.salaryMin === undefined && job.salaryMax === undefined
      ? "not published"
      : `${job.salaryMin ?? "?"} to ${job.salaryMax ?? "?"} ${job.salaryCurrency ?? ""}`.trim();

  return [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    `Location: ${job.location ?? "not stated"}`,
    `Remote: ${job.remote ? "yes" : "no"}`,
    `Salary: ${salary}`,
    "",
    "Description:",
    job.description,
  ].join("\n");
}

type ScoredJob =
  | { ok: true; job: ScoringCandidate; verdict: ScoreVerdict; costUsd: number; inputTokens: number; outputTokens: number }
  | { ok: false; job: ScoringCandidate; message: string };

async function scoreOne(
  job: ScoringCandidate,
  summary: string,
  resolved: ResolvedModel,
): Promise<ScoredJob> {
  try {
    const completion = await generateJson<unknown>({
      provider: resolved.provider,
      model: resolved.model,
      apiKey: resolved.apiKey,
      system: SCORE_SYSTEM,
      user: `CANDIDATE\n${summary}\n\nJOB\n${jobPrompt(job)}`,
      schema: SCORE_SCHEMA,
      schemaName: "job_fit_score",
      maxTokens: SCORE_MAX_TOKENS,
      temperature: 0,
    });

    return {
      ok: true,
      job,
      verdict: toVerdict(completion.data),
      costUsd: completion.costUsd,
      inputTokens: completion.usage.inputTokens,
      outputTokens: completion.usage.outputTokens,
    };
  } catch (error) {
    // A bad key or a rate limit affects every job, so it stops the run.
    if (error instanceof AiError && (error.kind === "auth" || error.kind === "rate_limit")) {
      throw error;
    }
    return { ok: false, job, message: userMessage(error) };
  }
}

async function scoreForUser(
  ctx: ActionCtx,
  userId: Id<"users">,
  limit: number,
): Promise<ScoreSummary> {
  const profile = await ctx.runQuery(internal.careerProfile.getForUser, { userId });
  if (!profile) {
    throw new Error("Add your profile first so we have something to score jobs against.");
  }

  const batch = Number.isFinite(limit)
    ? Math.max(1, Math.min(MAX_SCORE_BATCH, Math.round(limit)))
    : DEFAULT_SCORE_BATCH;
  const candidates: ScoringCandidate[] = await ctx.runQuery(
    internal.discovery.jobs.listForScoring,
    { userId, limit: batch, threshold: PREFILTER_LLM_THRESHOLD },
  );
  if (candidates.length === 0) {
    return { scored: 0, skippedForBudget: 0, costUsd: 0 };
  }

  const { budgetUsd } = await ctx.runQuery(internal.aiSettings.scoringBudget, { userId });
  const spentToday = await ctx.runQuery(internal.aiSettings.usageToday, {
    userId,
    purpose: "score",
  });

  let remainingUsd = budgetUsd - spentToday.costUsd;
  if (remainingUsd <= 0) {
    return { scored: 0, skippedForBudget: candidates.length, costUsd: 0 };
  }

  const resolved = await resolveUserModel(ctx, userId);
  const summary = profileSummary(profile);

  let scored = 0;
  let attempted = 0;
  let costUsd = 0;
  let firstFailure: string | null = null;

  for (const chunk of chunked(candidates, SCORE_CONCURRENCY)) {
    if (remainingUsd <= 0) break;

    const results = await Promise.all(chunk.map((job) => scoreOne(job, summary, resolved)));
    attempted += chunk.length;

    for (const result of results) {
      if (!result.ok) {
        firstFailure = firstFailure ?? result.message;
        continue;
      }

      await ctx.runMutation(internal.discovery.jobs.applyScore, {
        jobId: result.job.id,
        fitScore: result.verdict.fitScore,
        dimensions: result.verdict.dimensions,
        reasons: result.verdict.reasons,
        hardGateFails: result.verdict.hardGateFails,
      });

      await ctx.runMutation(internal.aiSettings.recordUsage, {
        userId,
        provider: resolved.provider,
        model: resolved.model,
        purpose: "score",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: result.costUsd,
      });

      scored += 1;
      costUsd += result.costUsd;
      remainingUsd -= result.costUsd;
    }
  }

  if (scored === 0 && firstFailure !== null) {
    throw new Error(firstFailure);
  }

  return {
    scored,
    skippedForBudget: candidates.length - attempted,
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
  };
}

// --- entry points -----------------------------------------------------------

export const scanSources = action({
  args: { sourceId: v.optional(v.id("jobSources")) },
  handler: async (ctx, args): Promise<ScanSummary> => {
    const userId = await requireUserId(ctx);
    return await scanForUser(ctx, userId, args.sourceId);
  },
});

export const scoreJobs = action({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<ScoreSummary> => {
    const userId = await requireUserId(ctx);
    return await scoreForUser(ctx, userId, args.limit ?? DEFAULT_SCORE_BATCH);
  },
});

/** Daily cron: scan every watched source, then score the best new jobs. */
export const scanAndScoreAll = internalAction({
  args: {},
  handler: async (ctx): Promise<{ users: number; scanned: number; scored: number }> => {
    const userIds = await ctx.runQuery(internal.discovery.sources.listActiveUserIds, {});
    let users = 0;
    let scanned = 0;
    let scored = 0;

    for (const userId of userIds) {
      try {
        const scan = await scanForUser(ctx, userId);
        const score = await scoreForUser(ctx, userId, DEFAULT_SCORE_BATCH);
        users += 1;
        scanned += scan.scanned;
        scored += score.scored;
      } catch (error) {
        console.error(`Daily discovery run skipped a user: ${userMessage(error)}`);
      }
    }

    return { users, scanned, scored };
  },
});
