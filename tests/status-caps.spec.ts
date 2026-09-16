import { expect, test } from "@playwright/test";
import {
  COMPANY_COOLDOWN_DAYS,
  MAX_OPEN_PER_COMPANY,
  canSubmit,
  companyKeyFor,
} from "../convex/lib/caps";
import {
  PIPELINE_STATUSES,
  TERMINAL_STATUSES,
  awaitsReply,
  isOpen,
  normalizeStatus,
} from "../convex/lib/status";

const NOW = Date.UTC(2026, 8, 15);
const DAY = 24 * 60 * 60 * 1000;

function input(overrides: Partial<Parameters<typeof canSubmit>[0]> = {}) {
  return {
    submittedToday: 0,
    dailyCap: 10,
    openAtCompany: 0,
    lastSubmittedAtCompany: null,
    now: NOW,
    ...overrides,
  };
}

test.describe("status normalization", () => {
  test("the retired literals map onto the stages that replaced them", () => {
    expect(normalizeStatus("draft")).toBe("drafted");
    expect(normalizeStatus("ready")).toBe("needs_review");
    expect(normalizeStatus("opened")).toBe("needs_review");
  });

  test("every pipeline status normalizes to itself", () => {
    for (const status of PIPELINE_STATUSES) {
      expect(normalizeStatus(status)).toBe(status);
    }
  });

  test("open means the application can still turn into something", () => {
    expect(isOpen("needs_review")).toBe(true);
    expect(isOpen("submitted")).toBe(true);
    expect(isOpen("interview")).toBe(true);
    // The old literals go through the same check.
    expect(isOpen("ready")).toBe(true);

    for (const status of TERMINAL_STATUSES) {
      expect(isOpen(status)).toBe(false);
    }
  });

  test("a follow-up only makes sense while a reply is still owed", () => {
    expect(awaitsReply("submitted")).toBe(true);
    expect(awaitsReply("interview")).toBe(true);
    expect(awaitsReply("approved")).toBe(false);
    expect(awaitsReply("offer")).toBe(false);
    expect(awaitsReply("rejected")).toBe(false);
    expect(awaitsReply("ghosted")).toBe(false);
  });
});

test.describe("company keys", () => {
  test("case, padding and punctuation do not make a second employer", () => {
    expect(companyKeyFor("  Acme, Inc.  ")).toBe("acme inc");
    expect(companyKeyFor("ACME Inc")).toBe("acme inc");
    expect(companyKeyFor("Acme   Inc.")).toBe("acme inc");
  });

  test("different employers keep different keys", () => {
    expect(companyKeyFor("Acme")).not.toBe(companyKeyFor("Acme Labs"));
  });
});

test.describe("submit caps", () => {
  test("allows a submit when nothing is in the way", () => {
    expect(canSubmit(input())).toEqual({ ok: true });
  });

  test("allows the last submit under the daily cap", () => {
    expect(canSubmit(input({ submittedToday: 9, dailyCap: 10 }))).toEqual({ ok: true });
  });

  test("blocks once the daily cap is reached", () => {
    const verdict = canSubmit(input({ submittedToday: 10, dailyCap: 10 }));

    expect(verdict.ok).toBe(false);
    expect(verdict.ok === false && verdict.reason).toContain("daily cap");
  });

  test("blocks a third open application at one company", () => {
    expect(canSubmit(input({ openAtCompany: MAX_OPEN_PER_COMPANY - 1 }))).toEqual({ ok: true });

    const verdict = canSubmit(input({ openAtCompany: MAX_OPEN_PER_COMPANY }));

    expect(verdict.ok).toBe(false);
    expect(verdict.ok === false && verdict.reason).toContain("open application");
  });

  test("blocks a second application to the same company inside 30 days", () => {
    const verdict = canSubmit(input({ lastSubmittedAtCompany: NOW - 12 * DAY }));

    expect(verdict.ok).toBe(false);
    expect(verdict.ok === false && verdict.reason).toContain("12 days ago");
  });

  test("allows the same company again after 31 days", () => {
    expect(canSubmit(input({ lastSubmittedAtCompany: NOW - 31 * DAY }))).toEqual({ ok: true });
  });

  test("the cooldown ends exactly on the thirtieth day", () => {
    expect(
      canSubmit(input({ lastSubmittedAtCompany: NOW - (COMPANY_COOLDOWN_DAYS - 1) * DAY })).ok,
    ).toBe(false);
    expect(
      canSubmit(input({ lastSubmittedAtCompany: NOW - COMPANY_COOLDOWN_DAYS * DAY })).ok,
    ).toBe(true);
  });

  test("the daily cap is reported before the company rules", () => {
    const verdict = canSubmit(
      input({ submittedToday: 10, dailyCap: 10, openAtCompany: MAX_OPEN_PER_COMPANY }),
    );

    expect(verdict.ok === false && verdict.reason).toContain("daily cap");
  });
});
