/**
 * Every prompt and response schema the tailoring pipeline uses.
 *
 * Kept free of Convex imports so the wording can be read, diffed and tested on
 * its own. Each step is one small call with its own schema: the model is asked
 * for the least it can be asked for, and code decides everything else.
 */

import type { EvidenceMapEntry, ExperienceEntry, SkillEntry } from "../validators";
import { formatFactLines, type ProfileFact } from "./tailor";
import { BANNED_PHRASES } from "./verify";

export type JsonSchema = Record<string, unknown>;

/** The bullet id the reviewer uses when it rewrites the cover letter opener. */
export const COVER_OPENING_ID = "cover_opening";

/** One list of machine-sounding words, shared by the prompts and the checker. */
const PLAIN_LANGUAGE_RULE = `Plain language. Never write ${BANNED_PHRASES.map(
  (phrase) => `"${phrase}"`,
).join(", ")}.`;

function stringArray(description: string): JsonSchema {
  return { type: "array", description, items: { type: "string" } };
}

function labelled(job: { title: string; company: string; location?: string }): string {
  return `Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location ?? "not stated"}`;
}

// --- 1. extract requirements ------------------------------------------------

export const EXTRACT_MAX_TOKENS = 800;

export const EXTRACT_SYSTEM = `You read one job posting and list what it actually asks for. You are the first step of an honest tailoring pipeline, so you copy the posting's own words and never invent a requirement.

Rules:
- required: only what the posting states as needed. preferred: the nice to haves.
- keywords: the exact tools, methods and domain terms the posting uses. No synonyms of your own.
- seniority: the level the posting names, or "not stated".
- hardGates: requirements a candidate either meets or does not, such as work authorization, a security clearance, a named degree, a licence, on-site presence or a number of years.
- One short line per entry, under 120 characters, no duplicates.
- Ignore anything about benefits, pay, culture or equal opportunity.`;

export const EXTRACT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    required: stringArray("Requirements the posting states as needed"),
    preferred: stringArray("Nice to haves"),
    keywords: stringArray("Exact tools, methods and domain terms the posting uses"),
    seniority: { type: "string", description: 'The level named, or "not stated"' },
    hardGates: stringArray("Requirements a candidate either meets or does not"),
  },
};

export function extractRequirementsPrompt(job: {
  title: string;
  company: string;
  location?: string;
  description: string;
}): string {
  return `JOB\n${labelled(job)}\n\nDescription (boilerplate already removed):\n${job.description}`;
}

// --- 2. map evidence --------------------------------------------------------

export const MAP_MAX_TOKENS = 1_200;

export const MAP_SYSTEM = `You match what a posting asks for to facts from one candidate's profile. You never see their resume, only numbered facts, and you may only cite the ids you are given.

Rules:
- One entry per requirement, in the order they are listed, with the requirement copied exactly.
- evidenceIds: the ids of the facts that genuinely support it, strongest first. Cite nothing else.
- strength: "direct" when a fact shows the same work with the same tool or skill, "analogous" when it shows the same work with a different tool, "transferable" when the underlying skill carries over, "none" when no fact supports it.
- When strength is "none", evidenceIds must be empty. A gap the candidate can see is worth more than a stretch.`;

export const MAP_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          requirement: { type: "string" },
          evidenceIds: stringArray("Fact ids from the list, or empty"),
          strength: {
            type: "string",
            enum: ["direct", "analogous", "transferable", "none"],
          },
        },
      },
    },
  },
};

export function mapEvidencePrompt(args: {
  requirements: readonly string[];
  facts: ProfileFact[];
}): string {
  return [
    "REQUIREMENTS",
    args.requirements.map((requirement) => `- ${requirement}`).join("\n"),
    "",
    "FACTS (the only ids you may cite)",
    formatFactLines(args.facts),
  ].join("\n");
}

// --- 3. rewrite the resume --------------------------------------------------

export const REWRITE_MAX_TOKENS = 2_500;

export const REWRITE_SYSTEM = `You rewrite one candidate's existing resume bullets for one posting. You never write a new fact: every bullet you return says what the source bullet with the same id already said.

Rules:
- Return only the summary, the experience ids you were given with their bullets, and the order the skills should appear in. Never write an employer, a job title or a date: those are added after you, from the profile.
- Mirror the posting's exact terminology only where a cited fact already supports it. If no fact supports a term, leave it out. The gap stays visible.
- Every bullet cites at least one evidence id. A bullet you cannot support keeps its original wording.
- When the source bullet has a number, use the XYZ form: accomplished X as measured by Y by doing Z. When it has none, keep the bullet plain and do not add one.
- Keep every number, percentage and currency amount exactly as the source has it.
- Never add a tool, skill, certification, employer or credential the source does not name.
- No hidden text, no white text, no keyword lists pasted into a bullet.
- ${PLAIN_LANGUAGE_RULE}
- Every bullet is one sentence of 30 words or fewer.
- Keep every experience id and every bullet id you were given, in the same order.`;

