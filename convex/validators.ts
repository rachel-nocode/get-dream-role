import { v, type Infer } from "convex/values";
import type { ProviderId } from "./ai/providers";
import type { ManualStatus, StoredStatus } from "./lib/status";

/**
 * The pipeline stages, plus the three literals rows written before Phase 4
 * still carry. Nothing new is written with an old literal: every read maps
 * them through `normalizeStatus` in `lib/status.ts`.
 */
export const applicationStatus = v.union(
  v.literal("discovered"),
  v.literal("scored"),
  v.literal("drafted"),
  v.literal("needs_review"),
  v.literal("approved"),
  v.literal("submitted"),
  v.literal("interview"),
  v.literal("offer"),
  v.literal("rejected"),
  v.literal("ghosted"),
  v.literal("archived"),
  // Retired, kept so existing rows keep validating.
  v.literal("draft"),
  v.literal("ready"),
  v.literal("opened"),
);

/** Fails to compile if the stored statuses drift from the pipeline list. */
export const applicationStatusMatchesPipeline: SameUnion<
  Infer<typeof applicationStatus>,
  StoredStatus
> = true;

/** The stages the status control on a card can move an application to. */
export const manualApplicationStatus = v.union(
  v.literal("drafted"),
  v.literal("needs_review"),
  v.literal("approved"),
  v.literal("interview"),
  v.literal("offer"),
  v.literal("rejected"),
  v.literal("ghosted"),
  v.literal("archived"),
);

/** Fails to compile if the manual moves drift from the list the UI shows. */
export const manualApplicationStatusMatchesList: SameUnion<
  Infer<typeof manualApplicationStatus>,
  ManualStatus
> = true;

/** What happened to an application, in the order it happened. */
export const activityType = v.union(
  v.literal("created"),
  v.literal("drafted"),
  v.literal("reviewed"),
  v.literal("approved"),
  v.literal("opened_form"),
  v.literal("submitted"),
  v.literal("status_change"),
  v.literal("followup_drafted"),
  v.literal("note"),
  v.literal("ghosted"),
);

export type ActivityType = Infer<typeof activityType>;

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

export const jobSource = v.union(
  v.literal("greenhouse"),
  v.literal("lever"),
  v.literal("ashby"),
  v.literal("smartrecruiters"),
  v.literal("recruitee"),
  // Feeds keep their own source: external ids are only unique per feed.
  v.literal("remotive"),
  v.literal("remoteok"),
  v.literal("arbeitnow"),
  v.literal("jobicy"),
  v.literal("himalayas"),
  // Rows imported before feeds were told apart.
  v.literal("feed"),
);

export type JobSource = Infer<typeof jobSource>;

/** Board or feed a user watches for new postings. */
export const jobSourceKind = v.union(
  v.literal("greenhouse"),
  v.literal("lever"),
  v.literal("ashby"),
  v.literal("smartrecruiters"),
  v.literal("recruitee"),
  v.literal("remotive"),
  v.literal("remoteok"),
  v.literal("arbeitnow"),
  v.literal("jobicy"),
  v.literal("himalayas"),
);

export type JobSourceKind = Infer<typeof jobSourceKind>;

export const discoveredJobStatus = v.union(
  v.literal("new"),
  v.literal("scored"),
  v.literal("saved"),
  v.literal("dismissed"),
  v.literal("imported"),
);

export type DiscoveredJobStatus = Infer<typeof discoveredJobStatus>;

export const fitDimensions = v.object({
  skills: v.number(),
  level: v.number(),
  location: v.number(),
  compensation: v.number(),
  trajectory: v.number(),
});

export type FitDimensions = Infer<typeof fitDimensions>;

// --- Master profile (fact registry) -----------------------------------------

export const resumeBullet = v.object({
  id: v.string(),
  text: v.string(),
});

export const experienceEntry = v.object({
  id: v.string(),
  company: v.string(),
  title: v.string(),
  location: v.optional(v.string()),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  bullets: v.array(resumeBullet),
});

export const skillEntry = v.object({
  id: v.string(),
  name: v.string(),
  category: v.optional(v.string()),
  years: v.optional(v.number()),
});

export const educationEntry = v.object({
  id: v.string(),
  school: v.string(),
  degree: v.string(),
  field: v.optional(v.string()),
  year: v.optional(v.string()),
});

export const certificationEntry = v.object({
  id: v.string(),
  name: v.string(),
  issuer: v.optional(v.string()),
  year: v.optional(v.string()),
});

export const projectEntry = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  link: v.optional(v.string()),
});

