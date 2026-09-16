import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, internalMutation, internalQuery } from "./_generated/server";
import { NEEDS_ANSWER } from "./ai/tailor";
import { logActivity } from "./applications";
import { companyKeyFor } from "./lib/caps";
import { hasApplied } from "./lib/status";
import {
  aiProvider,
  answerConfidence,
  answerDraft,
  changeLogEntry,
  evidenceMapEntry,
  flaggedClaim,
  gapEntry,
  needsHumanEntry,
  verifierReport,
} from "./validators";

export const getProfileForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const hasApplyCopilotAccess = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    const entitlement = await ctx.db
      .query("entitlements")
      .withIndex("by_user_kind", (q) =>
        q.eq("userId", args.userId).eq("kind", "apply_copilot"),
      )
      .first();

    return entitlement?.status === "active";
  },
});

async function applicationForJob(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  jobImportId: Id<"jobImports">,
) {
  return await ctx.db
    .query("applications")
    .withIndex("by_jobImportId", (q) => q.eq("jobImportId", jobImportId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();
}

/** The application a pipeline run belongs to, so usage rows can point at it. */
export const getApplicationIdForJob = internalQuery({
  args: { userId: v.id("users"), jobImportId: v.id("jobImports") },
  handler: async (ctx: QueryCtx, args): Promise<Id<"applications"> | null> => {
    const application = await applicationForJob(ctx, args.userId, args.jobImportId);
    return application?._id ?? null;
  },
});

export const getDraftForUser = internalQuery({
  args: { userId: v.id("users"), draftId: v.id("applicationDrafts") },
  handler: async (ctx: QueryCtx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.userId !== args.userId) return null;
    return draft;
  },
});

export const saveGeneratedDraft = internalMutation({
  args: {
    userId: v.id("users"),
    jobImportId: v.id("jobImports"),
    resumeSource: v.string(),
    atsScore: v.number(),
    matchScore: v.number(),
    missingKeywords: v.array(v.string()),
    presentKeywords: v.array(v.string()),
    tailoredBullets: v.array(v.string()),
    optimizedResume: v.string(),
    coverLetter: v.string(),
    answerDrafts: v.array(answerDraft),
    summary: v.string(),
    changeLog: v.array(changeLogEntry),
    gaps: v.array(gapEntry),
    flaggedClaims: v.array(flaggedClaim),
    evidenceMap: v.array(evidenceMapEntry),
    needsHuman: v.array(needsHumanEntry),
    verifierReport,
    provider: aiProvider,
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(),
    profileSnapshotAt: v.number(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const { userId, jobImportId, ...draft } = args;
    const now = Date.now();
    const draftId = await ctx.db.insert("applicationDrafts", {
      userId,
      jobImportId,
      ...draft,
      createdAt: now,
      updatedAt: now,
    });

    const application = await applicationForJob(ctx, userId, jobImportId);
    const job = await ctx.db.get(jobImportId);

    // A fresh kit always goes back to the user: they confirm the flagged
    // claims and approve it, which is what moves it on to "approved".
    const applicationId =
      application === null
        ? await ctx.db.insert("applications", {
            userId,
            jobImportId,
            draftId,
            status: "needs_review",
            companyKey: job ? companyKeyFor(job.company) : undefined,
            lastStatusChangeAt: now,
            createdAt: now,
            updatedAt: now,
          })
        : (await ctx.db.patch(application._id, {
            draftId,
            // Regenerating a kit for something already sent must not pull it
            // back out of the tracker.
            ...(hasApplied(application.status)
              ? {}
              : { status: "needs_review" as const, lastStatusChangeAt: now }),
            updatedAt: now,
          }),
          application._id);

    await logActivity(ctx, {
      userId,
      applicationId,
      type: "drafted",
      message: "Built an apply kit: resume, cover letter and screening answers.",
    });

    const periodKey = new Date(now).toISOString().slice(0, 7);
    await ctx.db.insert("usageEvents", {
      userId,
      type: "application_pack",
      quantity: 1,
      periodKey,
      createdAt: now,
    });

    return { draftId, applicationId };
  },
});

/**
 * Replaces one screening answer after the user filled their answer bank. The
 * needs-human list follows the answer: cleared when it is answered, written
 * again when the redraft still cannot answer it honestly.
 */
export const saveAnswerDraft = internalMutation({
  args: {
    userId: v.id("users"),
    draftId: v.id("applicationDrafts"),
    question: v.string(),
    answer: v.string(),
    confidence: answerConfidence,
    sourceKey: v.optional(v.string()),
    /** Why the answer is still the user's to give, when it is. */
    needsHuman: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.userId !== args.userId) {
      throw new Error("That draft is not yours.");
    }

    const others = (draft.needsHuman ?? []).filter(
      (entry) => entry.question !== args.question,
    );
    const stillWaiting = args.needsHuman !== undefined || args.answer.trim() === NEEDS_ANSWER;

    await ctx.db.patch(args.draftId, {
      answerDrafts: draft.answerDrafts.map((entry) =>
        entry.question === args.question
          ? {
              ...entry,
              answer: args.answer,
              confidence: args.confidence,
              sourceKey: args.sourceKey,
            }
          : entry,
      ),
      needsHuman: stillWaiting
        ? [
            ...others,
            {
              question: args.question,
              reason: args.needsHuman ?? "This one is still yours to answer.",
            },
          ]
        : others,
      updatedAt: Date.now(),
    });
  },
});
