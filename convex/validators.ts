import { v, type Infer } from "convex/values";
import type { ProviderId } from "./ai/providers";

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

export const jobSource = v.union(
  v.literal("greenhouse"),
  v.literal("lever"),
  v.literal("ashby"),
  v.literal("smartrecruiters"),
  v.literal("recruitee"),
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

export const answerDraft = v.object({
  question: v.string(),
  answer: v.string(),
  required: v.boolean(),
});

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
