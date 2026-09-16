"use node";

/**
 * Parsing a pasted resume into the master profile.
 *
 * The model only ever copies: it extracts facts, it never writes new ones.
 * Ids are assigned here in code afterwards so the registry is deterministic
 * and later phases can cite an entry that will still be there.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { ActionCtx, action } from "../_generated/server";
import { withBulletIds, withEntryIds } from "../lib/profileIds";
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillEntry,
} from "../validators";
import { generateJson, type JsonSchema } from "./client";
import { resolveUserModel } from "./resolve";
import { PARSE_PROFILE_OUTPUT_TOKENS } from "./providers";

/** Longer resumes are truncated so one parse cannot run up a surprise bill. */
const RESUME_CAP = 20_000;
const MIN_RESUME_LENGTH = 120;

const PROFILE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string", description: "The resume's own summary, copied verbatim, or empty" },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string", description: "As written on the resume" },
          endDate: { type: "string", description: "As written, including Present" },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          years: { type: "number", description: "0 when the resume does not say" },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          year: { type: "string" },
        },
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          year: { type: "string" },
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          link: { type: "string" },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You turn a resume into a fact registry. The registry is the only thing later steps are allowed to claim about this candidate, so it must contain nothing the resume does not already say.

Rules:
- Copy facts verbatim. Do not rewrite, shorten, embellish or reword a bullet.
- Never add a skill, tool, metric, employer, title or credential that is not in the resume.
- Keep dates exactly as written, including "Present" for a current role.
- Produce one bullet per resume bullet, in the order they appear.
- List a skill only if the resume names it literally. Do not infer skills from bullets.
- Leave a field as an empty string when the resume does not give it. Never guess.`;

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to parse your resume.");
  }
  return userId;
}

function asRecords(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === "object" && entry !== null && !Array.isArray(entry),
  );
}

function readText(value: unknown): string {
  return String(value ?? "").trim();
}

function readYears(value: unknown): number | undefined {
  const years = Number(value);
  if (!Number.isFinite(years) || years <= 0) return undefined;
  return Math.round(years);
}

function optional(value: unknown): string | undefined {
  const text = readText(value);
  return text.length > 0 ? text : undefined;
}

type ParsedProfile = {
  summary?: string;
  experiences: ExperienceEntry[];
  skills: SkillEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
};

/** Maps the model's id-free output onto registry entries with stable ids. */
function toRegistry(value: unknown): ParsedProfile {
  const record = (typeof value === "object" && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  const bulletIds = new Set<string>();

  const experienceInput = asRecords(record.experiences)
    .map((entry) => ({
      company: readText(entry.company),
      title: readText(entry.title),
      location: optional(entry.location),
      startDate: readText(entry.startDate),
      endDate: optional(entry.endDate),
      bulletTexts: (Array.isArray(entry.bullets) ? entry.bullets : [])
        .map((bullet) => readText(bullet))
        .filter((text) => text.length > 0),
    }))
    .filter((entry) => entry.company.length > 0 || entry.title.length > 0);

  const skillInput = asRecords(record.skills)
    .map((entry) => ({
      name: readText(entry.name),
      category: optional(entry.category),
      years: readYears(entry.years),
    }))
    .filter((entry) => entry.name.length > 0);

  const educationInput = asRecords(record.education)
    .map((entry) => ({
      school: readText(entry.school),
      degree: readText(entry.degree),
      field: optional(entry.field),
      year: optional(entry.year),
    }))
    .filter((entry) => entry.school.length > 0 || entry.degree.length > 0);

  const certificationInput = asRecords(record.certifications)
    .map((entry) => ({
      name: readText(entry.name),
      issuer: optional(entry.issuer),
      year: optional(entry.year),
    }))
    .filter((entry) => entry.name.length > 0);

  const projectInput = asRecords(record.projects)
    .map((entry) => ({
      name: readText(entry.name),
      description: readText(entry.description),
      link: optional(entry.link),
    }))
    .filter((entry) => entry.name.length > 0);

  return {
    summary: optional(record.summary),
    experiences: withEntryIds(experienceInput, "exp").map(({ bulletTexts, ...entry }, index) => ({
      ...entry,
      bullets: withBulletIds(
        bulletTexts.map((text) => ({ text })),
        index,
        bulletIds,
      ),
    })),
    skills: withEntryIds(skillInput, "sk"),
    education: withEntryIds(educationInput, "edu"),
    certifications: withEntryIds(certificationInput, "cert"),
    projects: withEntryIds(projectInput, "proj"),
  };
}

export const parseResume = action({
  args: { resumeText: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{
    experiences: number;
    skills: number;
    education: number;
    certifications: number;
    projects: number;
    costUsd: number;
  }> => {
    const userId = await requireUserId(ctx);
    const resumeText = args.resumeText.trim().slice(0, RESUME_CAP);
    if (resumeText.length < MIN_RESUME_LENGTH) {
      throw new Error("Paste your full resume text before parsing it.");
    }

    const resolved = await resolveUserModel(ctx, userId);
    const completion = await generateJson<unknown>({
      provider: resolved.provider,
      model: resolved.model,
      apiKey: resolved.apiKey,
      system: SYSTEM_PROMPT,
      user: `RESUME\n\n${resumeText}`,
      schema: PROFILE_SCHEMA,
      schemaName: "career_profile",
      maxTokens: PARSE_PROFILE_OUTPUT_TOKENS * 2,
      temperature: 0,
    });

    const registry = toRegistry(completion.data);
    if (registry.experiences.length === 0 && registry.skills.length === 0) {
      throw new Error("We could not find any roles or skills in that text. Check what you pasted.");
    }

    await ctx.runMutation(internal.careerProfile.saveParsed, {
      userId,
      sourceResumeText: resumeText,
      ...registry,
    });

    await ctx.runMutation(internal.aiSettings.recordUsage, {
      userId,
      provider: completion.provider,
      model: completion.model,
      purpose: "parse_profile",
      inputTokens: completion.usage.inputTokens,
      outputTokens: completion.usage.outputTokens,
      costUsd: completion.costUsd,
    });

    return {
      experiences: registry.experiences.length,
      skills: registry.skills.length,
      education: registry.education.length,
      certifications: registry.certifications.length,
      projects: registry.projects.length,
      costUsd: completion.costUsd,
    };
  },
});
