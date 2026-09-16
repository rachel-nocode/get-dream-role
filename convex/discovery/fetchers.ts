/**
 * Read-only fetchers for the job boards and free feeds a user can watch.
 *
 * Every call is an unauthenticated GET. Responses are normalized into one
 * shape so the rest of discovery never sees a board-specific field, and the
 * parsing stays tolerant: boards rename and drop fields without notice.
 */

import { humanizeSlug, stripHtml } from "../lib/html";
import type { JobSourceKind } from "../validators";
import { SOURCE_KINDS, isFeedKind } from "./kinds";

/** Descriptions are stored and sent to models, so they are capped. */
export const DESCRIPTION_CAP = 12_000;

/** SmartRecruiters needs one extra request per posting, so we stay light. */
export const SMARTRECRUITERS_DETAIL_LIMIT = 30;

const USER_AGENT = "GetDreamRole/1.0 (+https://getdreamrole.com)";
const PAGE_LIMIT = 100;

export type NormalizedJob = {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  url: string;
  applyUrl: string;
  description: string;
  postedAt?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
};

export type FetchOptions = {
  /** Feeds that support a query use the user's first target title. */
  searchTitle?: string;
};

type Fetcher = (identifier: string, options: FetchOptions) => Promise<NormalizedJob[]>;

// --- small tolerant parsing helpers -----------------------------------------

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value
    .map(asRecord)
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function optionalText(value: unknown): string | undefined {
  const result = text(value);
  return result.length > 0 ? result : undefined;
}

function plainText(value: unknown): string {
  return stripHtml(String(value ?? "")).slice(0, DESCRIPTION_CAP);
}

function joinSections(parts: Array<string | undefined>): string {
  return parts
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0)
    .join("\n\n")
    .slice(0, DESCRIPTION_CAP);
}

function parseTimestamp(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Feeds mix seconds and milliseconds since the epoch.
    const millis = value > 1e11 ? value : value * 1000;
    return millis > 0 ? millis : undefined;
  }

  const raw = text(value);
  if (raw.length === 0) return undefined;

  if (/^\d+$/.test(raw)) return parseTimestamp(Number(raw));

  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseMoney(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;

  const raw = text(value).toLowerCase().replace(/[, ]/g, "");
  const match = raw.match(/(\d+(?:\.\d+)?)(k|m)?/);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  if (match[2] === "k") return Math.round(amount * 1_000);
  if (match[2] === "m") return Math.round(amount * 1_000_000);
  return Math.round(amount);
}

const CURRENCY_SYMBOLS: Record<string, string> = { $: "USD", "€": "EUR", "£": "GBP" };

/** Pulls a range out of free text like "$120K – $150K" or "€80k-€95k". */
function parseSalarySummary(value: unknown): {
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
} {
  const raw = text(value);
  if (raw.length === 0) return {};

  const amounts = raw
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?\s*[kKmM]?/g)
    ?.map((part) => parseMoney(part))
    .filter((amount): amount is number => amount !== undefined);

  if (!amounts || amounts.length === 0) return {};

  const symbol = Object.keys(CURRENCY_SYMBOLS).find((entry) => raw.includes(entry));
  const code = raw.match(/\b(USD|EUR|GBP|CAD|AUD|CHF|SEK|INR)\b/i)?.[1]?.toUpperCase();

  return {
    salaryMin: amounts[0],
    salaryMax: amounts.length > 1 ? amounts[amounts.length - 1] : undefined,
    salaryCurrency: code ?? (symbol ? CURRENCY_SYMBOLS[symbol] : undefined),
  };
}

function looksRemote(...values: Array<unknown>): boolean {
  return values.some((value) => {
    if (typeof value === "boolean") return value;
    const raw = text(value).toLowerCase();
    return raw.includes("remote") || raw.includes("anywhere") || raw.includes("worldwide");
  });
}

function sourceName(kind: JobSourceKind, identifier: string): string {
  const info = SOURCE_KINDS[kind];
  return info.feed ? `${info.label} feed` : `${info.label} board '${identifier}'`;
}

