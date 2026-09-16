import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  HOUSE_MODEL,
  HOUSE_PROVIDER,
  defaultModelFor,
  findModel,
  type ProviderId,
} from "./ai/providers";
import { DEFAULT_DAILY_SUBMIT_CAP } from "./lib/caps";
import { aiProvider } from "./validators";

export const SUBMIT_CAP_MIN = 1;
export const SUBMIT_CAP_MAX = 30;
export const SCORING_BUDGET_MIN_USD = 0.05;
export const SCORING_BUDGET_MAX_USD = 25;

export const DEFAULT_AI_SETTINGS = {
  provider: HOUSE_PROVIDER,
  model: HOUSE_MODEL,
  dailySubmitCap: DEFAULT_DAILY_SUBMIT_CAP,
  dailyScoringBudgetUsd: 0.5,
};

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to change your AI settings.");
  }
  return userId;
}

function periodKeyFor(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 7);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(timestamp: number) {
  return Math.floor(timestamp / DAY_MS) * DAY_MS;
}

function clampSubmitCap(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_AI_SETTINGS.dailySubmitCap;
  return Math.min(SUBMIT_CAP_MAX, Math.max(SUBMIT_CAP_MIN, Math.round(value)));
}

function clampScoringBudget(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_AI_SETTINGS.dailyScoringBudgetUsd;
  const rounded = Math.round(value * 100) / 100;
  return Math.min(SCORING_BUDGET_MAX_USD, Math.max(SCORING_BUDGET_MIN_USD, rounded));
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return {
      provider: settings?.provider ?? DEFAULT_AI_SETTINGS.provider,
      model: settings?.model ?? DEFAULT_AI_SETTINGS.model,
      dailySubmitCap: settings?.dailySubmitCap ?? DEFAULT_AI_SETTINGS.dailySubmitCap,
      dailyScoringBudgetUsd:
        settings?.dailyScoringBudgetUsd ?? DEFAULT_AI_SETTINGS.dailyScoringBudgetUsd,
      configured: settings !== null,
      updatedAt: settings?.updatedAt,
    };
  },
});

export const update = mutation({
  args: {
    provider: v.optional(aiProvider),
    model: v.optional(v.string()),
    dailySubmitCap: v.optional(v.number()),
    dailyScoringBudgetUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("aiSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const provider = args.provider ?? existing?.provider ?? DEFAULT_AI_SETTINGS.provider;
    const model = args.model ?? existing?.model ?? DEFAULT_AI_SETTINGS.model;

    if (!findModel(provider, model)) {
      throw new Error("Pick a model that is available for that provider.");
    }

    const now = Date.now();
    const fields = {
      provider,
      model,
      dailySubmitCap: clampSubmitCap(
        args.dailySubmitCap ?? existing?.dailySubmitCap ?? DEFAULT_AI_SETTINGS.dailySubmitCap,
      ),
      dailyScoringBudgetUsd: clampScoringBudget(
        args.dailyScoringBudgetUsd ??
          existing?.dailyScoringBudgetUsd ??
          DEFAULT_AI_SETTINGS.dailyScoringBudgetUsd,
      ),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return;
    }

    await ctx.db.insert("aiSettings", { userId, createdAt: now, ...fields });
  },
});

export const usageThisMonth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const periodKey = periodKeyFor(Date.now());
    const events = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_period", (q) =>
        q.eq("userId", userId).eq("periodKey", periodKey),
      )
      .collect();

    return events.reduce(
      (totals, event) => ({
        periodKey,
        calls: totals.calls + 1,
        inputTokens: totals.inputTokens + event.inputTokens,
        outputTokens: totals.outputTokens + event.outputTokens,
        costUsd: Math.round((totals.costUsd + event.costUsd) * 1_000_000) / 1_000_000,
      }),
      { periodKey, calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 },
    );
  },
});

/**
 * Which provider and model a generation call would use right now, with no key
 * material of any kind. Drives every cost estimate shown before a run.
 */
export async function resolveModelForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<{ provider: ProviderId; model: string; usingHouseKey: boolean }> {
  const settings = await ctx.db
    .query("aiSettings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (settings) {
    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", settings.provider),
      )
      .first();

    if (key) {
      const model =
        findModel(settings.provider, settings.model) ?? defaultModelFor(settings.provider);
      return { provider: settings.provider, model: model.id, usingHouseKey: false };
    }
  }

  return { provider: HOUSE_PROVIDER, model: HOUSE_MODEL, usingHouseKey: true };
}

export const resolvedModel = query({
  args: {},
  handler: async (ctx) => await resolveModelForUser(ctx, await requireUserId(ctx)),
});

/** The daily scoring budget in force for a user, defaults included. */
export const scoringBudget = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return {
      budgetUsd: settings?.dailyScoringBudgetUsd ?? DEFAULT_AI_SETTINGS.dailyScoringBudgetUsd,
    };
  },
});

/** Spend so far today for one purpose, used to enforce the scoring budget. */
export const usageToday = internalQuery({
  args: { userId: v.id("users"), purpose: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const now = Date.now();
    const dayStart = startOfUtcDay(now);
    const events = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_period", (q) =>
        q.eq("userId", args.userId).eq("periodKey", periodKeyFor(now)),
      )
      .collect();

    return events
      .filter((event) => event.purpose === args.purpose && event.createdAt >= dayStart)
      .reduce(
        (totals, event) => ({
          calls: totals.calls + 1,
          costUsd: Math.round((totals.costUsd + event.costUsd) * 1_000_000) / 1_000_000,
        }),
        { calls: 0, costUsd: 0 },
      );
  },
});

export const getForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("aiSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/** Used after the first key is saved; never overwrites an existing choice. */
export const initializeForUser = internalMutation({
  args: { userId: v.id("users"), provider: aiProvider, model: v.string() },
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("aiSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) return;

    const now = Date.now();
    await ctx.db.insert("aiSettings", {
      userId: args.userId,
      provider: args.provider,
      model: args.model,
      dailySubmitCap: DEFAULT_AI_SETTINGS.dailySubmitCap,
      dailyScoringBudgetUsd: DEFAULT_AI_SETTINGS.dailyScoringBudgetUsd,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recordUsage = internalMutation({
  args: {
    userId: v.id("users"),
    provider: aiProvider,
    model: v.string(),
    purpose: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(),
    applicationId: v.optional(v.id("applications")),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    await ctx.db.insert("aiUsage", {
      ...args,
      periodKey: periodKeyFor(now),
      createdAt: now,
    });
  },
});
