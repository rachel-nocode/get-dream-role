import { expect, test } from "@playwright/test";
import {
  NEEDS_ANSWER,
  answerBankKeyFor,
  buildFactRegistry,
  computeAtsScore,
  computeMatchScore,
  filterEvidenceIds,
  reassembleResume,
  resolveBankAnswer,
  stripJobBoilerplate,
  type ProfileFacts,
  type RewriteOutput,
} from "../convex/ai/tailor";
import { verifyTailoring, type VerifyResult } from "../convex/ai/verify";
import type { AnswerBankEntry } from "../convex/validators";

const profile: ProfileFacts = {
  experiences: [
    {
      id: "exp_1",
      company: "Northwind",
      title: "Backend Engineer",
      location: "Berlin",
      startDate: "Mar 2021",
      endDate: "Present",
      bullets: [
        { id: "b_1_1", text: "Cut checkout latency by 20% by rewriting the payments queue" },
        { id: "b_1_2", text: "Mentored three junior engineers through their first on-call rotation" },
      ],
    },
    {
      id: "exp_2",
      company: "Lumen",
      title: "Software Engineer",
      startDate: "Jan 2018",
      endDate: "Feb 2021",
      bullets: [{ id: "b_2_1", text: "Built internal reporting tools in Python" }],
    },
  ],
  skills: [
    { id: "sk_1", name: "Python" },
    { id: "sk_2", name: "PostgreSQL" },
  ],
  education: [{ id: "edu_1", school: "TU Delft", degree: "BSc", field: "Computer Science" }],
  certifications: [],
  projects: [],
};

const PROFILE_TEXT = [
  "Backend Engineer, Northwind, Mar 2021 - Present",
  "Cut checkout latency by 20% by rewriting the payments queue",
  "Mentored three junior engineers through their first on-call rotation",
  "Software Engineer, Lumen, Jan 2018 - Feb 2021",
  "Built internal reporting tools in Python",
  "Skills: Python, PostgreSQL",
].join("\n");

function rewriteOf(
  bullets: Record<string, { text: string; evidenceIds: string[] }>,
  options: { summary?: string; skipExperience?: string } = {},
): RewriteOutput {
  return {
    summary: options.summary ?? "",
    skillsOrder: ["Python", "PostgreSQL"],
    experiences: profile.experiences
      .filter((experience) => experience.id !== options.skipExperience)
      .map((experience) => ({
        id: experience.id,
        bullets: experience.bullets.map((bullet) => ({
          id: bullet.id,
          text: bullets[bullet.id]?.text ?? bullet.text,
          evidenceIds: bullets[bullet.id]?.evidenceIds ?? [bullet.id],
        })),
      })),
  };
}

function verify(
  rewrite: RewriteOutput,
  coverLetter = "",
  posting: { allowedContext?: string[]; jobKeywords?: string[] } = {},
): VerifyResult {
  return verifyTailoring({
    facts: buildFactRegistry(profile),
    experiences: profile.experiences,
    rewrite,
    coverLetter,
    profileText: PROFILE_TEXT,
    ...posting,
  });
}

function bulletText(result: VerifyResult, bulletId: string): string {
  const bullet = result.experiences
    .flatMap((experience) => experience.bullets)
    .find((entry) => entry.id === bulletId);
  return bullet?.text ?? "";
}