async function getJson(url: string, label: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
    });
  } catch {
    throw new Error(`${label} could not be reached.`);
  }

  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned a response we could not read.`);
  }
}

// --- company boards ---------------------------------------------------------

async function fetchGreenhouse(identifier: string): Promise<NormalizedJob[]> {
  const label = sourceName("greenhouse", identifier);
  const body = asRecord(
    await getJson(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(identifier)}/jobs?content=true`,
      label,
    ),
  );
  const company = humanizeSlug(identifier);

  return asRecordArray(body?.jobs).map((job) => {
    const location = optionalText(asRecord(job.location)?.name);
    const url = text(job.absolute_url);

    return {
      externalId: text(job.id),
      title: text(job.title) || "Untitled role",
      company,
      location,
      remote: looksRemote(location),
      url,
      applyUrl: url,
      description: plainText(job.content),
      postedAt: parseTimestamp(job.updated_at ?? job.first_published),
    };
  });
}

async function fetchLever(identifier: string): Promise<NormalizedJob[]> {
  const label = sourceName("lever", identifier);
  const body = await getJson(
    `https://api.lever.co/v0/postings/${encodeURIComponent(identifier)}?mode=json&limit=${PAGE_LIMIT}`,
    label,
  );
  const company = humanizeSlug(identifier);

  return asRecordArray(body).map((job) => {
    const categories = asRecord(job.categories) ?? {};
    const location = optionalText(categories.location);
    const salary = asRecord(job.salaryRange) ?? {};
    const url = text(job.hostedUrl);

    return {
      externalId: text(job.id),
      title: text(job.text) || "Untitled role",
      company,
      location,
      remote: looksRemote(job.workplaceType, location),
      url,
      applyUrl: text(job.applyUrl) || `${url.replace(/\/apply$/, "")}/apply`,
      description: joinSections([
        plainText(job.descriptionPlain || job.description),
        plainText(job.additionalPlain || job.additional),
      ]),
      postedAt: parseTimestamp(job.createdAt ?? job.postedAt),
      salaryMin: parseMoney(salary.min),
      salaryMax: parseMoney(salary.max),
      salaryCurrency: optionalText(salary.currency),
    };
  });
}

/** Shared by the board scan and the single-posting URL importer. */
export function normalizeAshbyJob(job: Record<string, unknown>, org: string): NormalizedJob {
  const compensation = asRecord(job.compensation) ?? {};
  const salary = parseSalarySummary(compensation.compensationTierSummary);
  const location = optionalText(job.location);
  const url = text(job.jobUrl);

  return {
    externalId: text(job.id),
    title: text(job.title) || "Untitled role",
    company: text(job.organizationName) || humanizeSlug(org),
    location,
    remote: looksRemote(job.isRemote, location),
    url,
    applyUrl: text(job.applyUrl) || url,
    description: plainText(job.descriptionPlain || job.descriptionHtml),
    postedAt: parseTimestamp(job.publishedAt ?? job.updatedAt),
    ...salary,
  };
}

export function ashbyBoardUrl(org: string): string {
  return `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org)}?includeCompensation=true`;
}

/** Raw postings from an Ashby board, before normalization. */
export async function fetchAshbyBoard(org: string): Promise<Array<Record<string, unknown>>> {
  const body = asRecord(await getJson(ashbyBoardUrl(org), sourceName("ashby", org)));
  return asRecordArray(body?.jobs);
}

async function fetchAshby(identifier: string): Promise<NormalizedJob[]> {
  const jobs = await fetchAshbyBoard(identifier);
  return jobs.map((job) => normalizeAshbyJob(job, identifier));
}

function smartRecruitersLocation(job: Record<string, unknown>): {
  location?: string;
  remote: boolean;
} {
  const location = asRecord(job.location) ?? {};
  const parts = [optionalText(location.city), optionalText(location.region), optionalText(location.country)];
  const remote = looksRemote(location.remote);

  return {
    location: parts.filter(Boolean).join(", ") || (remote ? "Remote" : undefined),
    remote,
  };
}

