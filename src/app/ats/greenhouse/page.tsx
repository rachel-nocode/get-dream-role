import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Optimize Your Resume for Greenhouse ATS",
  description:
    "Greenhouse is used by Airbnb, Dropbox, HubSpot, and thousands of tech companies. GetDreamRole analyzes your resume against the job description and rewrites it to pass Greenhouse's scoring system.",
};

const facts = [
  {
    label: "Parse quality",
    value: "Good",
    note: "Handles standard single-column PDFs reliably. Two-column layouts are the main failure point.",
  },
  {
    label: "Keyword matching",
    value: "Scorecard-based",
    note: "Recruiters configure custom scorecards with weighted skills. Missing a required skill is a hard filter.",
  },
  {
    label: "Who reviews",
    value: "Recruiter + hiring manager",
    note: "At most tech companies, an engineer or PM co-reviews candidates — not just HR.",
  },
  {
    label: "Prevalent in",
    value: "Tech & startups",
    note: "If the company is VC-backed, Greenhouse is the most likely ATS. Job URL ends in greenhouse.io.",
  },
];

const mistakes = [
  "Two-column or sidebar layouts — Greenhouse extracts skills placed in sidebars into the wrong field or drops them entirely.",
  "Contact info in the document header — Greenhouse's parser often misses it. Put name, email, and phone in plain text at the top of the document body.",
  "Skills buried in bullet points only — include a dedicated Skills section so Greenhouse can extract them into the skills field, which recruiters search separately.",
  "Date formats like 'Jan '24' — use consistent formats (January 2024 or 01/2024) so the parser correctly maps your work timeline.",
  "Using 'Present' as a current job end date — write the actual current month and year.",
];

export default function GreenhouseLandingPage() {
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
            Greenhouse ATS
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-forge-text leading-tight">
            Get past
            <br />
            Greenhouse.
          </h1>
          <p className="mt-5 text-forge-muted text-lg max-w-lg leading-relaxed">
            Greenhouse powers hiring at Airbnb, Dropbox, HubSpot, Notion, and
            thousands of tech companies. GetDreamRole optimizes your resume
            specifically for how Greenhouse parses, scores, and ranks candidates.
          </p>
          <div className="mt-7">
            <Link
              href="/optimize?ats=greenhouse"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Optimize for Greenhouse →
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
            What gets resumes filtered out in Greenhouse
          </h2>
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
            What GetDreamRole does for Greenhouse applications
          </h2>
          <ul className="mt-5 space-y-3">
            {[
              "Scores your resume against the job description using Greenhouse's keyword-matching logic",
              "Identifies missing required and preferred skills from the job posting",
              "Rewrites your experience bullets to naturally incorporate high-value keywords",
              "Flags formatting issues that cause Greenhouse's parser to misplace or drop content",
              "Generates a restructured resume optimized for Greenhouse's structured candidate profile view",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-forge-muted text-sm leading-relaxed">
                <span className="text-forge-success mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              href="/optimize?ats=greenhouse"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Optimize my resume for Greenhouse →
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-10 flex items-center gap-6 text-sm text-forge-muted">
          <span>Related:</span>
          <Link href="/blog/optimize-resume-greenhouse-ats" className="hover:text-forge-text transition-colors underline underline-offset-2">
            Full Greenhouse optimization guide
          </Link>
          <Link href="/ats" className="hover:text-forge-text transition-colors underline underline-offset-2">
            Other ATS platforms
          </Link>
        </div>
      </main>
    </>
  );
}
