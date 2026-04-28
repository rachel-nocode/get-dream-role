import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordPurchase = mutation({
  args: {
    stripeSessionId: v.string(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    product: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();

    if (existing) return existing._id;

    const email = args.email.toLowerCase().trim();
    const user =
      args.userId ??
      (
        await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .first()
      )?._id;
    const purchaseId = await ctx.db.insert("purchases", {
      stripeSessionId: args.stripeSessionId,
      email,
      userId: user,
      product: args.product,
      createdAt: Date.now(),
    });

    if (user) {
      const now = Date.now();
      const existingEntitlement = await ctx.db
        .query("entitlements")
        .withIndex("by_user_kind", (q) =>
          q.eq("userId", user).eq("kind", "optimizer_lifetime"),
        )
        .first();

      if (existingEntitlement === null) {
        await ctx.db.insert("entitlements", {
          userId: user,
          email,
          kind: "optimizer_lifetime",
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return purchaseId;
  },
});

export const checkByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) =>
        q.eq("email", args.email.toLowerCase().trim())
      )
      .first();
    return purchase !== null;
  },
});
