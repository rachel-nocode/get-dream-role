import { v } from "convex/values";

export const applicationStatus = v.union(
  v.literal("draft"),
  v.literal("ready"),
  v.literal("opened"),
  v.literal("submitted"),
  v.literal("interview"),
  v.literal("rejected"),
  v.literal("archived"),
);

export const entitlementKind = v.union(
  v.literal("optimizer_lifetime"),
  v.literal("apply_copilot"),
);

export const entitlementStatus = v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("expired"),
);

export const jobSource = v.union(v.literal("greenhouse"), v.literal("lever"));

export const jobQuestion = v.object({
  label: v.string(),
  required: v.boolean(),
  fields: v.array(
    v.object({
      name: v.string(),
      type: v.string(),
      options: v.array(
        v.object({
          label: v.string(),
          value: v.string(),
        }),
      ),
    }),
  ),
});

export const answerDraft = v.object({
  question: v.string(),
  answer: v.string(),
  required: v.boolean(),
});