async function fetchSmartRecruiters(identifier: string): Promise<NormalizedJob[]> {
  const label = sourceName("smartrecruiters", identifier);
  const company = encodeURIComponent(identifier);
  const body = asRecord(
    await getJson(
      `https://api.smartrecruiters.com/v1/companies/${company}/postings?limit=${PAGE_LIMIT}`,
      label,
    ),
  );

  const postings = asRecordArray(body?.content);
  const jobs = postings.map((job) => {
    const { location, remote } = smartRecruitersLocation(job);
    const postingId = text(job.id);
    const url =
      text(job.postingUrl) ||
      `https://jobs.smartrecruiters.com/${identifier}/${postingId}`;

    return {
      externalId: postingId,
      title: text(job.name) || "Untitled role",
      company: text(asRecord(job.company)?.name) || humanizeSlug(identifier),
      location,
      remote,
      url,
      applyUrl: text(job.applyUrl) || url,
      description: "",
      postedAt: parseTimestamp(job.releasedDate ?? job.createdOn),
    } satisfies NormalizedJob;
  });

  for (const job of jobs.slice(0, SMARTRECRUITERS_DETAIL_LIMIT)) {
    try {
      job.description = await fetchSmartRecruitersDescription(company, job.externalId, label);
    } catch {
      // A posting whose detail is gone still belongs in the queue, untouched.
    }
  }

  return jobs;
}

async function fetchSmartRecruitersDescription(
  company: string,
  postingId: string,
  label: string,
): Promise<string> {
  const detail = asRecord(
    await getJson(
      `https://api.smartrecruiters.com/v1/companies/${company}/postings/${encodeURIComponent(postingId)}`,
      label,
    ),
  );
  const sections = asRecord(asRecord(detail?.jobAd)?.sections) ?? {};

  return joinSections(
    ["companyDescription", "jobDescription", "qualifications", "additionalInformation"].map(
      (name) => plainText(asRecord(sections[name])?.text),
    ),
  );
}

async function fetchRecruitee(identifier: string): Promise<NormalizedJob[]> {
  const label = sourceName("recruitee", identifier);
  const body = asRecord(
    await getJson(`https://${encodeURIComponent(identifier)}.recruitee.com/api/offers/`, label),
  );

  return asRecordArray(body?.offers).map((job) => {
    const location =
      optionalText(job.location) ??
      optionalText([optionalText(job.city), optionalText(job.country)].filter(Boolean).join(", "));
    const url = text(job.careers_url);

    return {
      externalId: text(job.id),
      title: text(job.title) || "Untitled role",
      company: text(job.company_name) || humanizeSlug(identifier),
      location,
      remote: looksRemote(job.remote, location),
      url,
      applyUrl: text(job.careers_apply_url) || url,
      description: joinSections([plainText(job.description), plainText(job.requirements)]),
      postedAt: parseTimestamp(job.published_at),
      salaryMin: parseMoney(asRecord(job.salary)?.min),
      salaryMax: parseMoney(asRecord(job.salary)?.max),
      salaryCurrency: optionalText(asRecord(job.salary)?.currency),
    };
  });
}

// --- free remote feeds ------------------------------------------------------

async function fetchRemotive(options: FetchOptions): Promise<NormalizedJob[]> {
  const search = options.searchTitle?.trim();
  const query = search ? `&search=${encodeURIComponent(search)}` : "";
  const body = asRecord(
    await getJson(
      `https://remotive.com/api/remote-jobs?limit=${PAGE_LIMIT}${query}`,
      sourceName("remotive", ""),
    ),
  );

  return asRecordArray(body?.jobs).map((job) => {
    const url = text(job.url);

    return {
      externalId: text(job.id),
      title: text(job.title) || "Untitled role",
      company: text(job.company_name) || "Unknown company",
      location: optionalText(job.candidate_required_location) ?? "Remote",
      remote: true,
      url,
      applyUrl: url,
      description: plainText(job.description),
      postedAt: parseTimestamp(job.publication_date),
      ...parseSalarySummary(job.salary),
    };
  });
}

async function fetchRemoteOk(): Promise<NormalizedJob[]> {
  const body = await getJson("https://remoteok.com/api", sourceName("remoteok", ""));
  // The first element of the RemoteOK feed is a legal notice, not a job.
  const entries = Array.isArray(body) ? body.slice(1) : [];

  return asRecordArray(entries).map((job) => {
    const url = text(job.url);

    return {
      externalId: text(job.id) || text(job.slug),
      title: text(job.position) || text(job.title) || "Untitled role",
      company: text(job.company) || "Unknown company",
      location: optionalText(job.location) ?? "Remote",
      remote: true,
      url,
      applyUrl: text(job.apply_url) || url,
      description: plainText(job.description),
      postedAt: parseTimestamp(job.epoch ?? job.date),
      salaryMin: parseMoney(job.salary_min),
      salaryMax: parseMoney(job.salary_max),
    };
  });
}

