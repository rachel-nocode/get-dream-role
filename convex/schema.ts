import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  activityType,
  aiProvider,
  answerBankEntry,
  answerDraft,
  applicationStatus,
  certificationEntry,
  changeLogEntry,
  discoveredJobStatus,
  educationEntry,
  entitlementKind,
  entitlementStatus,
  evidenceMapEntry,
  experienceEntry,
  fitDimensions,
  flaggedClaim,
  gapEntry,
  jobPreferences,
  jobQuestion,
  jobSource,
  jobSourceKind,
  needsHumanEntry,
  projectEntry,
  skillEntry,
  userConfirmedFact,
  verifierReport,
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
  careerProfiles: defineTable({
    userId: v.id("users"),
    experiences: v.array(experienceEntry),
    skills: v.array(skillEntry),
    education: v.array(educationEntry),
    certifications: v.array(certificationEntry),
    projects: v.array(projectEntry),
    summary: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    preferences: jobPreferences,
    answerBank: v.array(answerBankEntry),
    /** Claims the user confirmed on a draft, so tailoring stops flagging them. */
    userConfirmedFacts: v.optional(v.array(userConfirmedFact)),
    sourceResumeText: v.string(),
    confirmedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  jobSources: defineTable({
    userId: v.id("users"),
    kind: jobSourceKind,
    identifier: v.string(),
    label: v.string(),
    enabled: v.boolean(),
    lastScannedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    lastCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
  discoveredJobs: defineTable({
    userId: v.id("users"),
    sourceId: v.id("jobSources"),
    kind: jobSourceKind,
    externalId: v.string(),
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    remote: v.boolean(),
    url: v.string(),
    applyUrl: v.string(),
    description: v.string(),
    postedAt: v.optional(v.number()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    prefilterScore: v.number(),
    fitScore: v.optional(v.number()),
    fitDimensions: v.optional(fitDimensions),
    fitReasons: v.optional(v.array(v.string())),
    hardGateFails: v.optional(v.array(v.string())),
    status: discoveredJobStatus,
    jobImportId: v.optional(v.id("jobImports")),
    discoveredAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_kind_external", ["userId", "kind", "externalId"]),
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
    // Everything below is optional so drafts written before the honest
    // tailoring pipeline keep validating.
    changeLog: v.optional(v.array(changeLogEntry)),
    gaps: v.optional(v.array(gapEntry)),
    flaggedClaims: v.optional(v.array(flaggedClaim)),
    evidenceMap: v.optional(v.array(evidenceMapEntry)),
    needsHuman: v.optional(v.array(needsHumanEntry)),
    verifierReport: v.optional(verifierReport),
    provider: v.optional(aiProvider),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    /** When the profile this draft was built from was last edited. */
    profileSnapshotAt: v.optional(v.number()),
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
    // Everything below arrived with the tracker, so it is optional and rows
    // written earlier keep validating.
    /** When the next follow-up or thank-you is due. */
    nextActionAt: v.optional(v.number()),
    nextActionLabel: v.optional(v.string()),
    followupCount: v.optional(v.number()),
    /** The employer, normalized, so the per-company caps can count. */
    companyKey: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastStatusChangeAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_jobImportId", ["jobImportId"])
    .index("by_user_status", ["userId", "status"]),
  activityLog: defineTable({
    userId: v.id("users"),
    applicationId: v.id("applications"),
    type: activityType,
    message: v.string(),
    /** Whatever the entry carries, such as a drafted follow-up email. */
    payload: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_userId", ["userId"]),
  apiKeys: defineTable({
    userId: v.id("users"),
    provider: aiProvider,
    ciphertext: v.string(),
    iv: v.string(),
    keyVersion: v.number(),
    last4: v.string(),
    label: v.optional(v.string()),
    lastValidatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_provider", ["userId", "provider"])
    .index("by_userId", ["userId"]),
  aiSettings: defineTable({
    userId: v.id("users"),
    provider: aiProvider,
    model: v.string(),
    dailySubmitCap: v.number(),
    dailyScoringBudgetUsd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  aiUsage: defineTable({
    userId: v.id("users"),
    provider: aiProvider,
    model: v.string(),
    purpose: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(),
    applicationId: v.optional(v.id("applications")),
    periodKey: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_period", ["userId", "periodKey"])
    .index("by_userId", ["userId"]),
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