test.describe("verify: fabrication", () => {
  test("flags a tool the profile never names", () => {
    const result = verify(
      rewriteOf({
        b_1_1: {
          text: "Cut checkout latency by 20% by rewriting the payments queue on TensorFlow",
          evidenceIds: ["b_1_1"],
        },
      }),
    );

    expect(result.flaggedClaims.map((claim) => claim.text)).toContain("TensorFlow");
    expect(result.flaggedClaims[0].status).toBe("pending");
    // A flagged claim is for the user to settle; it does not fail the report.
    expect(result.report.passed).toBe(true);
  });

  test("passes a bullet that only rephrases what the profile says", () => {
    const result = verify(
      rewriteOf({
        b_1_1: {
          text: "Rewrote the payments queue and cut checkout latency by 20%",
          evidenceIds: ["b_1_1"],
        },
      }),
    );

    expect(result.flaggedClaims).toEqual([]);
    expect(result.report.issues).toEqual([]);
    expect(result.report.passed).toBe(true);
    expect(bulletText(result, "b_1_1")).toContain("Rewrote the payments queue");
  });

  test("flags a percentage the profile does not have", () => {
    const result = verify(
      rewriteOf({
        b_1_1: {
          text: "Cut checkout latency by 45% by rewriting the payments queue",
          evidenceIds: ["b_1_1"],
        },
      }),
    );

    expect(result.flaggedClaims.map((claim) => claim.text)).toContain("45%");
  });

  test("flags a posting keyword the profile does not support", () => {
    const result = verify(
      rewriteOf({
        b_2_1: {
          text: "Built internal reporting tools in Python and Kafka",
          evidenceIds: ["b_2_1"],
        },
      }),
      "",
      { jobKeywords: ["Python", "Kafka"] },
    );

    // The posting's own words are not a whitelist: that would be stuffing.
    expect(result.flaggedClaims.map((claim) => claim.text)).toEqual(["Kafka"]);
  });

  test("does not flag the company or the role being applied to", () => {
    const result = verify(rewriteOf({}), "Acme Robotics runs the payments work I want next.", {
      allowedContext: ["Acme Robotics", "Senior Backend Engineer"],
    });

    expect(result.flaggedClaims).toEqual([]);
  });

  test("flags a new acronym in the cover letter", () => {
    const result = verify(rewriteOf({}), "I run payments infrastructure and hold an AWS badge.");

    expect(result.flaggedClaims.map((claim) => claim.text)).toContain("AWS");
  });
});

test.describe("verify: structure and evidence", () => {
  test("fails the report when an experience goes missing", () => {
    const result = verify(rewriteOf({}, { skipExperience: "exp_2" }));

    expect(result.report.passed).toBe(false);
    expect(result.report.issues.join(" ")).toContain("but your profile has 2");
    // The dropped role keeps the user's own wording.
    expect(bulletText(result, "b_2_1")).toBe("Built internal reporting tools in Python");
    expect(result.experiences).toHaveLength(2);
  });

  test("reverts a bullet that cites an evidence id the profile does not have", () => {
    const result = verify(
      rewriteOf({
        b_2_1: { text: "Built a data platform in Python", evidenceIds: ["b_9_9"] },
      }),
    );

    expect(bulletText(result, "b_2_1")).toBe("Built internal reporting tools in Python");
    expect(result.report.issues.join(" ")).toContain("cited no fact from your profile");
    expect(result.report.passed).toBe(true);
  });

  test("drops an invented bullet id and fails the report", () => {
    const rewrite = rewriteOf({});
    rewrite.experiences[0].bullets.push({
      id: "b_1_9",
      text: "Led the migration to a service mesh",
      evidenceIds: ["b_1_1"],
    });

    const result = verify(rewrite);

    expect(result.report.passed).toBe(false);
    expect(bulletText(result, "b_1_9")).toBe("");
  });

  test("keeps only evidence ids the profile has", () => {
    const valid = new Set(buildFactRegistry(profile).map((fact) => fact.id));

    expect(filterEvidenceIds(["b_1_1", "sk_1", "b_9_9", "b_1_1"], valid)).toEqual([
      "b_1_1",
      "sk_1",
    ]);
  });
});

test.describe("verify: language", () => {
  test("reports a banned phrase without failing the report", () => {
    const result = verify(
      rewriteOf({
        b_1_1: {
          text: "Spearheaded the payments queue rewrite that cut checkout latency by 20%",
          evidenceIds: ["b_1_1"],
        },
      }),
    );

    expect(result.report.issues.join(" ")).toContain("spearhead");
    expect(result.report.passed).toBe(true);
  });

  test("leaves the user's own wording alone", () => {
    const result = verify(rewriteOf({}));

    expect(result.report.issues).toEqual([]);
    expect(result.flaggedClaims).toEqual([]);
  });
});

