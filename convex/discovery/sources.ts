/**
 * The boards and feeds a user watches. Plain queries and mutations only: the
 * scan itself runs in `discovery/actions.ts`, which calls back in here.
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
import { jobSourceKind } from "../validators";
import {
  assertValidIdentifier,
  defaultSourceLabel,
  normalizeIdentifier,
} from "./kinds";

/** Jobs the user has not acted on are cleared when a source is removed. */
const CLEARED_ON_REMOVE = new Set<Doc<"discoveredJobs">["status"]>(["new", "scored"]);

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to manage your job sources.");
  }
  return userId;
}

async function sourcesForUser(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const sources = await ctx.db
    .query("jobSources")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  return sources.sort((a, b) => a.createdAt - b.createdAt);
}

async function ownedSource(ctx: MutationCtx, userId: Id<"users">, sourceId: Id<"jobSources">) {
  const source = await ctx.db.get(sourceId);
  if (!source || source.userId !== userId) {
    throw new Error("That job source is not on your list.");
  }
  return source;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await sourcesForUser(ctx, userId);
  },
});

export const add = mutation({
  args: {
    kind: jobSourceKind,
    identifier: v.optional(v.string()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const identifier = normalizeIdentifier(args.kind, args.identifier ?? "");
    assertValidIdentifier(args.kind, identifier);

    const existing = await sourcesForUser(ctx, userId);
    if (
      existing.some((source) => source.kind === args.kind && source.identifier === identifier)
    ) {
      throw new Error("You are already watching that source.");
    }

    return await ctx.db.insert("jobSources", {
      userId,
      kind: args.kind,
      identifier,
      label: args.label?.trim() || defaultSourceLabel(args.kind, identifier),
      enabled: true,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { sourceId: v.id("jobSources"), enabled: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const source = await ownedSource(ctx, userId, args.sourceId);
    const enabled = args.enabled ?? !source.enabled;

    await ctx.db.patch(source._id, { enabled });
    return enabled;
  },
});

export const remove = mutation({
  args: { sourceId: v.id("jobSources") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const source = await ownedSource(ctx, userId, args.sourceId);

    const jobs = await ctx.db
      .query("discoveredJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let cleared = 0;
    for (const job of jobs) {
      if (job.sourceId !== source._id || !CLEARED_ON_REMOVE.has(job.status)) continue;
      await ctx.db.delete(job._id);
      cleared += 1;
    }

    await ctx.db.delete(source._id);
    return { cleared };
  },
});

export const listEnabledForUser = internalQuery({
  args: { userId: v.id("users"), sourceId: v.optional(v.id("jobSources")) },
  handler: async (ctx: QueryCtx, args) => {
    const sources = await ctx.db
      .query("jobSources")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return sources
      .filter((source) => source.enabled)
      .filter((source) => args.sourceId === undefined || source._id === args.sourceId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const recordScan = internalMutation({
  args: {
    sourceId: v.id("jobSources"),
    scannedAt: v.number(),
    count: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) return;

    await ctx.db.patch(source._id, {
      lastScannedAt: args.scannedAt,
      lastCount: args.count ?? source.lastCount,
      lastError: args.error,
    });
  },
});

/** Everyone the daily cron should scan for. */
export const listActiveUserIds = internalQuery({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const sources = await ctx.db.query("jobSources").collect();
    const userIds = new Set<Id<"users">>();

    for (const source of sources) {
      if (source.enabled) userIds.add(source.userId);
    }

    return [...userIds];
  },
});
