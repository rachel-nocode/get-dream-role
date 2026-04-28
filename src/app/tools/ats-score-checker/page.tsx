import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildBreadcrumbSchema,
  buildHowToSchema,
  buildMetadata,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ATS Score Checker: Rate Your Resume Against Any Job",
  description:
    "Check your ATS resume score against a job description and see what to fix first: keywords, formatting, sections, and bullet strength.",
  path: "/tools/ats-score-checker",
  keywords: [
    "ATS score checker",
    "ATS resume score",
    "resume compatibility score",
    "ATS match rate calculator",
    "ATS score meaning",
  ],
});

const scoreBands = [
  ["90-100", "Ready to apply", "Strong keyword coverage, clean structure, and specific bullets."],
  ["75-89", "Close", "Usually needs a few missing terms, clearer evidence, or safer formatting."],
  ["50-74", "Risky", "Likely missing required skills, using weak bullets, or relying on fragile formatting."],
  ["0-49", "Do not send yet", "Fix parsing, sections, and role match before submitting."],
];

const schemas = [
  buildWebPageSchema({
    title: "ATS Score Checker",
    description:
      "A tool page explaining ATS resume scores and linking to the GetDreamRole checker.",
    path: "/tools/ats-score-checker",
    keywords: ["ATS score checker", "ATS resume score"],
  }),
  buildSoftwareApplicationSchema({
    title: "GetDreamRole ATS Score Checker",
    description:
      "A resume scoring tool that compares a resume to a target job description and ATS platform.",
    path: "/tools/ats-score-checker",
    keywords: ["ATS score checker", "resume compatibility score"],
    applicationSubCategory: "Resume scoring",
  }),
  buildHowToSchema({
    name: "How to check an ATS resume score",
    description:
      "Score a resume by comparing it to the exact job description and reviewing parser, keyword, and bullet issues.",
    steps: [
      { name: "Add resume", text: "Upload a PDF or paste plain resume text." },
      { name: "Add job description", text: "Paste the target role so the score is job-specific." },
      { name: "Select ATS", text: "Choose the applicant tracking system if you know it." },
      { name: "Fix low-score areas", text: "Address missing keywords, risky formatting, and vague bullets first." },
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools/ats-score-checker" },
    { name: "ATS Score Checker", path: "/tools/ats-score-checker" },
  ]),
];

export default function AtsScoreCheckerPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-forge-accent">
            ATS Score Checker
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-forge-text md:text-6xl">
            Know your ATS score before you apply.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-forge-muted">
            An ATS score is not a magic truth number. It is a practical warning
            signal: can the system parse your resume, match it to the role, and
            surface the right evidence to a recruiter?
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/optimize" className="rounded-lg bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover">
              Check my ATS score
            </Link>
            <Link href="/free-ats-resume-checker" className="rounded-lg border border-forge-border px-6 py-3 text-sm font-semibold text-forge-text hover:border-forge-border-bright">
              Free checker
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {scoreBands.map(([range, label, body]) => (
            <div key={range} className="rounded-xl border border-forge-border bg-forge-surface p-6">
              <p className="font-display text-3xl font-bold text-forge-accent">
                {range}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-forge-text">
                {label}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                {body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl font-bold text-forge-text">
              What the score weighs
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-forge-muted">
              GetDreamRole weighs job-specific keywords, section detection,
              parser safety, contact block readability, and whether your
              bullets prove the required skills. Generic resume scores miss the
              biggest issue: the same resume can score differently against two
              different job descriptions.
            </p>
          </div>
          <div className="rounded-xl border border-forge-border bg-forge-surface p-6">
            <h3 className="font-display text-xl font-semibold text-forge-text">
              Example improvement path
            </h3>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-forge-muted">
              <li>1. Resume starts at 52 because required tools are missing.</li>
              <li>2. Skills section adds exact terms from the posting.</li>
              <li>3. Experience bullets prove those terms with outcomes.</li>
              <li>4. Score rises into the 80s after parser and keyword fixes.</li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
