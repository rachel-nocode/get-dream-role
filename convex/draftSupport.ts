import { v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, internalQuery } from "./_generated/server";
import { answerDraft } from "./validators";

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
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    const draftId = await ctx.db.insert("applicationDrafts", {
      userId: args.userId,
      jobImportId: args.jobImportId,
      resumeSource: args.resumeSource,
      atsScore: args.atsScore,
      matchScore: args.matchScore,
      missingKeywords: args.missingKeywords,
      presentKeywords: args.presentKeywords,
      tailoredBullets: args.tailoredBullets,
      optimizedResume: args.optimizedResume,
      coverLetter: args.coverLetter,
      answerDrafts: args.answerDrafts,
      summary: args.summary,
      createdAt: now,
      updatedAt: now,
    });

    const application = await ctx.db
      .query("applications")
      .withIndex("by_jobImportId", (q) => q.eq("jobImportId", args.jobImportId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const applicationId =
      application === null
        ? await ctx.db.insert("applications", {
            userId: args.userId,
            jobImportId: args.jobImportId,
            draftId,
            status: "ready",
            createdAt: now,
            updatedAt: now,
          })
        : (await ctx.db.patch(application._id, {
            draftId,
            status: "ready",
            updatedAt: now,
          }),
          application._id);

    const periodKey = new Date(now).toISOString().slice(0, 7);
    await ctx.db.insert("usageEvents", {
      userId: args.userId,
      type: "application_pack",
      quantity: 1,
      periodKey,
      createdAt: now,
    });

    return { draftId, applicationId };
  },
});
