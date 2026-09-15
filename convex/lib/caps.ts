/**
 * The rails that keep applying deliberate: a daily cap, a limit on how many
 * applications can be open at one company, a cooldown before applying there
 * again, and how often a follow-up is welcome. Pure TypeScript with no Convex
 * imports, so the caller gathers the counts and this file only decides.
 *
 * Volume is what gets candidates flagged as bots; these three numbers are the
 * cheapest way to stay on the human side of that line.
 */

export const DEFAULT_DAILY_SUBMIT_CAP = 10;
export const MAX_OPEN_PER_COMPANY = 2;
export const COMPANY_COOLDOWN_DAYS = 30;

/**
 * Follow-up cadence, from the same research: the first nudge a week out, the
 * second a fortnight after that, and never a third.
 */
export const FIRST_FOLLOWUP_DAYS = 7;
export const SECOND_FOLLOWUP_DAYS = 14;
export const MAX_FOLLOWUPS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * One company, one key: lowercased, trimmed, punctuation dropped and runs of
 * whitespace collapsed, so "Acme, Inc." and "acme inc" are the same employer.
 */
export function companyKeyFor(company: string): string {
  return company
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export type CapVerdict = { ok: true } | { ok: false; reason: string };

export type CapInput = {
  /** Applications this user already marked submitted today. */
  submittedToday: number;
  dailyCap: number;
  /** Applications at this company that are still open, this one excluded. */
  openAtCompany: number;
  /** When this user last submitted to this company, if they ever did. */
  lastSubmittedAtCompany: number | null;
  now: number;
};

function daysBetween(from: number, to: number): number {
  return Math.floor((to - from) / DAY_MS);
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function canSubmit(input: CapInput): CapVerdict {
  if (input.submittedToday >= input.dailyCap) {
    return {
      ok: false,
      reason: `You have already marked ${plural(
        input.submittedToday,
        "application",
      )} submitted today, which is your daily cap. Pick this up tomorrow, or raise the cap in Settings -> AI.`,
    };
  }

  if (input.openAtCompany >= MAX_OPEN_PER_COMPANY) {
    return {
      ok: false,
      reason: `You already have ${plural(
        input.openAtCompany,
        "open application",
      )} at this company. Hear back on one before you send another.`,
    };
  }

  if (input.lastSubmittedAtCompany !== null) {
    const elapsed = daysBetween(input.lastSubmittedAtCompany, input.now);
    if (elapsed < COMPANY_COOLDOWN_DAYS) {
      return {
        ok: false,
        reason: `You applied to this company ${plural(
          Math.max(0, elapsed),
          "day",
        )} ago. Leave ${COMPANY_COOLDOWN_DAYS} days between applications to the same employer.`,
      };
    }
  }

  return { ok: true };
}
