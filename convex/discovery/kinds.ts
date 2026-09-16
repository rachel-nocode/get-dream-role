/**
 * Catalogue of the job sources a user can watch.
 *
 * Plain TypeScript so the sources UI, the public mutations and the fetchers
 * all describe a source the same way. Public catalogue data only.
 */

import type { JobSourceKind } from "../validators";

export type SourceKindInfo = {
  id: JobSourceKind;
  label: string;
  /** Feeds are site-wide: they have no board token or company id. */
  feed: boolean;
  /** What the identifier is called in the UI. */
  identifierLabel: string;
  placeholder: string;
  help: string;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const COMPANY_ID_PATTERN = /^[a-zA-Z0-9]+$/;

export const SOURCE_KINDS: Record<JobSourceKind, SourceKindInfo> = {
  greenhouse: {
    id: "greenhouse",
    label: "Greenhouse",
    feed: false,
    identifierLabel: "Board token",
    placeholder: "boards.greenhouse.io/<token>",
    help: "The token in the board URL, for example acme.",
  },
  lever: {
    id: "lever",
    label: "Lever",
    feed: false,
    identifierLabel: "Company site",
    placeholder: "jobs.lever.co/<site>",
    help: "The site name in the postings URL, for example acme.",
  },
  ashby: {
    id: "ashby",
    label: "Ashby",
    feed: false,
    identifierLabel: "Org slug",
    placeholder: "jobs.ashbyhq.com/<org>",
    help: "The org slug in the job board URL, for example acme.",
  },
  smartrecruiters: {
    id: "smartrecruiters",
    label: "SmartRecruiters",
    feed: false,
    identifierLabel: "Company id",
    placeholder: "careers.smartrecruiters.com/<CompanyId>",
    help: "The company id in the careers URL, letters and numbers only.",
  },
  recruitee: {
    id: "recruitee",
    label: "Recruitee",
    feed: false,
    identifierLabel: "Subdomain",
    placeholder: "<subdomain>.recruitee.com",
    help: "The subdomain of the careers site, for example acme.",
  },
  remotive: {
    id: "remotive",
    label: "Remotive",
    feed: true,
    identifierLabel: "",
    placeholder: "",
    help: "Remote roles, searched with your first target title.",
  },
  remoteok: {
    id: "remoteok",
    label: "RemoteOK",
    feed: true,
    identifierLabel: "",
    placeholder: "",
    help: "The RemoteOK public feed of remote roles.",
  },
  arbeitnow: {
    id: "arbeitnow",
    label: "Arbeitnow",
    feed: true,
    identifierLabel: "",
    placeholder: "",
    help: "European and remote roles from the Arbeitnow job board.",
  },
  jobicy: {
    id: "jobicy",
    label: "Jobicy",
    feed: true,
    identifierLabel: "",
    placeholder: "",
    help: "Remote roles from the Jobicy feed.",
  },
  himalayas: {
    id: "himalayas",
    label: "Himalayas",
    feed: true,
    identifierLabel: "",
    placeholder: "",
    help: "Remote-first companies hiring on Himalayas.",
  },
};

export const SOURCE_KIND_LIST: SourceKindInfo[] = Object.values(SOURCE_KINDS);

export function isFeedKind(kind: JobSourceKind): boolean {
  return SOURCE_KINDS[kind].feed;
}

/**
 * Cleans up a pasted identifier. Board tokens are case-insensitive slugs;
 * SmartRecruiters company ids keep their capitals; feeds have none.
 */
export function normalizeIdentifier(kind: JobSourceKind, raw: string): string {
  if (isFeedKind(kind)) return "";

  const trimmed = raw.trim().replace(/^\/+|\/+$/g, "");
  return kind === "smartrecruiters" ? trimmed : trimmed.toLowerCase();
}

/** Throws a plain-English error when an identifier cannot work. */
export function assertValidIdentifier(kind: JobSourceKind, identifier: string): void {
  const info = SOURCE_KINDS[kind];
  if (info.feed) return;

  if (identifier.length === 0) {
    throw new Error(`Add the ${info.label} ${info.identifierLabel.toLowerCase()} first.`);
  }

  const pattern = kind === "smartrecruiters" ? COMPANY_ID_PATTERN : SLUG_PATTERN;
  if (!pattern.test(identifier)) {
    throw new Error(
      kind === "smartrecruiters"
        ? "A SmartRecruiters company id is letters and numbers only."
        : `A ${info.label} ${info.identifierLabel.toLowerCase()} is lowercase letters, numbers and dashes only.`,
    );
  }
}

export function defaultSourceLabel(kind: JobSourceKind, identifier: string): string {
  const info = SOURCE_KINDS[kind];
  return info.feed ? info.label : `${info.label} · ${identifier}`;
}
