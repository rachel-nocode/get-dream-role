import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to use Apply Copilot.");
  }

  const user = await ctx.db.get(userId);
  if (!user?.email) {
    throw new Error("Your account needs an email address.");
  }

  return { userId, email: user.email.toLowerCase().trim(), user };
}

export const getDefaultProfile = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const upsertDefaultProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    headline: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    resumeText: v.optional(v.string()),
    resumeFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, email, user } = await requireUser(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const patch = {
      email,
      fullName: args.fullName ?? existing?.fullName ?? user.name,
      headline: args.headline ?? existing?.headline,
      phone: args.phone ?? existing?.phone,
      location: args.location ?? existing?.location,
      links: args.links ?? existing?.links ?? [],
      resumeText: args.resumeText ?? existing?.resumeText,
      resumeFileName: args.resumeFileName ?? existing?.resumeFileName,
      updatedAt: now,
    };

    const profileId =
      existing === null
        ? await ctx.db.insert("profiles", {
            userId,
            createdAt: now,
            ...patch,
          })
        : (await ctx.db.patch(existing._id, patch), existing._id);

    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (purchase) {
      const entitlement = await ctx.db
        .query("entitlements")
        .withIndex("by_user_kind", (q) =>
          q.eq("userId", userId).eq("kind", "optimizer_lifetime"),
        )
        .first();

      if (entitlement === null) {
        await ctx.db.insert("entitlements", {
          userId,
          email,
          kind: "optimizer_lifetime",
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }

      if (!purchase.userId) {
        await ctx.db.patch(purchase._id, { userId });
      }
    }

    return profileId;
  },
});
