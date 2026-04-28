import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";
import { entitlementKind, entitlementStatus } from "./validators";

async function currentUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to continue.");
  }

  const user = await ctx.db.get(userId);
  return {
    userId,
    email: user?.email?.toLowerCase().trim(),
  };
}

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await currentUser(ctx);
    return await ctx.db
      .query("entitlements")
      .withIndex("by_user_kind", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const upsertForEmail = mutation({
  args: {
    webhookSecret: v.optional(v.string()),
    email: v.string(),
    kind: entitlementKind,
    status: entitlementStatus,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const configuredSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (configuredSecret && args.webhookSecret !== configuredSecret) {
      throw new Error("Unauthorized entitlement update.");
    }

    const now = Date.now();
    const email = args.email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    const userId = user?._id;

    const existingBySubscription = args.stripeSubscriptionId
      ? await ctx.db
          .query("entitlements")
          .withIndex("by_stripeSubscriptionId", (q) =>
            q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
          )
          .first()
      : null;

    const existing =
      existingBySubscription ??
      (await ctx.db
        .query("entitlements")
        .withIndex("by_email_kind", (q) =>
          q.eq("email", email).eq("kind", args.kind),
        )
        .first());

    const patch = {
      userId,
      email,
      kind: args.kind,
      status: args.status,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("entitlements", {
      ...patch,
      createdAt: now,
    });
  },
});
