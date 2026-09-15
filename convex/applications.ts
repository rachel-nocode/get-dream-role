/**
 * The tracker: the pipeline row for one application, everything that has
 * happened to it, and the rails around marking one submitted.
 *
 * Statuses are normalized on the way out, so a row written before the pipeline
 * existed reads as the stage it is really in, and only new literals are ever
 * written back.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  DEFAULT_DAILY_SUBMIT_CAP,
  FIRST_FOLLOWUP_DAYS,
  MAX_FOLLOWUPS,
  SECOND_FOLLOWUP_DAYS,
  canSubmit,
  companyKeyFor,
} from "./lib/caps";
import {
  awaitsReply,
  isOpen,
  normalizeStatus,
  statusLabel,
  type PipelineStatus,
} from "./lib/status";
import { manualApplicationStatus, type ActivityType } from "./validators";

const DAY_MS = 24 * 60 * 60 * 1000;

const THANK_YOU_DAYS = 1;
const GHOST_AFTER_DAYS = 30;
const GHOST_SCAN_CAP = 500;
const ACTIVITY_LIMIT = 100;
const SNOOZE_MAX_DAYS = 60;
const NOTE_MAX_CHARS = 4_000;

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to view applications.");
  }
  return userId;
}

async function ownedApplication(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  applicationId: Id<"applications">,
): Promise<Doc<"applications">> {
  const application = await ctx.db.get(applicationId);
  if (!application || application.userId !== userId) {
    throw new Error("Application not found.");
  }
  return application;
}

function startOfUtcDay(timestamp: number): number {
  return Math.floor(timestamp / DAY_MS) * DAY_MS;
}

/** The status every reader sees: old literals mapped onto the pipeline. */
function withPipelineStatus(application: Doc<"applications">) {
  return { ...application, status: normalizeStatus(application.status) };
}

function daysInStage(application: Doc<"applications">, now: number): number {
  const since = application.lastStatusChangeAt ?? application.updatedAt;
  return Math.max(0, Math.floor((now - since) / DAY_MS));
}

/** One line in the history of an application. */
export async function logActivity(
  ctx: MutationCtx,
  entry: {
    userId: Id<"users">;
    applicationId: Id<"applications">;
    type: ActivityType;
    message: string;
    payload?: unknown;
  },
): Promise<void> {
  await ctx.db.insert("activityLog", {
    userId: entry.userId,
    applicationId: entry.applicationId,
    type: entry.type,
    message: entry.message,
    ...(entry.payload === undefined ? {} : { payload: entry.payload }),
    createdAt: Date.now(),
  });
}

/** Rows written before `companyKey` existed fall back to the imported job. */
async function companyKeyOf(
  ctx: QueryCtx | MutationCtx,
  application: Doc<"applications">,
): Promise<string> {
  if (application.companyKey) return application.companyKey;
  const job = await ctx.db.get(application.jobImportId);
  return job ? companyKeyFor(job.company) : "";
}

// --- reading ----------------------------------------------------------------

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      applications.map(async (application) => {
        const job = await ctx.db.get(application.jobImportId);
        const draft = application.draftId
          ? await ctx.db.get(application.draftId)
          : null;

        return {
          application: withPipelineStatus(application),
          job,
          draft,
          daysInStage: daysInStage(application, now),
          nextActionAt: application.nextActionAt ?? null,
          nextActionLabel: application.nextActionLabel ?? null,
          followupCount: application.followupCount ?? 0,
        };
      }),
    );
  },
});

export const get = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) return null;

    const job = await ctx.db.get(application.jobImportId);
    const draft = application.draftId ? await ctx.db.get(application.draftId) : null;

    return { application: withPipelineStatus(application), job, draft };
  },
});

export const activity = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) return [];

    return await ctx.db
      .query("activityLog")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")
      .take(ACTIVITY_LIMIT);
  },
});

/** Follow-ups and thank-yous that are due, soonest first. */
export const dueActions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const due = applications
      .filter(
        (application) =>
          application.nextActionAt !== undefined &&
          application.nextActionAt <= now &&
          isOpen(application.status),
      )
      .sort((a, b) => (a.nextActionAt ?? 0) - (b.nextActionAt ?? 0));

    return await Promise.all(
      due.map(async (application) => {
        const job = await ctx.db.get(application.jobImportId);
        return {
          applicationId: application._id,
          title: job?.title ?? "Untitled role",
          company: job?.company ?? "Unknown company",
          status: normalizeStatus(application.status),
          dueAt: application.nextActionAt ?? now,
          label: application.nextActionLabel ?? "Follow up",
        };
      }),
    );
  },
});

