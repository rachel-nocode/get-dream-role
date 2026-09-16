import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { aiProvider } from "./validators";

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to manage your API keys.");
  }
  return userId;
}

/** Public listing: metadata only, never the ciphertext or the key itself. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return keys.map((key) => ({
      provider: key.provider,
      last4: key.last4,
      label: key.label,
      lastValidatedAt: key.lastValidatedAt,
      createdAt: key.createdAt,
    }));
  },
});

export const remove = mutation({
  args: { provider: aiProvider },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const store = internalMutation({
  args: {
    userId: v.id("users"),
    provider: aiProvider,
    ciphertext: v.string(),
    iv: v.string(),
    keyVersion: v.number(),
    last4: v.string(),
    label: v.optional(v.string()),
    lastValidatedAt: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider),
      )
      .first();

    const fields = {
      ciphertext: args.ciphertext,
      iv: args.iv,
      keyVersion: args.keyVersion,
      last4: args.last4,
      label: args.label,
      lastValidatedAt: args.lastValidatedAt,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }

    return await ctx.db.insert("apiKeys", {
      userId: args.userId,
      provider: args.provider,
      createdAt: now,
      ...fields,
    });
  },
});

export const getEncrypted = internalQuery({
  args: { userId: v.id("users"), provider: aiProvider },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider),
      )
      .first();
  },
});

export const markValidated = internalMutation({
  args: { userId: v.id("users"), provider: aiProvider, validatedAt: v.number() },
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastValidatedAt: args.validatedAt,
        updatedAt: Date.now(),
      });
    }
  },
});