export const remotePreference = v.union(
  v.literal("remote"),
  v.literal("hybrid"),
  v.literal("onsite"),
  v.literal("any"),
);

export const jobPreferences = v.object({
  targetTitles: v.array(v.string()),
  locations: v.array(v.string()),
  remote: remotePreference,
  salaryMin: v.optional(v.number()),
  salaryCurrency: v.optional(v.string()),
  employmentTypes: v.array(v.string()),
  dealBreakers: v.array(v.string()),
  mustHaves: v.array(v.string()),
});

export const answerBankEntry = v.object({
  id: v.string(),
  key: v.string(),
  question: v.string(),
  answer: v.string(),
});

export type ResumeBullet = Infer<typeof resumeBullet>;
export type ExperienceEntry = Infer<typeof experienceEntry>;
export type SkillEntry = Infer<typeof skillEntry>;
export type EducationEntry = Infer<typeof educationEntry>;
export type CertificationEntry = Infer<typeof certificationEntry>;
export type ProjectEntry = Infer<typeof projectEntry>;
export type RemotePreference = Infer<typeof remotePreference>;
export type JobPreferences = Infer<typeof jobPreferences>;
export type AnswerBankEntry = Infer<typeof answerBankEntry>;

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

export type JobQuestion = Infer<typeof jobQuestion>;

/** How much we trust one screening answer: the bank is high, a draft is medium. */
export const answerConfidence = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

export const answerDraft = v.object({
  question: v.string(),
  answer: v.string(),
  required: v.boolean(),
  confidence: v.optional(answerConfidence),
  /** Answer bank key the answer was copied from, when it came from there. */
  sourceKey: v.optional(v.string()),
});

// --- Tailoring (honest apply kit) -------------------------------------------

/** How well a profile fact covers one posting requirement. */
export const evidenceStrength = v.union(
  v.literal("direct"),
  v.literal("analogous"),
  v.literal("transferable"),
  v.literal("none"),
);

export const gapSeverity = v.union(v.literal("required"), v.literal("preferred"));

export const flaggedClaimStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("rejected"),
);

/** One bullet before and after the rewrite, with the facts it cites. */
export const changeLogEntry = v.object({
  bulletId: v.optional(v.string()),
  original: v.string(),
  rewritten: v.string(),
  reason: v.string(),
  evidenceIds: v.array(v.string()),
});

/** Something the posting asks for that the profile does not support. */
export const gapEntry = v.object({
  requirement: v.string(),
  severity: gapSeverity,
  suggestion: v.string(),
});

/** A term or number the tailored text introduced that the profile lacks. */
export const flaggedClaim = v.object({
  id: v.string(),
  text: v.string(),
  reason: v.string(),
  status: flaggedClaimStatus,
});

export const evidenceMapEntry = v.object({
  requirement: v.string(),
  evidenceIds: v.array(v.string()),
  strength: evidenceStrength,
});

/** A screening question only the user can answer honestly. */
export const needsHumanEntry = v.object({
  question: v.string(),
  reason: v.string(),
});

export const verifierReport = v.object({
  passed: v.boolean(),
  issues: v.array(v.string()),
});

/** A flagged claim the user confirmed, so it is never flagged again. */
export const userConfirmedFact = v.object({
  id: v.string(),
  text: v.string(),
  confirmedAt: v.number(),
});

export type AnswerConfidence = Infer<typeof answerConfidence>;
export type AnswerDraft = Infer<typeof answerDraft>;
export type EvidenceStrength = Infer<typeof evidenceStrength>;
export type GapSeverity = Infer<typeof gapSeverity>;
export type FlaggedClaimStatus = Infer<typeof flaggedClaimStatus>;
export type ChangeLogEntry = Infer<typeof changeLogEntry>;
export type GapEntry = Infer<typeof gapEntry>;
export type FlaggedClaim = Infer<typeof flaggedClaim>;
export type EvidenceMapEntry = Infer<typeof evidenceMapEntry>;
export type NeedsHumanEntry = Infer<typeof needsHumanEntry>;
export type VerifierReport = Infer<typeof verifierReport>;
export type UserConfirmedFact = Infer<typeof userConfirmedFact>;

export const aiProvider = v.union(
  v.literal("anthropic"),
  v.literal("openai"),
  v.literal("google"),
  v.literal("groq"),
  v.literal("openrouter"),
  v.literal("mistral"),
  v.literal("deepseek"),
  v.literal("xai"),
);

type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

/** Fails to compile if the stored provider union drifts from the registry. */
export const aiProviderMatchesRegistry: SameUnion<
  Infer<typeof aiProvider>,
  ProviderId
> = true;