test.describe("resume reassembly", () => {
  test("takes employers, titles and dates from the profile, not the model", () => {
    const result = verify(
      rewriteOf(
        { b_1_1: { text: "Rewrote the payments queue", evidenceIds: ["b_1_1"] } },
        { summary: "Backend engineer working on payments." },
      ),
    );

    const resume = reassembleResume({
      contact: { fullName: "Ada Byron", email: "ada@example.com" },
      summary: result.summary,
      profile,
      experiences: result.experiences,
      skillsOrder: result.skillsOrder,
    });

    expect(resume).toContain("Backend Engineer — Northwind");
    expect(resume).toContain("Berlin · Mar 2021 - Present");
    expect(resume).toContain("- Rewrote the payments queue");
    expect(resume).toContain("SKILLS\nPython, PostgreSQL");
    expect(resume).toContain("BSc, Computer Science — TU Delft");
  });
});

test.describe("posting boilerplate", () => {
  const posting = [
    "About the role",
    "We need a backend engineer who enjoys payments work.",
    "",
    "Responsibilities",
    "- Own the payments queue",
    "- Mentor engineers",
    "",
    "Benefits",
    "- Free lunch",
    "- 30 days of holiday",
    "",
    "Requirements",
    "- 5 years of Python",
    "",
    "Equal Opportunity",
    "Northwind is an equal opportunity employer and considers every applicant fairly.",
  ].join("\n");

  test("removes the trailing equal opportunity section and keeps the responsibilities", () => {
    const stripped = stripJobBoilerplate(posting);

    expect(stripped).toContain("Own the payments queue");
    expect(stripped).toContain("Mentor engineers");
    expect(stripped.toLowerCase()).not.toContain("equal opportunity");
  });

  test("removes a benefits section but resumes at the next heading", () => {
    const stripped = stripJobBoilerplate(posting);

    expect(stripped).not.toContain("Free lunch");
    expect(stripped).not.toContain("30 days of holiday");
    expect(stripped).toContain("5 years of Python");
  });
});

test.describe("answer bank", () => {
  const bank = (answer: string): AnswerBankEntry[] => [
    {
      id: "ans_work_authorization",
      key: "work_authorization",
      question: "Are you legally authorized to work where this role is based?",
      answer,
    },
  ];

  test("maps a work authorization question to its answer bank key", () => {
    expect(answerBankKeyFor("Are you authorized to work in the US?")).toBe("work_authorization");
    expect(answerBankKeyFor("Will you require visa sponsorship?")).toBe("needs_sponsorship");
    expect(answerBankKeyFor("What is your greatest weakness?")).toBeNull();
  });

  test("uses a filled answer verbatim", () => {
    const resolved = resolveBankAnswer("Are you authorized to work in the US?", bank("Yes."));

    expect(resolved?.answer).toBe("Yes.");
    expect(resolved?.confidence).toBe("high");
    expect(resolved?.sourceKey).toBe("work_authorization");
    expect(resolved?.needsHuman).toBeUndefined();
  });

  test("hands an empty answer back to the user instead of guessing", () => {
    const resolved = resolveBankAnswer("Are you authorized to work in the US?", bank(""));

    expect(resolved?.answer).toBe(NEEDS_ANSWER);
    expect(resolved?.confidence).toBe("low");
    expect(resolved?.needsHuman).toBeTruthy();
  });
});

test.describe("scores", () => {
  test("match score counts the required lines a fact directly supports", () => {
    const evidenceMap = [
      { requirement: "Python", evidenceIds: ["sk_1"], strength: "direct" as const },
      { requirement: "Kafka", evidenceIds: [], strength: "none" as const },
      { requirement: "Mentoring", evidenceIds: ["b_1_2"], strength: "analogous" as const },
      { requirement: "Rust", evidenceIds: ["sk_1"], strength: "transferable" as const },
    ];

    expect(computeMatchScore(evidenceMap, ["Python", "Kafka", "Mentoring", "Rust"])).toBe(50);
  });

  test("ats score falls with issues and pending claims, never below the floor", () => {
    expect(computeAtsScore(0, 0)).toBe(100);
    expect(computeAtsScore(2, 1)).toBe(87);
    expect(computeAtsScore(30, 30)).toBe(40);
  });
});
