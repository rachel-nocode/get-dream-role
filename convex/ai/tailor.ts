/**
 * Pure helpers for the honest tailoring pipeline.
 *
 * Nothing here talks to Convex or to a provider: it is the deterministic half
 * of the pipeline, so the tests and the UI can import it directly. The model
 * only ever proposes wording; the structure of a resume, the ids it may cite,
 * the scores and the screening answers that matter are all decided here.
 */

import type {
  AnswerBankEntry,
  AnswerConfidence,
  CertificationEntry,
  EducationEntry,
  EvidenceMapEntry,
  ExperienceEntry,
  GapEntry,
  JobQuestion,
  ProjectEntry,
  SkillEntry,
} from "../validators";

/** The answer we write when only the user can answer honestly. */
export const NEEDS_ANSWER = "Needs your answer";

/** One screening answer stays short enough to paste into a form field. */
export const MAX_ANSWER_WORDS = 120;

/** How much of a posting reaches the model after boilerplate is stripped. */
export const JOB_DESCRIPTION_CHARS = 6_000;

// --- the fact registry ------------------------------------------------------

export type FactKind = "bullet" | "skill" | "project" | "certification" | "education";

/** One citable fact. `context` is shown to the model but is not the fact. */
export type ProfileFact = {
  id: string;
  kind: FactKind;
  text: string;
  context?: string;
};

export type ProfileFacts = {
  experiences: ExperienceEntry[];
  skills: SkillEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
};

function roleContext(experience: ExperienceEntry): string {
  return `${experience.title} at ${experience.company}`.trim();
}

/**
 * Every fact a tailored application is allowed to cite: resume bullets,
 * skills, projects, certifications and education. Employers, titles and dates
 * are deliberately absent: the model never rewrites those.
 */
export function buildFactRegistry(profile: ProfileFacts): ProfileFact[] {
  const facts: ProfileFact[] = [];

  for (const experience of profile.experiences) {
    for (const bullet of experience.bullets) {
      facts.push({
        id: bullet.id,
        kind: "bullet",
        text: bullet.text,
        context: roleContext(experience),
      });
    }
  }

  for (const skill of profile.skills) {
    facts.push({
      id: skill.id,
      kind: "skill",
      text: skill.name,
      context: skill.years ? `${skill.years} years` : skill.category,
    });
  }

  for (const project of profile.projects) {
    facts.push({
      id: project.id,
      kind: "project",
      text: `${project.name}: ${project.description}`.trim(),
    });
  }

  for (const certification of profile.certifications) {
    facts.push({
      id: certification.id,
      kind: "certification",
      text: certification.name,
      context: [certification.issuer, certification.year].filter(Boolean).join(" "),
    });
  }

  for (const entry of profile.education) {
    facts.push({
      id: entry.id,
      kind: "education",
      text: [entry.degree, entry.field].filter(Boolean).join(" ") || entry.school,
      context: [entry.school, entry.year].filter(Boolean).join(" "),
    });
  }

  return facts;
}

export function evidenceIdSet(facts: ProfileFact[]): Set<string> {
  return new Set(facts.map((fact) => fact.id));
}

export function factTextById(facts: ProfileFact[]): Record<string, string> {
  return Object.fromEntries(facts.map((fact) => [fact.id, fact.text]));
}

