/**
 * The honesty pass. No model, no network: every check here is deterministic,
 * so a tailored application can only ever say what the profile already says.
 *
 * Two kinds of finding come out of it. A *structural* issue means the rewrite
 * broke the shape of the resume, and it fails the report. A *flagged claim*
 * means the tailored text introduced a term or a number the profile does not
 * support: the report still passes, but the draft cannot be approved until the
 * user confirms or rejects it.
 */

import type { FlaggedClaim, VerifierReport } from "../validators";
import {
  evidenceIdSet,
  filterEvidenceIds,
  type ProfileFact,
  type RewriteOutput,
  type TailoredBullet,
  type TailoredExperience,
} from "./tailor";

/** Vocabulary that reads as machine-written to a recruiter. */
export const BANNED_PHRASES = [
  "leverage",
  "spearhead",
  "synergy",
  "passionate",
  "results-driven",
  "dynamic",
  "proven track record",
  "go-getter",
  "think outside the box",
] as const;

/** Words that are capitalised for grammar, not because they name anything. */
const COMMON_WORDS = new Set([
  "a", "about", "after", "an", "and", "as", "at", "be", "because", "best", "but", "by",
  "current", "currently", "dear", "did", "do", "every", "experience", "for", "from",
  "greetings", "he", "hello", "her", "hi", "him", "hiring", "his", "how", "i", "if", "in",
  "is", "it", "its", "job", "manager", "me", "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday", "sunday", "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december", "my", "of", "on", "or",
  "our", "position", "present", "recruiter", "regards", "role", "she", "sincerely", "so",
  "team", "thank", "thanks", "that", "the", "their", "them", "they", "this", "to", "today",
  "was", "we", "were", "what", "when", "where", "which", "who", "why", "with", "work",
  "year", "years", "you", "your", "yours",
]);

const NUMBER_PATTERN = /[$€£]?\d[\d,]*(?:\.\d+)?%?/g;

export type SourceBullet = { id: string; text: string };
export type SourceExperience = { id: string; bullets: SourceBullet[] };

export type VerifyInput = {
  /** Every fact the profile can cite, used for evidence ids and wording. */
  facts: ProfileFact[];
  /** The profile's experiences, in the order the resume shows them. */
  experiences: SourceExperience[];
  rewrite: RewriteOutput;
  coverLetter: string;
  /**
   * Free text the profile already contains: the source resume, skills,
   * certifications and claims the user has confirmed before.
   */
  profileText: string;
  /**
   * Names that are not claims about the candidate, such as the company and the
   * role being applied to. Never the posting's keywords: whitelisting those
   * would let the pipeline stuff the resume with terms nobody has earned.
   */
  allowedContext?: readonly string[];
  /** Posting keywords, used only to catch stuffing. Never a whitelist. */
  jobKeywords?: readonly string[];
};

export type VerifyResult = {
  report: VerifierReport;
  flaggedClaims: FlaggedClaim[];
  experiences: TailoredExperience[];
  summary: string;
  skillsOrder: string[];
};

type Issue = { structural: boolean; message: string };

type ClaimDraft = { text: string; reason: string };

const SNIPPET_CHARS = 90;

