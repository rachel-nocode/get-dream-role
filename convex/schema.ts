import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  answerDraft,
  applicationStatus,
  entitlementKind,
  entitlementStatus,
  jobQuestion,
  jobSource,
} from "./validators";

export default defineSchema({
  ...authTables,
  purchases: defineTable({
    stripeSessionId: v.string(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    product: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),
  profiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    fullName: v.optional(v.string()),
    headline: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    links: v.array(v.string()),
    resumeText: v.optional(v.string()),
    resumeFileName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),
  entitlements: defineTable({
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    kind: entitlementKind,
    status: entitlementStatus,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_kind", ["userId", "kind"])
    .index("by_email_kind", ["email", "kind"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),
  jobImports: defineTable({
    userId: v.id("users"),
    source: jobSource,
    url: v.string(),
    externalId: v.string(),
    boardToken: v.optional(v.string()),
    leverSite: v.optional(v.string()),
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    description: v.string(),
    applyUrl: v.string(),
    questions: v.array(jobQuestion),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_source_external", ["userId", "source", "externalId"]),
  applicationDrafts: defineTable({
    userId: v.id("users"),
    jobImportId: v.id("jobImports"),
    resumeSource: v.string(),
    atsScore: v.number(),
    matchScore: v.number(),
    missingKeywords: v.array(v.string()),
    presentKeywords: v.array(v.string()),
    tailoredBullets: v.array(v.string()),
    optimizedResume: v.string(),
    coverLetter: v.string(),
    answerDrafts: v.array(answerDraft),
    summary: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_jobImportId", ["jobImportId"]),
  applications: defineTable({
    userId: v.id("users"),
    jobImportId: v.id("jobImports"),
    draftId: v.optional(v.id("applicationDrafts")),
    status: applicationStatus,
    openedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_jobImportId", ["jobImportId"])
    .index("by_user_status", ["userId", "status"]),
  usageEvents: defineTable({
    userId: v.id("users"),
    type: v.string(),
    quantity: v.number(),
    periodKey: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_period", ["userId", "periodKey"])
    .index("by_user_type", ["userId", "type"]),
});