/** Drops ids the profile does not have and any duplicates, keeping order. */
export function filterEvidenceIds(ids: readonly string[], valid: Set<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (!valid.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** The fact list as the model sees it: an id, optional context, the fact. */
export function formatFactLines(facts: ProfileFact[]): string {
  return facts
    .map((fact) => {
      const context = fact.context ? ` (${fact.context})` : "";
      return `[${fact.id}] ${fact.kind}${context}: ${fact.text}`;
    })
    .join("\n");
}

// --- posting boilerplate ----------------------------------------------------

const BOILERPLATE_HEADING =
  /^(equal (employment )?opportunity|eeo|benefits|what we offer|what you('| wi)ll get|perks|compensation|salary|pay (range|transparency)|about (us|the company|our company)|who we are|our (values|culture|mission)|diversity|why (join|work)|life at |how to apply|application process)/i;

/** Sentences that are legal boilerplate wherever they appear. */
const BOILERPLATE_SENTENCE =
  /(equal opportunity employer|without regard to race|affirmative action|e-verify|reasonable accommodation)/i;

function headingText(line: string): string {
  return line
    .trim()
    .replace(/^[#>\s]+/, "")
    .replace(/[:\s]+$/, "")
    .trim();
}

/** A short line that is not a list item and does not end a sentence. */
function looksLikeHeading(line: string): boolean {
  const raw = line.trim();
  if (raw.length === 0 || /^[-*•\d]/.test(raw)) return false;

  const text = headingText(raw);
  if (text.length === 0 || text.length > 80) return false;
  if (raw.startsWith("#") || raw.endsWith(":")) return true;
  return !/[.!?]$/.test(text) && text.split(/\s+/).length <= 8;
}

/**
 * Removes the sections a posting repeats for legal and marketing reasons.
 * Dropping them before any model call keeps them out of the requirement list
 * and out of the keyword count, where they only ever add noise.
 */
export function stripJobBoilerplate(description: string): string {
  const kept: string[] = [];
  let dropping = false;

  for (const line of description.split(/\r?\n/)) {
    if (BOILERPLATE_SENTENCE.test(line)) {
      dropping = true;
      continue;
    }

    if (looksLikeHeading(line)) {
      const heading = headingText(line);
      if (BOILERPLATE_HEADING.test(heading)) {
        dropping = true;
        continue;
      }
      // Any other heading ends a boilerplate run, whether or not it is one of
      // the headings we recognise as content.
      dropping = false;
    }

    if (!dropping) kept.push(line);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// --- resume reassembly ------------------------------------------------------

export type RewrittenBullet = { id: string; text: string; evidenceIds: string[] };
export type RewrittenExperience = { id: string; bullets: RewrittenBullet[] };

/** What step 3 is allowed to return: no employers, no titles, no dates. */
export type RewriteOutput = {
  summary: string;
  experiences: RewrittenExperience[];
  skillsOrder: string[];
};

/** A bullet after verification: the wording used, plus what it came from. */
export type TailoredBullet = {
  id: string;
  text: string;
  original: string;
  evidenceIds: string[];
};

export type TailoredExperience = { id: string; bullets: TailoredBullet[] };

export type ContactDetails = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
};

function contactLine(contact: ContactDetails): string {
  return [contact.email, contact.phone, contact.location, ...(contact.links ?? [])]
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0)
    .join(" · ");
}

function dateRange(experience: ExperienceEntry): string {
  return [experience.startDate, experience.endDate || "Present"]
    .filter((part) => part.trim().length > 0)
    .join(" - ");
}

/** Skills in the order the model asked for, then everything it left out. */
export function orderSkills(skills: SkillEntry[], skillsOrder: readonly string[]): SkillEntry[] {
  const remaining = [...skills];
  const ordered: SkillEntry[] = [];

  for (const name of skillsOrder) {
    const wanted = name.trim().toLowerCase();
    const index = remaining.findIndex((skill) => skill.name.toLowerCase() === wanted);
    if (index >= 0) ordered.push(...remaining.splice(index, 1));
  }

  return [...ordered, ...remaining];
}

function section(heading: string, body: readonly string[]): string[] {
  return body.length === 0 ? [] : [heading, ...body, ""];
}

/**
 * Builds the resume text from the profile and the verified bullets. The model
 * never emits an employer, a title or a date, so the structure cannot drift.
 */
export function reassembleResume(args: {
  contact: ContactDetails;
  summary: string;
  profile: ProfileFacts;
  experiences: TailoredExperience[];
  skillsOrder: readonly string[];
}): string {
  const bulletsByExperience = new Map(
    args.experiences.map((experience) => [experience.id, experience.bullets]),
  );

  const experienceLines = args.profile.experiences.flatMap((experience) => {
    const bullets = bulletsByExperience.get(experience.id);
    const texts = bullets
      ? bullets.map((bullet) => bullet.text)
      : experience.bullets.map((bullet) => bullet.text);

    return [
      `${experience.title} — ${experience.company}`,
      [experience.location, dateRange(experience)].filter(Boolean).join(" · "),
      ...texts.map((text) => `- ${text}`),
      "",
    ];
  });

  const skills = orderSkills(args.profile.skills, args.skillsOrder).map((skill) => skill.name);
  const summary = args.summary.trim();

  const lines = [
    ...[args.contact.fullName?.trim() ?? "", contactLine(args.contact)].filter(
      (line) => line.length > 0,
    ),
    "",
    ...section("SUMMARY", summary.length > 0 ? [summary] : []),
    ...section("EXPERIENCE", experienceLines),
    ...section("SKILLS", skills.length > 0 ? [skills.join(", ")] : []),
    ...section("EDUCATION", args.profile.education.map(educationLine)),
    ...section("CERTIFICATIONS", args.profile.certifications.map(certificationLine)),
    ...section("PROJECTS", args.profile.projects.map(projectLine)),
  ];

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function educationLine(entry: EducationEntry): string {
  const degree = [entry.degree, entry.field].filter(Boolean).join(", ");
  return [degree, entry.school, entry.year].filter(Boolean).join(" — ");
}

function certificationLine(entry: CertificationEntry): string {
  return [entry.name, entry.issuer, entry.year].filter(Boolean).join(" — ");
}

function projectLine(entry: ProjectEntry): string {
  return [entry.name, entry.description, entry.link].filter(Boolean).join(" — ");
}

// --- scores, gaps and keywords ---------------------------------------------

const SUPPORTED_STRENGTHS = new Set(["direct", "analogous"]);
const ATS_FLOOR = 40;
const ATS_ISSUE_PENALTY = 5;
const ATS_CLAIM_PENALTY = 3;

/** The share of required requirements a profile fact directly supports. */
export function computeMatchScore(
  evidenceMap: EvidenceMapEntry[],
  required: readonly string[],
): number {
  const targets =
    required.length > 0 ? required : evidenceMap.map((entry) => entry.requirement);
  if (targets.length === 0) return 0;

  const byRequirement = new Map(
    evidenceMap.map((entry) => [entry.requirement.toLowerCase(), entry]),
  );
  const supported = targets.filter((requirement) => {
    const entry = byRequirement.get(requirement.toLowerCase());
    return entry !== undefined && SUPPORTED_STRENGTHS.has(entry.strength);
  }).length;

  return Math.round((supported / targets.length) * 100);
}

/** A deterministic readiness score: verifier issues and unconfirmed claims. */
export function computeAtsScore(issueCount: number, pendingClaimCount: number): number {
  const penalty = issueCount * ATS_ISSUE_PENALTY + pendingClaimCount * ATS_CLAIM_PENALTY;
  return Math.max(ATS_FLOOR, 100 - penalty);
}

/** Requirements no fact supports. Honest and visible, never stuffed. */
export function gapsFrom(
  evidenceMap: EvidenceMapEntry[],
  required: readonly string[],
): GapEntry[] {
  const requiredSet = new Set(required.map((entry) => entry.toLowerCase()));

  return evidenceMap
    .filter((entry) => entry.strength === "none" || entry.evidenceIds.length === 0)
    .map((entry) => {
      const isRequired = requiredSet.has(entry.requirement.toLowerCase());
      return {
        requirement: entry.requirement,
        severity: isRequired ? ("required" as const) : ("preferred" as const),
        suggestion: isRequired
          ? "The posting needs this. Add it in your profile only if it is true."
          : "A nice to have you cannot show yet. Add it in your profile only if it is true.",
      };
    });
}

/** Which of the posting's own terms the tailored resume actually earns. */
export function splitKeywords(
  keywords: readonly string[],
  resumeText: string,
): { present: string[]; missing: string[] } {
  const haystack = resumeText.toLowerCase();
  const present: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (trimmed.length === 0) continue;
    (haystack.includes(trimmed.toLowerCase()) ? present : missing).push(trimmed);
  }

  return { present, missing };
}

// --- usage ------------------------------------------------------------------

export type StepUsage = { inputTokens: number; outputTokens: number; costUsd: number };

export function sumUsage(steps: readonly StepUsage[]): StepUsage {
  const totals = steps.reduce(
    (sum, step) => ({
      inputTokens: sum.inputTokens + step.inputTokens,
      outputTokens: sum.outputTokens + step.outputTokens,
      costUsd: sum.costUsd + step.costUsd,
    }),
    { inputTokens: 0, outputTokens: 0, costUsd: 0 },
  );

  return { ...totals, costUsd: Math.round(totals.costUsd * 1_000_000) / 1_000_000 };
}

// --- screening answers ------------------------------------------------------

/**
 * Screening questions that must come from the answer bank, never a model.
 * Order matters: a question about visa sponsorship names a visa too.
 */
export const ANSWER_KEY_MATCHERS: ReadonlyArray<{ key: string; pattern: RegExp }> = [
  { key: "needs_sponsorship", pattern: /sponsor/i },
  { key: "work_authorization", pattern: /authoriz|authoris|work permit|visa|right to work/i },
  { key: "relocation", pattern: /relocat/i },
  { key: "security_clearance", pattern: /clearance/i },
  { key: "notice_period", pattern: /notice/i },
  { key: "salary_expectation", pattern: /salary|compensation|pay expectation|desired pay/i },
  { key: "referral_source", pattern: /hear about|referral|refer(red)? (you|by)|how did you find/i },
  { key: "highest_degree", pattern: /degree/i },
  // Only the generic total: "years of React experience" is a different fact,
  // and answering it with the overall figure would put a false number on the form.
  {
    key: "years_experience",
    // "years of experience with React" names a skill after the noun; leave it out too.
    pattern:
      /\byears?\s+(?:of\s+)?(?:(?:total|overall|professional|relevant|work|industry|paid|full[- ]time)\s+)*(?:work\s+)?experience\b(?!\s+(?:with|in|using|on|of|as)\b)/i,
  },
  { key: "start_date", pattern: /start date|when (can|could) you start|how soon|earliest start|available to start/i },
];

/** A question about how long the candidate has used one particular skill. */
const SKILL_YEARS_PATTERN = /\b(?:years?|how long|how many years)\b/i;

export const SKILL_YEARS_HUMAN =
  "How long you have used a specific skill is yours to state; the profile does not track it.";

/** The answer bank key a job board question maps to, or null for a draft. */
export function answerBankKeyFor(question: string): string | null {
  return ANSWER_KEY_MATCHERS.find((matcher) => matcher.pattern.test(question))?.key ?? null;
}

export function answerBankValue(bank: readonly AnswerBankEntry[], key: string): string {
  return bank.find((entry) => entry.key === key)?.answer.trim() ?? "";
}

export const BANK_ANSWER_MISSING = "Your answer bank has no answer for this yet.";

export type BankAnswer = {
  answer: string;
  confidence: AnswerConfidence;
  /** The answer bank entry used, when the question maps to one. */
  sourceKey?: string;
  /** Set when the answer is the user's to give, never a model's. */
  needsHuman?: string;
};

/**
 * What the answer bank says about one screening question, or null when the
 * question is not one of the answers we refuse to guess. A bank entry the user
 * has not filled in comes back as their job, not as a drafted guess, and so
 * does a question about years with a specific skill, which no bank entry holds.
 */
export function resolveBankAnswer(
  question: string,
  bank: readonly AnswerBankEntry[],
): BankAnswer | null {
  const sourceKey = answerBankKeyFor(question);
  if (sourceKey === null) {
    return SKILL_YEARS_PATTERN.test(question)
      ? { answer: NEEDS_ANSWER, confidence: "low", needsHuman: SKILL_YEARS_HUMAN }
      : null;
  }

  const answer = answerBankValue(bank, sourceKey);
  return answer.length > 0
    ? { answer, confidence: "high", sourceKey }
    : { answer: NEEDS_ANSWER, confidence: "low", sourceKey, needsHuman: BANK_ANSWER_MISSING };
}

/** Values a select or checkbox question will accept, if it lists any. */
export function optionValuesFor(question: JobQuestion): string[] {
  return question.fields
    .filter((field) => /select|checkbox|radio|dropdown|boolean/i.test(field.type))
    .flatMap((field) => field.options.map((option) => option.value))
    .filter((value) => value.trim().length > 0);
}

/** Keeps an answer to one of the offered options, or hands it to the user. */
export function coerceToOption(answer: string, options: readonly string[]): string {
  if (options.length === 0) return answer;
  const match = options.find((option) => option.toLowerCase() === answer.trim().toLowerCase());
  return match ?? NEEDS_ANSWER;
}

export function clampWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
  return words.length <= maxWords ? text.trim() : `${words.slice(0, maxWords).join(" ")}...`;
}

// --- rejected claims --------------------------------------------------------

/** The generated text a rejected claim has to leave. */
export type RejectableDraft = {
  optimizedResume: string;
  coverLetter: string;
  summary: string;
  changeLog: Array<{
    bulletId?: string;
    original: string;
    rewritten: string;
    reason: string;
    evidenceIds: string[];
  }>;
};

export function containsClaim(text: string, claim: string): boolean {
  const needle = claim.trim().toLowerCase();
  return needle.length > 0 && text.toLowerCase().includes(needle);
}

function withoutSentencesMentioning(text: string, claim: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !containsClaim(sentence, claim))
        .join(" ")
        .trim(),
    )
    .filter((paragraph) => paragraph.length > 0)
    .join("\n\n");
}

/** Plain replacement: a function replacer keeps "$" in resume text literal. */
function replaceOnce(text: string, needle: string, replacement: string): string {
  return needle.length === 0 ? text : text.replace(needle, () => replacement);
}

/**
 * Takes a claim the user rejected back out of everything that was generated:
 * a bullet that carried it returns to the user's own wording, and a summary or
 * cover letter sentence that carried it is dropped. Approval checks afterwards
 * that nothing slipped through.
 */
export function applyClaimRejection(draft: RejectableDraft, claim: string): RejectableDraft {
  let optimizedResume = draft.optimizedResume;

  const changeLog = draft.changeLog.map((entry) => {
    if (entry.rewritten === entry.original || !containsClaim(entry.rewritten, claim)) {
      return entry;
    }
    optimizedResume = replaceOnce(optimizedResume, `- ${entry.rewritten}`, `- ${entry.original}`);
    return {
      ...entry,
      rewritten: entry.original,
      evidenceIds: [],
      reason: `Reverted to your wording: you rejected "${claim}".`,
    };
  });

  let summary = draft.summary;
  if (containsClaim(summary, claim)) {
    const next = withoutSentencesMentioning(summary, claim);
    optimizedResume = replaceOnce(
      optimizedResume,
      `SUMMARY\n${summary}`,
      next.length > 0 ? `SUMMARY\n${next}` : "",
    )
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    summary = next;
  }

  const coverLetter = containsClaim(draft.coverLetter, claim)
    ? withoutSentencesMentioning(draft.coverLetter, claim)
    : draft.coverLetter;

  return { optimizedResume, coverLetter, summary, changeLog };
}

/** Rejected claims whose text is still somewhere in the generated output. */
export function rejectedClaimsStillPresent(
  draft: Pick<RejectableDraft, "optimizedResume" | "coverLetter" | "summary">,
  claims: ReadonlyArray<{ text: string; status: string }>,
): string[] {
  const texts = [draft.optimizedResume, draft.coverLetter, draft.summary];
  return claims
    .filter((claim) => claim.status === "rejected" && texts.some((text) => containsClaim(text, claim.text)))
    .map((claim) => claim.text);
}
