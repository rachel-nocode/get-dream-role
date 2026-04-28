import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { applicationStatus } from "./validators";

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to view applications.");
  }
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
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

        return { application, job, draft };
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

    return { application, job, draft };
  },
});

export const markOpened = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Application not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      status: application.status === "submitted" ? application.status : "opened",
      openedAt: application.openedAt ?? now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: applicationStatus,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Application not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      submittedAt:
        args.status === "submitted" ? application.submittedAt ?? now : application.submittedAt,
      updatedAt: now,
    });
  },
});
