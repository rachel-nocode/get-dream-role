import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Optimize Your Resume for Workday ATS",
  description:
    "Workday is used by Fortune 500 companies and is one of the strictest resume parsers. GetDreamRole formats and rewrites your resume to pass Workday's rigid parsing and keyword requirements.",
};

const facts = [
  {
    label: "Parse quality",
    value: "Strict",
    note: "One of the most unforgiving parsers. Tables, multi-column layouts, and graphics reliably cause data loss.",
  },
  {
    label: "Keyword matching",
    value: "Exact + density",
    note: "Workday implementations heavily use exact-string keyword matching. Paraphrasing required skills often fails the filter.",
  },
  {
    label: "Who reviews",
    value: "HR + business unit",
    note: "Large enterprise hiring teams. Knockout questions and minimum qualifications are enforced strictly before human review.",
  },
  {
    label: "Prevalent in",
    value: "Enterprise & Fortune 500",
    note: "Banks, healthcare, manufacturing, large tech (Amazon, Microsoft). Job URL contains myworkdayjobs.com.",
  },
];

const mistakes = [
  "Any multi-column layout — Workday scrambles columns into a single stream, mixing job titles with descriptions from different roles.",
  "Tables for skills or education — table content is either ignored or merged into surrounding text in unpredictable ways.",
  "Text boxes or floating elements — these are often completely invisible to Workday's parser.",
  "Abbreviations for required skills — if the job description says 'Structured Query Language', write both 'SQL' and 'Structured Query Language'.",
  "Skipping the online application form — Workday often asks you to re-enter your resume data manually even after uploading. Leaving fields blank loses you score on those criteria.",
  "PDF features like fill-in forms, digital signatures, or password protection — these prevent parsing entirely.",
];

export default function WorkdayLandingPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/ats"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All platforms
        </Link>

        <div className="mt-10">
          <p className="text-forge-accent text-xs tracking-[0.18em] uppercase font-display">
            Workday ATS
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-forge-text leading-tight">
            Crack
            <br />
            Workday.
          </h1>
          <p className="mt-5 text-forge-muted text-lg max-w-lg leading-relaxed">
            Workday is used by Bank of America, Amazon, Microsoft, and thousands
            of large enterprises — and it has one of the strictest resume parsers
            in the industry. GetDreamRole prepares your resume for Workday&apos;s
            exact keyword requirements and parsing rules.
          </p>
          <div className="mt-7">
            <Link
              href="/optimize?ats=workday"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Optimize for Workday →
            </Link>
          </div>
        </div>

        {/* Platform facts */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="border border-forge-border rounded-xl p-5 bg-forge-surface"
            >
              <p className="text-xs text-forge-muted uppercase tracking-wider font-display">
                {f.label}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-forge-text">
                {f.value}
              </p>
              <p className="mt-2 text-sm text-forge-muted leading-relaxed">
                {f.note}
              </p>
            </div>
          ))}
        </div>

        {/* Common mistakes */}
        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-forge-text">
            Why resumes fail in Workday
          </h2>
          <p className="mt-3 text-forge-muted text-sm">
            Workday is responsible for more qualified candidates getting filtered
            out than any other ATS — not because they lack the skills, but
            because their resume wasn&apos;t formatted for Workday&apos;s strict
            parsing rules.
          </p>
          <ul className="mt-6 space-y-4">
            {mistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-forge-muted text-sm leading-relaxed">
                <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* How GetDreamRole helps */}
        <div className="mt-14 border border-forge-border rounded-xl p-8 bg-forge-surface">
          <h2 className="font-display text-xl font-semibold text-forge-text">
            What GetDreamRole does for Workday applications
          </h2>
          <ul className="mt-5 space-y-3">
            {[
              "Rewrites your resume into a strictly single-column, table-free format that Workday parses without data loss",
              "Matches your content against Workday's exact-string keyword requirements from the job description",
              "Expands abbreviations so both the short form and full name appear (e.g. SQL and Structured Query Language)",
              "Scores each required and preferred qualification from the job posting against your resume",
              "Generates bullet rewrites that hit mandatory keywords in natural, recruiter-readable language",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-forge-muted text-sm leading-relaxed">
                <span className="text-forge-success mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              href="/optimize?ats=workday"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Optimize my resume for Workday →
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-10 flex items-center gap-6 text-sm text-forge-muted">
          <span>Related:</span>
          <Link href="/ats" className="hover:text-forge-text transition-colors underline underline-offset-2">
            Other ATS platforms
          </Link>
          <Link href="/blog/ats-resume-optimizer-guide" className="hover:text-forge-text transition-colors underline underline-offset-2">
            ATS optimizer guide
          </Link>
        </div>
      </main>
    </>
  );
}
