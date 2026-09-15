import { expect, test } from "@playwright/test";
import {
  NEUTRAL_PREFERENCES,
  NO_PROFILE_MAX_SCORE,
  NO_TITLE_MATCH_MAX_SCORE,
  PREFILTER_LLM_THRESHOLD,
  dedupeKey,
  prefilterBreakdown,
  prefilterScore,
  prefilterScoreFor,
  type PrefilterJob,
} from "../convex/discovery/prefilter";
import type { JobPreferences } from "../convex/validators";

const NOW = Date.UTC(2026, 8, 15);
const DAY = 24 * 60 * 60 * 1000;

const preferences: JobPreferences = {
  targetTitles: ["Senior Frontend Engineer", "Staff Product Manager"],
  locations: ["Berlin", "Lisbon"],
  remote: "remote",
  salaryMin: 120_000,
  salaryCurrency: "USD",
  employmentTypes: ["full-time"],
  dealBreakers: ["on-call rotation"],
  mustHaves: ["TypeScript"],
};

function job(overrides: Partial<PrefilterJob> = {}): PrefilterJob {
  return {
    title: "Senior Frontend Engineer",
    company: "Acme",
    remote: true,
    url: "https://boards.greenhouse.io/acme/jobs/1",
    postedAt: NOW,
    ...overrides,
  };
}

test.describe("prefilter scoring", () => {
  test("an exact title match on a fresh remote posting scores high", () => {
    const breakdown = prefilterBreakdown(
      job({ salaryMin: 140_000, salaryMax: 180_000 }),
      preferences,
      NOW,
    );

    expect(breakdown.title).toBe(50);
    expect(breakdown.location).toBe(25);
    expect(breakdown.recency).toBe(15);
    expect(breakdown.salary).toBe(10);
    expect(breakdown.total).toBe(100);
  });

  test("normalizes title spelling variants before comparing", () => {
    expect(prefilterBreakdown(job({ title: "Sr. Front-End Developer" }), preferences, NOW).title).toBe(
      50,
    );
    expect(prefilterBreakdown(job({ title: "Staff Product Manager" }), preferences, NOW).title).toBe(
      50,
    );
    expect(prefilterBreakdown(job({ title: "Warehouse Associate" }), preferences, NOW).title).toBe(0);
  });

  test("a remote posting matches a remote preference in full", () => {
    expect(prefilterBreakdown(job({ remote: true }), preferences, NOW).location).toBe(25);
  });

  test("an onsite posting scores zero on location for a remote-only seeker", () => {
    const onsite = job({ remote: false, location: "Austin, TX" });
    expect(prefilterBreakdown(onsite, preferences, NOW).location).toBe(0);
  });

  test("an onsite posting in a preferred city still scores full location", () => {
    const onsite = job({ remote: false, location: "Berlin, Germany" });
    expect(prefilterBreakdown(onsite, preferences, NOW).location).toBe(25);
  });

  test("recency decays over thirty days and is neutral when unknown", () => {
    expect(prefilterBreakdown(job({ postedAt: NOW - 15 * DAY }), preferences, NOW).recency).toBe(8);
    expect(prefilterBreakdown(job({ postedAt: NOW - 45 * DAY }), preferences, NOW).recency).toBe(0);
    expect(prefilterBreakdown(job({ postedAt: undefined }), preferences, NOW).recency).toBe(8);

    const fresh = prefilterScore(job(), preferences, NOW);
    const stale = prefilterScore(job({ postedAt: NOW - 29 * DAY }), preferences, NOW);
    expect(stale).toBeLessThan(fresh);
  });

  test("salary below the floor scores zero on that component", () => {
    expect(
      prefilterBreakdown(job({ salaryMin: 80_000, salaryMax: 95_000 }), preferences, NOW).salary,
    ).toBe(0);
    expect(
      prefilterBreakdown(job({ salaryMin: 130_000, salaryMax: 160_000 }), preferences, NOW).salary,
    ).toBe(10);
    expect(prefilterBreakdown(job(), preferences, NOW).salary).toBe(5);
  });

  test("neutral preferences keep every job under the no-profile ceiling", () => {
    const score = prefilterScoreFor(job(), null, NOW);
    expect(score).toBeLessThanOrEqual(NO_PROFILE_MAX_SCORE);
    expect(prefilterScore(job(), NEUTRAL_PREFERENCES, NOW)).toBeGreaterThan(score - 1);
    expect(prefilterScoreFor(job(), preferences, NOW)).toBeGreaterThan(NO_PROFILE_MAX_SCORE);
  });

  test("the LLM threshold sits between a weak and a strong match", () => {
    expect(PREFILTER_LLM_THRESHOLD).toBe(35);

    const weak = prefilterScore(
      job({ title: "Warehouse Associate", remote: false, location: "Austin, TX", postedAt: NOW - 45 * DAY }),
      preferences,
      NOW,
    );
    expect(weak).toBeLessThan(PREFILTER_LLM_THRESHOLD);
    expect(prefilterScore(job(), preferences, NOW)).toBeGreaterThan(PREFILTER_LLM_THRESHOLD);
  });

  test("a remote posting with no title overlap never reaches the model", () => {
    // Location, recency and salary alone would add up to 50 here.
    const unrelated = job({ title: "Warehouse Associate", remote: true, salaryMin: 150_000 });
    const breakdown = prefilterBreakdown(unrelated, preferences, NOW);

    expect(breakdown.title).toBe(0);
    expect(breakdown.total).toBe(NO_TITLE_MATCH_MAX_SCORE);
    expect(breakdown.total).toBeLessThan(PREFILTER_LLM_THRESHOLD);
  });

  test("the title ceiling does not apply when no target titles are set", () => {
    const total = prefilterBreakdown(job({ title: "Warehouse Associate" }), NEUTRAL_PREFERENCES, NOW).total;
    expect(total).toBeGreaterThan(NO_TITLE_MATCH_MAX_SCORE);
  });
});

test.describe("dedupe keys", () => {
  test("ignores case, whitespace and url noise", () => {
    const first = dedupeKey({
      company: "Acme",
      title: "Senior Frontend Engineer",
      url: "https://Boards.Greenhouse.io/acme/jobs/1/",
    });
    const second = dedupeKey({
      company: "  acme ",
      title: "senior frontend engineer",
      url: "https://boards.greenhouse.io/acme/jobs/1?utm_source=feed#apply",
    });

    expect(first).toBe(second);
    expect(first).toBe("acme|senior frontend engineer|boards.greenhouse.io/acme/jobs/1");
  });

  test("separates different postings and survives a malformed url", () => {
    const base = { company: "Acme", title: "Senior Frontend Engineer" };
    expect(dedupeKey({ ...base, url: "https://acme.com/jobs/1" })).not.toBe(
      dedupeKey({ ...base, url: "https://acme.com/jobs/2" }),
    );
    expect(dedupeKey({ ...base, url: "not a url" })).toBe(
      "acme|senior frontend engineer|not a url",
    );
  });
});
