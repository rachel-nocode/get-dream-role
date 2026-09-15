/**
 * What the user does with a generated apply kit: price it before it runs,
 * settle the claims the verifier flagged, and approve it once nothing is
 * outstanding. Generation itself lives in `ai/draftActions.ts`, which needs
 * the Node runtime; everything here is a plain query or mutation.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { PROVIDERS, estimateCostPerApplication, findModel } from "./ai/providers";
import { NEEDS_ANSWER, computeAtsScore } from "./ai/tailor";
import { resolveModelForUser } from "./aiSettings";
import { logActivity } from "./applications";
import { hasApplied } from "./lib/status";
import type { UserConfirmedFact } from "./validators";

const claimResolution = v.union(v.literal("confirmed"), v.literal("rejected"));

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to work on an application.");
  }
  return userId;
}

async function ownedDraft(
  ctx: MutationCtx,
  userId: Id<"users">,
  draftId: Id<"applicationDrafts">,
): Promise<Doc<"applicationDrafts">> {
  const draft = await ctx.db.get(draftId);
  if (!draft || draft.userId !== userId) {
    throw new Error("Could not find that draft.");
  }
  return draft;
}

/** The pipeline row a draft belongs to, so review steps can be logged. */
async function applicationForDraft(
  ctx: MutationCtx,
  userId: Id<"users">,
  draft: Doc<"applicationDrafts">,
): Promise<Doc<"applications"> | null> {
  return await ctx.db
    .query("applications")
    .withIndex("by_jobImportId", (q) => q.eq("jobImportId", draft.jobImportId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();
}

/** What the full pipeline would cost on the model this user is set up with. */
export const estimate = query({
  args: { jobImportId: v.id("jobImports") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const job = await ctx.db.get(args.jobImportId);
    if (!job || job.userId !== userId) return null;

    const resolved = await resolveModelForUser(ctx, userId);
    const model = findModel(resolved.provider, resolved.model);

    return {
      provider: resolved.provider,
      model: resolved.model,
      label: `${PROVIDERS[resolved.provider].label} ${model?.label ?? resolved.model}`,
      costUsd: model ? estimateCostPerApplication(model) : null,
      usingHouseKey: resolved.usingHouseKey,
      questions: job.questions.length,
    };
  },
});

function nextConfirmedFacts(
  existing: UserConfirmedFact[],
  text: string,
  now: number,
): UserConfirmedFact[] {
  const already = existing.some((fact) => fact.text.toLowerCase() === text.toLowerCase());
  if (already) return existing;
  return [...existing, { id: `ucf_${existing.length + 1}`, text, confirmedAt: now }];
}

/**
 * Confirming a claim is the user vouching for it, so it joins the profile as a
 * fact of their own and the verifier stops flagging it on the next draft.
 */
export const resolveClaim = mutation({
  args: {
    draftId: v.id("applicationDrafts"),
    claimId: v.string(),
    status: claimResolution,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const draft = await ownedDraft(ctx, userId, args.draftId);

    const claims = draft.flaggedClaims ?? [];
    const claim = claims.find((entry) => entry.id === args.claimId);
    if (!claim) {
      throw new Error("That claim is not on this draft.");
    }

    const now = Date.now();
    const updated = claims.map((entry) =>
      entry.id === args.claimId ? { ...entry, status: args.status } : entry,
    );
    const pending = updated.filter((entry) => entry.status === "pending").length;

    await ctx.db.patch(draft._id, {
      flaggedClaims: updated,
      atsScore: computeAtsScore(draft.verifierReport?.issues.length ?? 0, pending),
      updatedAt: now,
    });

    const application = await applicationForDraft(ctx, userId, draft);
    if (application) {
      await logActivity(ctx, {
        userId,
        applicationId: application._id,
        type: "reviewed",
        message:
          args.status === "confirmed"
            ? `Confirmed the flagged claim "${claim.text}".`
            : `Rejected the flagged claim "${claim.text}".`,
      });
    }

    if (args.status === "confirmed") {
      const profile = await ctx.db
        .query("careerProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          userConfirmedFacts: nextConfirmedFacts(
            profile.userConfirmedFacts ?? [],
            claim.text,
            now,
          ),
          updatedAt: now,
        });
      }
    }

    return { pending };
  },
});

/** Screening questions the kit still hands back to the user. */
function unansweredQuestions(draft: Doc<"applicationDrafts">): string[] {
  return (draft.needsHuman ?? [])
    .filter((entry) => {
      const answer = draft.answerDrafts.find((item) => item.question === entry.question);
      return answer !== undefined && answer.answer.trim() === NEEDS_ANSWER;
    })
    .map((entry) => entry.question);
}

function blockingMessage(pending: number, unanswered: number): string {
  const parts = [
    pending > 0 ? `${pending} flagged claim${pending === 1 ? "" : "s"} to confirm or reject` : "",
    unanswered > 0 ? `${unanswered} question${unanswered === 1 ? "" : "s"} only you can answer` : "",
  ].filter((part) => part.length > 0);

  return `Finish the review first: ${parts.join(" and ")}.`;
}

export const approve = mutation({
  args: { draftId: v.id("applicationDrafts") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const draft = await ownedDraft(ctx, userId, args.draftId);

    const pending = (draft.flaggedClaims ?? []).filter(
      (claim) => claim.status === "pending",
    ).length;
    const unanswered = unansweredQuestions(draft).length;

    if (pending > 0 || unanswered > 0) {
      throw new Error(blockingMessage(pending, unanswered));
    }

    const now = Date.now();
    await ctx.db.patch(draft._id, { approvedAt: now, updatedAt: now });

    const application = await applicationForDraft(ctx, userId, draft);
    if (application) {
      // Re-approving a regenerated kit must not undo a submit.
      if (!hasApplied(application.status)) {
        await ctx.db.patch(application._id, {
          status: "approved",
          lastStatusChangeAt: now,
          updatedAt: now,
        });
      }
      await logActivity(ctx, {
        userId,
        applicationId: application._id,
        type: "approved",
        message: "Approved the apply kit. Nothing is sent until you send it.",
      });
    }

    return now;
  },
});
