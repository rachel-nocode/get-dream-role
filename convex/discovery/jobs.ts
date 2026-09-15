/**
 * The discovery queue: postings a scan found, the pre-filter scored, and the
 * user triages. Queries and mutations only, so the scan and scoring actions
 * can call in from the Node runtime.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { saveImportedJobRow } from "../jobs";
import {
  discoveredJobStatus,
  fitDimensions,
  jobSourceKind,
  type DiscoveredJobStatus,
  type JobSource,
  type JobSourceKind,
} from "../validators";

/** How much of a posting the scorer reads. */
export const SCORING_DESCRIPTION_CHARS = 4_000;

const LIST_CAP = 200;
const SCORING_CANDIDATE_CAP = 200;
const TOP_LIMIT = 5;

/** Statuses that say the user already decided: a rescan must not undo them. */
const USER_OWNED_STATUSES: DiscoveredJobStatus[] = ["saved", "dismissed", "imported"];

function isUserOwned(status: DiscoveredJobStatus): boolean {
  return USER_OWNED_STATUSES.includes(status);
}

const discoveredJobInput = v.object({
  externalId: v.string(),
  title: v.string(),
  company: v.string(),
  location: v.optional(v.string()),
  remote: v.boolean(),
  url: v.string(),
  applyUrl: v.string(),
  description: v.string(),
  postedAt: v.optional(v.number()),
  salaryMin: v.optional(v.number()),
  salaryMax: v.optional(v.number()),
  salaryCurrency: v.optional(v.string()),
  prefilterScore: v.number(),
});

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to see discovered jobs.");
  }
  return userId;
}

async function ownedJob(ctx: MutationCtx, userId: Id<"users">, jobId: Id<"discoveredJobs">) {
  const job = await ctx.db.get(jobId);
  if (!job || job.userId !== userId) {
    throw new Error("That job is not in your queue.");
  }
  return job;
}

/**
 * An imported job keeps exactly the source it came from. External ids are
 * only unique within one board or feed, so collapsing feeds together would
 * let two different postings share one import row.
 */
function importSourceFor(kind: JobSourceKind): JobSource {
  return kind;
}

function byScoreDescending(a: Doc<"discoveredJobs">, b: Doc<"discoveredJobs">): number {
  const fit = (b.fitScore ?? -1) - (a.fitScore ?? -1);
  return fit !== 0 ? fit : b.prefilterScore - a.prefilterScore;
}

export const list = query({
  args: {
    status: v.optional(discoveredJobStatus),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const status = args.status;
    const jobs = await (status === undefined
      ? ctx.db.query("discoveredJobs").withIndex("by_userId", (q) => q.eq("userId", userId))
      : ctx.db
          .query("discoveredJobs")
          .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", status))
    ).collect();

    const minScore = args.minScore ?? 0;

    return jobs
      .filter((job) => (job.fitScore ?? job.prefilterScore) >= minScore)
      .sort(byScoreDescending)
      .slice(0, LIST_CAP);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const jobs = await ctx.db
      .query("discoveredJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const counts = { new: 0, scored: 0, saved: 0, dismissed: 0, imported: 0 };
    for (const job of jobs) {
      counts[job.status] += 1;
    }

    return { ...counts, total: jobs.length };
  },
});

/** The best scored postings the user has not triaged yet, for the dashboard. */
export const top = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const jobs = await ctx.db
      .query("discoveredJobs")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "scored"))
      .take(LIST_CAP);

    return jobs
      .sort(byScoreDescending)
      .slice(0, Math.max(1, Math.round(args.limit ?? TOP_LIMIT)))
      .map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        fitScore: job.fitScore ?? job.prefilterScore,
      }));
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("discoveredJobs"),
    status: v.union(v.literal("saved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const job = await ownedJob(ctx, userId, args.id);

    if (job.status === "imported") {
      throw new Error("That job is already an application. Change it there instead.");
    }

    await ctx.db.patch(job._id, { status: args.status, updatedAt: Date.now() });
  },
});

/** Turns a discovered job into an imported job plus a draft application. */
export const importToApplication = mutation({
  args: { discoveredJobId: v.id("discoveredJobs") },
  handler: async (
    ctx,
    args,
  ): Promise<{ jobImportId: Id<"jobImports">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    const job = await ownedJob(ctx, userId, args.discoveredJobId);

    const saved = await saveImportedJobRow(ctx, {
      userId,
      source: importSourceFor(job.kind),
      url: job.url,
      externalId: job.externalId,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      applyUrl: job.applyUrl || job.url,
      questions: [],
    });

    await ctx.db.patch(job._id, {
      status: "imported",
      jobImportId: saved.jobImportId,
      updatedAt: Date.now(),
    });

    return saved;
  },
});

/**
 * Writes one source's postings. A posting the user already triaged keeps its
 * status, so a rescan can refresh the text without reopening a decision.
 */
export const upsertBatch = internalMutation({
  args: {
    userId: v.id("users"),
    sourceId: v.id("jobSources"),
    kind: jobSourceKind,
    jobs: v.array(discoveredJobInput),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const job of args.jobs) {
      const existing = await ctx.db
        .query("discoveredJobs")
        .withIndex("by_user_kind_external", (q) =>
          q.eq("userId", args.userId).eq("kind", args.kind).eq("externalId", job.externalId),
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { ...job, sourceId: args.sourceId, updatedAt: now });
        updated += 1;
        continue;
      }

      await ctx.db.insert("discoveredJobs", {
        ...job,
        userId: args.userId,
        sourceId: args.sourceId,
        kind: args.kind,
        status: "new",
        discoveredAt: now,
        updatedAt: now,
      });
      inserted += 1;
    }

    return { inserted, updated };
  },
});

/** The best unscored jobs, trimmed to what the scorer actually reads. */
export const listForScoring = internalQuery({
  args: { userId: v.id("users"), limit: v.number(), threshold: v.number() },
  handler: async (ctx: QueryCtx, args) => {
    // Range over the prefilter score so jobs under the threshold, which stay
    // "new" forever, can never crowd out a strong posting that arrived later.
    const candidates = await ctx.db
      .query("discoveredJobs")
      .withIndex("by_user_status_prefilter", (q) =>
        q.eq("userId", args.userId).eq("status", "new").gte("prefilterScore", args.threshold),
      )
      .order("desc")
      .take(SCORING_CANDIDATE_CAP);

    return candidates
      .filter((job) => job.fitScore === undefined)
      .slice(0, Math.max(0, Math.round(args.limit)))
      .map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        prefilterScore: job.prefilterScore,
        description: job.description.slice(0, SCORING_DESCRIPTION_CHARS),
      }));
  },
});

export const applyScore = internalMutation({
  args: {
    jobId: v.id("discoveredJobs"),
    fitScore: v.number(),
    dimensions: fitDimensions,
    reasons: v.array(v.string()),
    hardGateFails: v.array(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    await ctx.db.patch(job._id, {
      fitScore: args.fitScore,
      fitDimensions: args.dimensions,
      fitReasons: args.reasons,
      hardGateFails: args.hardGateFails,
      status: isUserOwned(job.status) ? job.status : "scored",
      updatedAt: Date.now(),
    });
  },
});