async function dailyCapFor(ctx: QueryCtx | MutationCtx, userId: Id<"users">): Promise<number> {
  const settings = await ctx.db
    .query("aiSettings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  return settings?.dailySubmitCap ?? DEFAULT_DAILY_SUBMIT_CAP;
}

async function submittedTodayFor(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<number> {
  // Count by the submit time, not the current stage: an application that
  // moved on to "interview" the same afternoon still spent today's budget.
  const dayStart = startOfUtcDay(now);
  const submitted = await ctx.db
    .query("applications")
    .withIndex("by_user_submittedAt", (q) =>
      q.eq("userId", userId).gte("submittedAt", dayStart),
    )
    .collect();

  return submitted.length;
}

/** What the apply kit shows next to "Mark submitted". */
export const submitBudget = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const dailyCap = await dailyCapFor(ctx, userId);
    const submittedToday = await submittedTodayFor(ctx, userId, now);

    return {
      submittedToday,
      dailyCap,
      remaining: Math.max(0, dailyCap - submittedToday),
    };
  },
});

// --- moving through the pipeline --------------------------------------------

export const markOpened = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ownedApplication(ctx, userId, args.applicationId);

    const now = Date.now();
    const status = normalizeStatus(application.status);
    // Opening the form is progress out of "drafted" and nothing else: an
    // approved or submitted application must not slide backwards.
    const moved = status === "drafted";

    await ctx.db.patch(args.applicationId, {
      ...(moved ? { status: "needs_review" as const, lastStatusChangeAt: now } : {}),
      openedAt: application.openedAt ?? now,
      updatedAt: now,
    });

    await logActivity(ctx, {
      userId,
      applicationId: args.applicationId,
      type: "opened_form",
      message: "Opened the employer's apply form.",
    });
  },
});

/** Where an application should look next, once it reaches a stage. */
function nextActionFor(
  status: PipelineStatus,
  now: number,
): { nextActionAt?: number; nextActionLabel?: string } {
  if (status === "interview") {
    return { nextActionAt: now + THANK_YOU_DAYS * DAY_MS, nextActionLabel: "Send thank-you" };
  }
  // A closed application has nothing left to chase.
  return isOpen(status)
    ? {}
    : { nextActionAt: undefined, nextActionLabel: undefined };
}

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: manualApplicationStatus,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ownedApplication(ctx, userId, args.applicationId);

    const previous = normalizeStatus(application.status);
    if (previous === args.status) return;

    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      lastStatusChangeAt: now,
      updatedAt: now,
      ...nextActionFor(args.status, now),
    });

    await logActivity(ctx, {
      userId,
      applicationId: args.applicationId,
      type: "status_change",
      message: `Moved from ${statusLabel(previous)} to ${statusLabel(args.status)}.`,
      payload: { from: previous, to: args.status },
    });
  },
});

/**
 * How this user stands with one employer: how many applications are still
 * open there, and when they last sent one.
 */
async function companyStanding(
  ctx: MutationCtx,
  userId: Id<"users">,
  companyKey: string,
  exclude: Id<"applications">,
): Promise<{ openAtCompany: number; lastSubmittedAtCompany: number | null }> {
  const applications = await ctx.db
    .query("applications")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  let openAtCompany = 0;
  let lastSubmittedAtCompany: number | null = null;

  for (const application of applications) {
    if (application._id === exclude) continue;
    if ((await companyKeyOf(ctx, application)) !== companyKey) continue;

    if (isOpen(application.status)) openAtCompany += 1;

    const submittedAt = application.submittedAt;
    if (submittedAt !== undefined && submittedAt > (lastSubmittedAtCompany ?? 0)) {
      lastSubmittedAtCompany = submittedAt;
    }
  }

  return { openAtCompany, lastSubmittedAtCompany };
}

/**
 * The user submitted the application in their own browser and is telling us
 * so. This is the only way into "submitted", because it is the only place the
 * daily and per-company caps are checked.
 */
export const markSubmitted = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ownedApplication(ctx, userId, args.applicationId);

    if (normalizeStatus(application.status) === "submitted") {
      throw new Error("This one is already marked submitted.");
    }

    const now = Date.now();
    const dailyCap = await dailyCapFor(ctx, userId);
    const submittedToday = await submittedTodayFor(ctx, userId, now);
    const companyKey = await companyKeyOf(ctx, application);
    const standing = await companyStanding(ctx, userId, companyKey, application._id);

    const verdict = canSubmit({
      submittedToday,
      dailyCap,
      openAtCompany: standing.openAtCompany,
      lastSubmittedAtCompany: standing.lastSubmittedAtCompany,
      now,
    });

    if (!verdict.ok) {
      throw new Error(verdict.reason);
    }

    await ctx.db.patch(application._id, {
      status: "submitted",
      submittedAt: now,
      lastStatusChangeAt: now,
      nextActionAt: now + FIRST_FOLLOWUP_DAYS * DAY_MS,
      nextActionLabel: "Follow up",
      companyKey,
      updatedAt: now,
    });

    await logActivity(ctx, {
      userId,
      applicationId: application._id,
      type: "submitted",
      message: "You submitted this application yourself.",
    });

    return { remainingToday: Math.max(0, dailyCap - submittedToday - 1) };
  },
});