export const REWRITE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string", description: "Two or three sentences, no new facts" },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "An experience id you were given" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "The source bullet id" },
                text: { type: "string" },
                evidenceIds: stringArray("Fact ids this bullet rests on"),
              },
            },
          },
        },
      },
    },
    skillsOrder: stringArray("Skill names from the profile, most relevant first"),
  },
};

function experienceBlock(experience: ExperienceEntry): string {
  const bullets = experience.bullets
    .map((bullet) => `  [${bullet.id}] ${bullet.text}`)
    .join("\n");
  return `[${experience.id}] ${experience.title}\n${bullets}`;
}

function evidenceLine(entry: EvidenceMapEntry): string {
  const ids = entry.evidenceIds.length > 0 ? entry.evidenceIds.join(", ") : "nothing supports this";
  return `- ${entry.requirement} -> ${ids} (${entry.strength})`;
}

export function rewriteResumePrompt(args: {
  job: { title: string; company: string; location?: string };
  required: readonly string[];
  preferred: readonly string[];
  keywords: readonly string[];
  seniority?: string;
  hardGates?: readonly string[];
  evidenceMap: EvidenceMapEntry[];
  experiences: ExperienceEntry[];
  skills: SkillEntry[];
  currentSummary?: string;
  writingStyle?: string;
}): string {
  return [
    "JOB",
    labelled(args.job),
    `Required: ${args.required.join("; ") || "not stated"}`,
    `Preferred: ${args.preferred.join("; ") || "not stated"}`,
    `Terms the posting uses: ${args.keywords.join(", ") || "not stated"}`,
    `Level: ${args.seniority?.trim() || "not stated"}`,
    `Never claim these, they are settled with the candidate separately: ${
      args.hardGates?.join("; ") || "none"
    }`,
    "",
    "EVIDENCE MAP (requirement -> facts that support it)",
    args.evidenceMap.map(evidenceLine).join("\n"),
    "",
    "EXPERIENCES TO REWRITE (keep every id)",
    args.experiences.map(experienceBlock).join("\n\n"),
    "",
    `SKILLS: ${args.skills.map((skill) => skill.name).join(", ") || "none"}`,
    "",
    `CURRENT SUMMARY: ${args.currentSummary?.trim() || "none"}`,
    args.writingStyle?.trim()
      ? `\nHOW THE CANDIDATE WRITES: ${args.writingStyle.trim()}`
      : "",
  ].join("\n");
}

// --- 4. cover letter --------------------------------------------------------

export const COVER_MAX_TOKENS = 600;

export const COVER_SYSTEM = `You write one short cover letter from facts that are already proven. 250 words maximum.

Rules:
- Present, then past, then future: what the candidate does now, the two or three facts that match this posting, then what they want to do at this company.
- Open with a specific sentence about the work. Never open with "I am writing to apply", "I am excited to apply", "As a seasoned" or any variation of them.
- Name two or three concrete facts by their content. Never mention a fact id.
- Never claim a skill, tool, number or credential that is not in the facts you were given.
- Write in the candidate's own style when one is described.
- ${PLAIN_LANGUAGE_RULE}
- No flattery about the company's mission, no promises about culture fit.`;

export const COVER_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    coverLetter: { type: "string", description: "250 words maximum, no salutation block" },
  },
};

export function coverLetterPrompt(args: {
  job: { title: string; company: string; location?: string };
  required: readonly string[];
  evidenceMap: EvidenceMapEntry[];
  facts: ProfileFact[];
  writingStyle?: string;
}): string {
  const supporting = new Set(args.evidenceMap.flatMap((entry) => entry.evidenceIds));
  const cited = args.facts.filter((fact) => supporting.has(fact.id));

  return [
    "JOB",
    labelled(args.job),
    `What it needs: ${args.required.join("; ") || "not stated"}`,
    "",
    "FACTS THAT ALREADY MATCH THIS POSTING",
    formatFactLines(cited.length > 0 ? cited : args.facts),
    args.writingStyle?.trim()
      ? `\nHOW THE CANDIDATE WRITES: ${args.writingStyle.trim()}`
      : "",
  ].join("\n");
}

// --- 5. screening answers ---------------------------------------------------

export const ANSWERS_MAX_TOKENS = 1_200;

export const ANSWERS_SYSTEM = `You draft answers to a job board's screening questions using only this candidate's profile facts.

Rules:
- One entry per question, in the order they are given, with the question copied exactly.
- 120 words maximum per answer, first person, plain sentences.
- Use only the facts you were given. Never guess a visa status, a salary, a clearance, a degree, a start date or a number of years.
- If the facts do not answer the question, answer exactly "Needs your answer".
- When a question lists options, answer with exactly one of those option values, or "Needs your answer".`;

