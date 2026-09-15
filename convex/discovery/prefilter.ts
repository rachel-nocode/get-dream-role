/**
 * Free, deterministic pre-filter that runs before any paid scoring call.
 *
 * Pure TypeScript with no Convex imports so it can be unit tested and reused
 * by the discovery actions and the queue UI. A job that scores under
 * `PREFILTER_LLM_THRESHOLD` is still stored, it is just never sent to a model.
 */

import type { JobPreferences } from "../validators";

export const PREFILTER_LLM_THRESHOLD = 35;

/** Ceiling applied while the user has no profile, so nothing looks certain. */
export const NO_PROFILE_MAX_SCORE = 40;

export const DEFAULT_SCORE_BATCH = 15;
export const MAX_SCORE_BATCH = 30;

/** Postings older than this stop earning recency points. */
export const RECENCY_WINDOW_DAYS = 30;

const TITLE_MAX = 50;
const LOCATION_MAX = 25;
const RECENCY_MAX = 15;
const SALARY_MAX = 10;

/** Credit for a title we cannot judge because no target titles are set. */
const UNKNOWN_TITLE_SCORE = 20;
const UNKNOWN_LOCATION_SCORE = 12;
const UNKNOWN_RECENCY_SCORE = 8;
const UNKNOWN_SALARY_SCORE = 5;
const DISCLOSED_SALARY_SCORE = 8;

const DAY_MS = 24 * 60 * 60 * 1000;

export const NEUTRAL_PREFERENCES: JobPreferences = {
  targetTitles: [],
  locations: [],
  remote: "any",
  employmentTypes: [],
  dealBreakers: [],
  mustHaves: [],
};

export type PrefilterJob = {
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  url: string;
  postedAt?: number;
  salaryMin?: number;
  salaryMax?: number;
};

export type PrefilterBreakdown = {
  title: number;
  location: number;
  recency: number;
  salary: number;
  total: number;
};

/** Multi-word spellings that mean the same role, collapsed before tokenizing. */
const PHRASE_SYNONYMS: Array<[RegExp, string]> = [
  [/front[\s-]?end/g, "frontend"],
  [/back[\s-]?end/g, "backend"],
  [/full[\s-]?stack/g, "fullstack"],
  [/product manager/g, "pm"],
];

const TOKEN_SYNONYMS: Record<string, string> = {
  developer: "engineer",
  developers: "engineer",
  dev: "engineer",
  engineering: "engineer",
  programmer: "engineer",
  sr: "senior",
  snr: "senior",
  jr: "junior",
  mgr: "manager",
};

const STOP_TOKENS = new Set(["a", "an", "and", "at", "for", "in", "of", "or", "the", "to"]);

function canonicalTokens(value: string): string[] {
  let text = value.toLowerCase();
  for (const [pattern, replacement] of PHRASE_SYNONYMS) {
    text = text.replace(pattern, replacement);
  }

  return text
    .split(/[^a-z0-9+#]+/)
    .filter((token) => token.length > 0 && !STOP_TOKENS.has(token))
    .map((token) => TOKEN_SYNONYMS[token] ?? token);
}

function titleScore(job: PrefilterJob, preferences: JobPreferences): number {
  const targets = preferences.targetTitles
    .map(canonicalTokens)
    .filter((tokens) => tokens.length > 0);
  if (targets.length === 0) return UNKNOWN_TITLE_SCORE;

  const jobTokens = new Set(canonicalTokens(job.title));
  let best = 0;
  for (const target of targets) {
    const matched = target.filter((token) => jobTokens.has(token)).length;
    best = Math.max(best, matched / target.length);
  }

  return Math.round(TITLE_MAX * best);
}

function locationScore(job: PrefilterJob, preferences: JobPreferences): number {
  const wantsRemote = preferences.remote === "remote" || preferences.remote === "any";
  if (job.remote && wantsRemote) return LOCATION_MAX;

  const haystack = (job.location ?? "").toLowerCase();
  const matchesPreferredCity = preferences.locations.some((entry) => {
    const needle = entry.trim().toLowerCase();
    return needle.length > 0 && haystack.includes(needle);
  });
  if (matchesPreferredCity) return LOCATION_MAX;

  // Onsite role for someone who only wants remote work: no credit at all.
  if (!job.remote && preferences.remote === "remote") return 0;

  if (job.remote || preferences.locations.length === 0) return UNKNOWN_LOCATION_SCORE;
  return 0;
}

function recencyScore(job: PrefilterJob, now: number): number {
  if (job.postedAt === undefined) return UNKNOWN_RECENCY_SCORE;

  const days = (now - job.postedAt) / DAY_MS;
  if (days <= 0) return RECENCY_MAX;
  if (days >= RECENCY_WINDOW_DAYS) return 0;
  return Math.round(RECENCY_MAX * (1 - days / RECENCY_WINDOW_DAYS));
}

function salaryScore(job: PrefilterJob, preferences: JobPreferences): number {
  const top = job.salaryMax ?? job.salaryMin;
  if (top === undefined || top <= 0) return UNKNOWN_SALARY_SCORE;
  if (preferences.salaryMin === undefined) return DISCLOSED_SALARY_SCORE;
  return top >= preferences.salaryMin ? SALARY_MAX : 0;
}

export function prefilterBreakdown(
  job: PrefilterJob,
  preferences: JobPreferences,
  now: number = Date.now(),
): PrefilterBreakdown {
  const title = titleScore(job, preferences);
  const location = locationScore(job, preferences);
  const recency = recencyScore(job, now);
  const salary = salaryScore(job, preferences);

  return {
    title,
    location,
    recency,
    salary,
    total: Math.max(0, Math.min(100, title + location + recency + salary)),
  };
}

export function prefilterScore(
  job: PrefilterJob,
  preferences: JobPreferences,
  now: number = Date.now(),
): number {
  return prefilterBreakdown(job, preferences, now).total;
}

/** Scoring entry point for the scan: a user with no profile gets a ceiling. */
export function prefilterScoreFor(
  job: PrefilterJob,
  preferences: JobPreferences | null,
  now: number = Date.now(),
): number {
  if (preferences) return prefilterScore(job, preferences, now);
  return Math.min(NO_PROFILE_MAX_SCORE, prefilterScore(job, NEUTRAL_PREFERENCES, now));
}

function urlKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Identity of a posting across feeds that list the same job. */
export function dedupeKey(job: { company: string; title: string; url: string }): string {
  return [job.company.trim().toLowerCase(), job.title.trim().toLowerCase(), urlKey(job.url)].join(
    "|",
  );
}