function snippet(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length <= SNIPPET_CHARS ? clean : `${clean.slice(0, SNIPPET_CHARS)}...`;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function normalizeNumber(raw: string): string {
  const cleaned = raw.replace(/[$€£,%]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? String(value) : cleaned;
}

function numbersIn(text: string): string[] {
  return (text.match(NUMBER_PATTERN) ?? []).map((token) => token.trim());
}

// --- term shapes ------------------------------------------------------------

function cleanToken(token: string): string {
  return token.replace(/^[^A-Za-z0-9$€£]+/, "").replace(/[^A-Za-z0-9%+#/]+$/, "");
}

/** ALL-CAPS acronyms of two letters or more, such as AWS, SQL or GDPR. */
function isAcronym(token: string): boolean {
  return /^[A-Z][A-Z0-9]+s?$/.test(token) && /[A-Z]{2}/.test(token);
}

/** An uppercase letter inside the word: TypeScript, GraphQL, PostgreSQL. */
function isCamelCase(token: string): boolean {
  return /^[A-Za-z][a-z0-9]*[A-Z][A-Za-z0-9]*$/.test(token);
}

/** Dotted or slashed names: Node.js, CI/CD, Vue.js. Never "e.g.". */
function isDottedName(token: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+#]+[./][A-Za-z][A-Za-z0-9+#./]*$/.test(token);
}

function isCapitalizedWord(token: string): boolean {
  return /^[A-Z][a-z'’-]+$/.test(token);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?:;])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function pushPhrase(run: string[], terms: string[]): void {
  if (run.length < 2) return;
  if (run.every((word) => COMMON_WORDS.has(word.toLowerCase()))) return;
  terms.push(run.join(" "));
}

/**
 * Terms that look like a tool, a technology or a credential. Single ordinary
 * capitalised words are left alone: they are usually the start of a sentence
 * or a person's name, and flagging them would bury the real finds.
 */
export function extractTerms(text: string): string[] {
  const terms: string[] = [];

  for (const sentence of splitSentences(text)) {
    const tokens = sentence
      .split(/\s+/)
      .map(cleanToken)
      .filter((token) => token.length > 0);
    let run: string[] = [];

    tokens.forEach((token, index) => {
      if (isAcronym(token) || isCamelCase(token) || isDottedName(token)) {
        pushPhrase(run, terms);
        run = [];
        terms.push(token);
        return;
      }

      // The first word of a sentence is capitalised by grammar, not by name.
      if (index > 0 && isCapitalizedWord(token)) {
        run.push(token);
        return;
      }

      pushPhrase(run, terms);
      run = [];
    });

    pushPhrase(run, terms);
  }

  return terms;
}

// --- the pass ---------------------------------------------------------------

export function verifyTailoring(input: VerifyInput): VerifyResult {
  const issues: Issue[] = [];
  const claims: ClaimDraft[] = [];
  const validIds = evidenceIdSet(input.facts);

  const haystack = normalize(
    [
      input.profileText,
      ...input.facts.map((fact) => `${fact.text} ${fact.context ?? ""}`),
      ...(input.allowedContext ?? []),
    ].join("\n"),
  );
  const knownNumbers = new Set(numbersIn(haystack).map(normalizeNumber));

  const experiences = alignExperiences(input, validIds, issues);
  const summary = input.rewrite.summary.trim();

  const changed: Array<{ text: string; where: string }> = [
    ...(summary.length > 0 ? [{ text: summary, where: "your summary" }] : []),
    ...experiences.flatMap((experience) =>
      experience.bullets
        .filter((bullet) => bullet.text !== bullet.original)
        .map((bullet) => ({ text: bullet.text, where: "a tailored bullet" })),
    ),
    ...(input.coverLetter.trim().length > 0
      ? [{ text: input.coverLetter, where: "your cover letter" }]
      : []),
  ];

  for (const part of changed) {
    collectTermClaims(part, haystack, claims);
    collectNumberClaims(part, knownNumbers, claims);
    collectBannedPhrases(part, issues);
  }

  collectStuffedKeywords(input.jobKeywords ?? [], changed, haystack, claims);

  return {
    report: {
      passed: !issues.some((issue) => issue.structural),
      issues: issues.map((issue) => issue.message),
    },
    flaggedClaims: toFlaggedClaims(claims),
    experiences,
    summary,
    skillsOrder: input.rewrite.skillsOrder.map((name) => name.trim()).filter(Boolean),
  };
}

/**
 * Rebuilds the resume body from the profile, one experience and one bullet at
 * a time. Anything the rewrite invented is dropped; anything it left out or
 * could not support keeps the wording the user already had.
 */
function alignExperiences(
  input: VerifyInput,
  validIds: Set<string>,
  issues: Issue[],
): TailoredExperience[] {
  const sourceIds = new Set(input.experiences.map((experience) => experience.id));
  const rewritten = new Map(
    input.rewrite.experiences.map((experience) => [experience.id, experience]),
  );

  if (input.rewrite.experiences.length !== input.experiences.length) {
    issues.push({
      structural: true,
      message: `The rewrite returned ${input.rewrite.experiences.length} role${
        input.rewrite.experiences.length === 1 ? "" : "s"
      } but your profile has ${input.experiences.length}. Your own wording was kept where it went missing.`,
    });
  }

  for (const experience of input.rewrite.experiences) {
    if (!sourceIds.has(experience.id)) {
      issues.push({
        structural: true,
        message: "The rewrite added a role that is not in your profile. It was dropped.",
      });
    }
  }

  return input.experiences.map((experience) => {
    const proposed = new Map(
      (rewritten.get(experience.id)?.bullets ?? []).map((bullet) => [bullet.id, bullet]),
    );
    const sourceBulletIds = new Set(experience.bullets.map((bullet) => bullet.id));

    for (const id of proposed.keys()) {
      if (!sourceBulletIds.has(id)) {
        issues.push({
          structural: true,
          message: "The rewrite returned a bullet that is not in your profile. It was dropped.",
        });
      }
    }

    return {
      id: experience.id,
      bullets: experience.bullets.map((bullet) =>
        alignBullet(bullet, proposed.get(bullet.id), validIds, issues),
      ),
    };
  });
}

function alignBullet(
  source: SourceBullet,
  proposed: { text: string; evidenceIds: string[] } | undefined,
  validIds: Set<string>,
  issues: Issue[],
): TailoredBullet {
  const original = source.text;
  if (!proposed) {
    issues.push({
      structural: false,
      message: `One bullet was left out of the rewrite, so it kept your wording: "${snippet(original)}"`,
    });
    return { id: source.id, text: original, original, evidenceIds: [] };
  }

  const evidenceIds = filterEvidenceIds(proposed.evidenceIds ?? [], validIds);
  const text = proposed.text.trim();

  if (evidenceIds.length === 0) {
    issues.push({
      structural: false,
      message: `A rewritten bullet cited no fact from your profile, so it kept your wording: "${snippet(original)}"`,
    });
    return { id: source.id, text: original, original, evidenceIds: [] };
  }

  return { id: source.id, text: text.length > 0 ? text : original, original, evidenceIds };
}

function collectTermClaims(
  part: { text: string; where: string },
  haystack: string,
  claims: ClaimDraft[],
): void {
  for (const term of extractTerms(part.text)) {
    if (isKnownTerm(term, haystack)) continue;
    claims.push({
      text: term,
      reason: `Not in your profile. It was added to ${part.where}: "${snippet(part.text)}"`,
    });
  }
}

/** Matches a plural acronym against its singular: APIs against API. */
function isKnownTerm(term: string, haystack: string): boolean {
  const needle = normalize(term);
  return (
    haystack.includes(needle) ||
    (needle.endsWith("s") && haystack.includes(needle.slice(0, -1)))
  );
}

function collectNumberClaims(
  part: { text: string; where: string },
  knownNumbers: Set<string>,
  claims: ClaimDraft[],
): void {
  for (const number of numbersIn(part.text)) {
    if (knownNumbers.has(normalizeNumber(number))) continue;
    claims.push({
      text: number,
      reason: `This number is not in your profile. It was added to ${part.where}: "${snippet(part.text)}"`,
    });
  }
}

function collectBannedPhrases(part: { text: string; where: string }, issues: Issue[]): void {
  const text = normalize(part.text);
  for (const phrase of BANNED_PHRASES) {
    if (!text.includes(phrase)) continue;
    issues.push({
      structural: false,
      message: `"${phrase}" reads as machine-written and is still in ${part.where}.`,
    });
  }
}

/**
 * A posting keyword that appears in the tailored text but nowhere in the
 * profile is keyword stuffing, which is exactly why the keywords are not a
 * whitelist for the checks above.
 */
function collectStuffedKeywords(
  keywords: readonly string[],
  parts: ReadonlyArray<{ text: string; where: string }>,
  haystack: string,
  claims: ClaimDraft[],
): void {
  for (const keyword of keywords) {
    const needle = normalize(keyword.trim());
    if (needle.length < 2 || haystack.includes(needle)) continue;

    const part = parts.find((entry) => normalize(entry.text).includes(needle));
    if (!part) continue;

    claims.push({
      text: keyword.trim(),
      reason: `The posting asks for this and it now appears in ${part.where}, but your profile does not show it.`,
    });
  }
}

function toFlaggedClaims(claims: ClaimDraft[]): FlaggedClaim[] {
  const seen = new Set<string>();
  const result: FlaggedClaim[] = [];

  for (const claim of claims) {
    const key = claim.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      id: `fc_${result.length + 1}`,
      text: claim.text,
      reason: claim.reason,
      status: "pending",
    });
  }

  return result;
}
