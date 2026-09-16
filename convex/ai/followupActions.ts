"use node";

/**
 * The follow-up draft: one cheap call that turns a silent application into an
 * email the user sends themselves. It is capped at two per application,
 * because a third is not persistence, it is noise.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { ActionCtx, action } from "../_generated/server";
import { MAX_FOLLOWUPS } from "../lib/caps";
import { awaitsReply } from "../lib/status";
import { generateJson } from "./client";
import {
  FOLLOWUP_MAX_TOKENS,
  FOLLOWUP_MAX_WORDS,
  FOLLOWUP_SCHEMA,
  FOLLOWUP_SYSTEM,
  followupPrompt,
  strongestFacts,
} from "./prompts";
import { resolveUserModel } from "./resolve";
import { buildFactRegistry, clampWords } from "./tailor";

const DAY_MS = 24 * 60 * 60 * 1000;
const FACTS_IN_PROMPT = 5;
const SUBJECT_MAX_CHARS = 80;

type FollowupEmail = { subject: string; body: string };

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to draft a follow-up.");
  }
  return userId;
}

function readEmail(value: unknown, fallbackSubject: string): FollowupEmail {
  const record =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const subject = String(record.subject ?? "").trim().slice(0, SUBJECT_MAX_CHARS);
  const body = clampWords(String(record.body ?? "").trim(), FOLLOWUP_MAX_WORDS);

  if (body.length === 0) {
    throw new Error("The model returned an empty follow-up. Try again in a moment.");
  }

  return { subject: subject.length > 0 ? subject : fallbackSubject, body };
}

export const draftFollowup = action({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args): Promise<FollowupEmail> => {
    const userId: Id<"users"> = await requireUserId(ctx);

    const application = await ctx.runQuery(internal.applications.getForFollowup, {
      userId,
      applicationId: args.applicationId,
    });
    if (!application) {
      throw new Error("Application not found.");
    }
    if (!awaitsReply(application.status)) {
      throw new Error(
        "Follow-ups only make sense while you are waiting to hear back: mark this one submitted first, or leave a closed application closed.",
      );
    }
    if (application.followupCount >= MAX_FOLLOWUPS) {
      throw new Error(
        `You have already drafted ${MAX_FOLLOWUPS} follow-ups for this one. A third reads as pressure, not interest.`,
      );
    }

    const profile = await ctx.runQuery(internal.careerProfile.getForUser, { userId });
    if (!profile) {
      throw new Error("Build your master profile first: a follow-up needs a fact to offer.");
    }

    const facts = strongestFacts(buildFactRegistry(profile), FACTS_IN_PROMPT);
    if (facts.length === 0) {
      throw new Error("Add at least one bullet to your profile so the email has something to say.");
    }

    const resolved = await resolveUserModel(ctx, userId);
    const completion = await generateJson<unknown>({
      provider: resolved.provider,
      model: resolved.model,
      apiKey: resolved.apiKey,
      system: FOLLOWUP_SYSTEM,
      user: followupPrompt({
        job: { title: application.title, company: application.company },
        facts,
        daysSinceSubmitted:
          application.submittedAt === null
            ? null
            : Math.max(0, Math.floor((Date.now() - application.submittedAt) / DAY_MS)),
        attempt: application.followupCount + 1,
      }),
      schema: FOLLOWUP_SCHEMA,
      schemaName: "followup_email",
      maxTokens: FOLLOWUP_MAX_TOKENS,
      temperature: 0.3,
    });

    const email = readEmail(completion.data, `${application.title} application`);

    await ctx.runMutation(internal.aiSettings.recordUsage, {
      userId,
      provider: completion.provider,
      model: completion.model,
      purpose: "followup",
      inputTokens: completion.usage.inputTokens,
      outputTokens: completion.usage.outputTokens,
      costUsd: completion.costUsd,
      applicationId: args.applicationId,
    });

    await ctx.runMutation(internal.applications.saveFollowup, {
      userId,
      applicationId: args.applicationId,
      subject: email.subject,
      body: email.body,
    });

    return email;
  },
});