// --- notes and follow-ups ----------------------------------------------------

export const addNote = mutation({
  args: { applicationId: v.id("applications"), text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ownedApplication(ctx, userId, args.applicationId);

    const text = args.text.trim().slice(0, NOTE_MAX_CHARS);
    if (text.length === 0) {
      throw new Error("Write something before saving the note.");
    }

    // The field holds what the notes box shows; the log keeps every version.
    await ctx.db.patch(application._id, { notes: text, updatedAt: Date.now() });
    await logActivity(ctx, {
      userId,
      applicationId: application._id,
      type: "note",
      message: text,
    });
  },
});

export const snoozeFollowup = mutation({
  args: { applicationId: v.id("applications"), days: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ownedApplication(ctx, userId, args.applicationId);

    const days = Math.min(SNOOZE_MAX_DAYS, Math.max(1, Math.round(args.days)));
    const now = Date.now();
    const from = Math.max(now, application.nextActionAt ?? now);
    const nextActionAt = from + days * DAY_MS;

    await ctx.db.patch(application._id, {
      nextActionAt,
      nextActionLabel: application.nextActionLabel ?? "Follow up",
      updatedAt: now,
    });

    return { nextActionAt };
  },
});

/** Everything the follow-up action needs, in one round trip. */
export const getForFollowup = internalQuery({
  args: { userId: v.id("users"), applicationId: v.id("applications") },
  handler: async (ctx: QueryCtx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== args.userId) return null;

    const job = await ctx.db.get(application.jobImportId);
    if (!job) return null;

    return {
      status: normalizeStatus(application.status),
      followupCount: application.followupCount ?? 0,
      submittedAt: application.submittedAt ?? null,
      title: job.title,
      company: job.company,
    };
  },
});

/**
 * Stores a drafted follow-up. The first one buys another two weeks; after the
 * second there is nothing polite left to send, so the reminder is cleared.
 */
export const saveFollowup = internalMutation({
  args: {
    userId: v.id("users"),
    applicationId: v.id("applications"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== args.userId) {
      throw new Error("Application not found.");
    }

    // The action checked these before it spent a model call, but this mutation
    // is the transaction, so two overlapping drafts cannot both get through.
    if (!awaitsReply(application.status)) {
      throw new Error("This application is not waiting on a reply, so there is nothing to follow up.");
    }
    if ((application.followupCount ?? 0) >= MAX_FOLLOWUPS) {
      throw new Error(`This application already has its ${MAX_FOLLOWUPS} follow-ups.`);
    }

    const now = Date.now();
    const followupCount = (application.followupCount ?? 0) + 1;
    const more = followupCount < MAX_FOLLOWUPS;

    await ctx.db.patch(application._id, {
      followupCount,
      nextActionAt: more ? now + SECOND_FOLLOWUP_DAYS * DAY_MS : undefined,
      nextActionLabel: more ? "Follow up again" : undefined,
      updatedAt: now,
    });

    await logActivity(ctx, {
      userId: args.userId,
      applicationId: application._id,
      type: "followup_drafted",
      message: `Drafted follow-up ${followupCount} of ${MAX_FOLLOWUPS}. Send it yourself.`,
      payload: { subject: args.subject, body: args.body },
    });

    return { followupCount };
  },
});

/**
 * Daily sweep: an application nobody answered in a month is ghosted, so the
 * board shows what is really still live.
 */
export const markGhosted = internalMutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const now = Date.now();
    const cutoff = now - GHOST_AFTER_DAYS * DAY_MS;
    // Oldest rows first, which are exactly the ones that go stale first.
    const submitted = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .take(GHOST_SCAN_CAP);

    let ghosted = 0;

    for (const application of submitted) {
      const since = application.lastStatusChangeAt ?? application.submittedAt;
      if (since === undefined || since > cutoff) continue;

      await ctx.db.patch(application._id, {
        status: "ghosted",
        lastStatusChangeAt: now,
        nextActionAt: undefined,
        nextActionLabel: undefined,
        updatedAt: now,
      });

      await logActivity(ctx, {
        userId: application.userId,
        applicationId: application._id,
        type: "ghosted",
        message: `No reply in ${GHOST_AFTER_DAYS} days, so this one is marked ghosted.`,
      });

      ghosted += 1;
    }

    return { scanned: submitted.length, ghosted };
  },
});