export const ANSWERS_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
  },
};

export function screeningAnswersPrompt(args: {
  job: { title: string; company: string; location?: string };
  questions: ReadonlyArray<{ question: string; options: readonly string[] }>;
  facts: ProfileFact[];
}): string {
  return [
    "JOB",
    labelled(args.job),
    "",
    "QUESTIONS",
    args.questions
      .map((entry) =>
        entry.options.length > 0
          ? `- ${entry.question}\n  Options: ${entry.options.join(" | ")}`
          : `- ${entry.question}`,
      )
      .join("\n"),
    "",
    "FACTS",
    formatFactLines(args.facts),
  ].join("\n");
}

// --- 7. reviewer ------------------------------------------------------------

export const REVIEW_MAX_TOKENS = 800;

export const REVIEW_SYSTEM = `You are a fresh reader checking one tailored application for language that sounds machine-written. You do not add facts and you do not change what is claimed.

Rules:
- Return a rewrite only for a bullet that uses machine-sounding vocabulary, a generic opener or filler. Leave every good bullet out entirely.
- Keep every number, tool, employer and credential exactly as it is. Never add one.
- Reuse the bullet's id and keep the rewrite under 30 words.
- ${PLAIN_LANGUAGE_RULE}
- Use the id "${COVER_OPENING_ID}" to return a replacement first sentence for the cover letter, and only when its opening sentence is generic.`;

export const REVIEW_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    rewrites: {
      type: "array",
      items: {
        type: "object",
        properties: {
          bulletId: { type: "string" },
          text: { type: "string" },
        },
      },
    },
  },
};

export function reviewPrompt(args: {
  bullets: ReadonlyArray<{ id: string; text: string }>;
  coverLetter: string;
}): string {
  return [
    "BULLETS",
    args.bullets.map((bullet) => `[${bullet.id}] ${bullet.text}`).join("\n"),
    "",
    "COVER LETTER",
    args.coverLetter,
  ].join("\n");
}

// --- 8. follow-up email -----------------------------------------------------

export const FOLLOWUP_MAX_TOKENS = 300;
export const FOLLOWUP_MAX_WORDS = 100;

export const FOLLOWUP_SYSTEM = `You draft one short follow-up email for a candidate who applied for a job and has not heard back. They send it themselves, from their own inbox, so it has to sound like a person who has better things to do than chase.

Rules:
- ${FOLLOWUP_MAX_WORDS} words maximum in the body. First person, short sentences, no bullet list.
- Name the role and the company in the first sentence.
- Add exactly one new value point taken from the facts you are given: something specific the candidate can do for this team. Never invent one, and never repeat a fact back as a list.
- Never write "just checking in", "just following up", "circling back", "touching base" or "wanted to reach out".
- Never claim a skill, tool, number or credential that is not in the facts.
- Never ask for a decision date, never mention other offers, never apologise for writing.
- End with one plain sentence offering to answer questions. No sign-off block: the candidate adds their own.
- subject: under 60 characters, names the role, no "Re:" prefix.
- ${PLAIN_LANGUAGE_RULE}`;

export const FOLLOWUP_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    subject: { type: "string", description: "Under 60 characters, names the role" },
    body: {
      type: "string",
      description: `${FOLLOWUP_MAX_WORDS} words maximum, no sign-off block`,
    },
  },
};

/**
 * The facts worth leading with: a bullet that carries a number says more than
 * one that does not, and a longer bullet usually carries more detail.
 */
export function strongestFacts(facts: ProfileFact[], limit: number): ProfileFact[] {
  const score = (fact: ProfileFact) =>
    (/\d/.test(fact.text) ? 1_000 : 0) + Math.min(fact.text.length, 200);

  return [...facts]
    .filter((fact) => fact.kind === "bullet")
    .sort((a, b) => score(b) - score(a))
    .slice(0, Math.max(0, limit));
}

export function followupPrompt(args: {
  job: { title: string; company: string };
  facts: ProfileFact[];
  /** Null when the row never recorded a submit date, so nothing is guessed. */
  daysSinceSubmitted: number | null;
  attempt: number;
}): string {
  return [
    "APPLICATION",
    `Role: ${args.job.title}`,
    `Company: ${args.job.company}`,
    `Applied: ${
      args.daysSinceSubmitted === null
        ? "date not recorded, so do not name a date"
        : `${args.daysSinceSubmitted} days ago`
    }`,
    `This is follow-up number ${args.attempt}.`,
    "",
    "FACTS (pick exactly one to build the value point on)",
    formatFactLines(args.facts),
  ].join("\n");
}