async function fetchArbeitnow(): Promise<NormalizedJob[]> {
  const body = asRecord(
    await getJson("https://www.arbeitnow.com/api/job-board-api", sourceName("arbeitnow", "")),
  );

  return asRecordArray(body?.data).map((job) => {
    const location = optionalText(job.location);
    const url = text(job.url);

    return {
      externalId: text(job.slug),
      title: text(job.title) || "Untitled role",
      company: text(job.company_name) || "Unknown company",
      location,
      remote: looksRemote(job.remote, location),
      url,
      applyUrl: url,
      description: plainText(job.description),
      postedAt: parseTimestamp(job.created_at),
    };
  });
}

async function fetchJobicy(): Promise<NormalizedJob[]> {
  const body = asRecord(
    await getJson(
      `https://jobicy.com/api/v2/remote-jobs?count=${PAGE_LIMIT}`,
      sourceName("jobicy", ""),
    ),
  );

  return asRecordArray(body?.jobs).map((job) => {
    const url = text(job.url);

    return {
      externalId: text(job.id) || text(job.jobSlug),
      title: text(job.jobTitle) || "Untitled role",
      company: text(job.companyName) || "Unknown company",
      location: optionalText(job.jobGeo) ?? "Remote",
      remote: true,
      url,
      applyUrl: url,
      description: plainText(job.jobDescription || job.jobExcerpt),
      postedAt: parseTimestamp(job.pubDate),
      salaryMin: parseMoney(job.annualSalaryMin),
      salaryMax: parseMoney(job.annualSalaryMax),
      salaryCurrency: optionalText(job.salaryCurrency),
    };
  });
}

async function fetchHimalayas(): Promise<NormalizedJob[]> {
  const body = asRecord(
    await getJson(
      `https://himalayas.app/jobs/api?limit=${PAGE_LIMIT}`,
      sourceName("himalayas", ""),
    ),
  );

  return asRecordArray(body?.jobs).map((job) => {
    const restrictions = Array.isArray(job.locationRestrictions)
      ? job.locationRestrictions.map(text).filter(Boolean).join(", ")
      : optionalText(job.locationRestrictions);
    const url = text(job.applicationLink) || text(job.url);

    return {
      externalId: text(job.guid) || text(job.id) || url,
      title: text(job.title) || "Untitled role",
      company: text(job.companyName) || "Unknown company",
      location: restrictions || "Remote",
      remote: true,
      url,
      applyUrl: url,
      description: plainText(job.description || job.excerpt),
      postedAt: parseTimestamp(job.pubDate ?? job.publishedDate),
      salaryMin: parseMoney(job.minSalary),
      salaryMax: parseMoney(job.maxSalary),
      salaryCurrency: optionalText(job.currency ?? job.salaryCurrency),
    };
  });
}

const FETCHERS: Record<JobSourceKind, Fetcher> = {
  greenhouse: (identifier) => fetchGreenhouse(identifier),
  lever: (identifier) => fetchLever(identifier),
  ashby: (identifier) => fetchAshby(identifier),
  smartrecruiters: (identifier) => fetchSmartRecruiters(identifier),
  recruitee: (identifier) => fetchRecruitee(identifier),
  remotive: (identifier, options) => fetchRemotive(options),
  remoteok: () => fetchRemoteOk(),
  arbeitnow: () => fetchArbeitnow(),
  jobicy: () => fetchJobicy(),
  himalayas: () => fetchHimalayas(),
};

/** Fetches one source and returns postings that carry enough to be useful. */
export async function fetchSource(
  kind: JobSourceKind,
  identifier: string,
  options: FetchOptions = {},
): Promise<NormalizedJob[]> {
  if (!isFeedKind(kind) && identifier.length === 0) {
    throw new Error(`${SOURCE_KINDS[kind].label} needs a board identifier.`);
  }

  const jobs = await FETCHERS[kind](identifier, options);
  return jobs.filter((job) => job.externalId.length > 0 && job.title.length > 0 && job.url.length > 0);
}
