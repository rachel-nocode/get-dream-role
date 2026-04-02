import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "What Is an ATS Resume Optimizer? Complete Guide for 2026",
  description:
    "ATS software rejects 75% of resumes before a human reads them. This guide explains how optimizers work, what to look for, and how to use one effectively.",
};

export default function AtsOptimizerGuidePost() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All guides
        </Link>

        <div className="mt-10">
          <p className="text-forge-accent text-xs tracking-[0.18em] uppercase font-display">
            Getting Started
          </p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-forge-text leading-tight">
            What Is an ATS Resume Optimizer? Complete Guide for 2026
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs text-forge-muted">
            <span>April 2, 2026</span>
            <span>6 min read</span>
          </div>
        </div>

        <div className="mt-12 space-y-8 text-forge-muted leading-relaxed">
          <p>
            Most job applications are rejected before a recruiter ever reads
            them. The culprit is an Applicant Tracking System (ATS) — software
            that parses, scores, and filters resumes at scale, often before any
            human involvement. Estimates put the rejection rate at 70–75% at
            this stage.
          </p>
          <p>
            An ATS resume optimizer is a tool that analyzes your resume against
            a specific job description and suggests changes to improve your
            match score. This guide covers how they work, what separates a good
            one from a mediocre one, and how to use one without making your
            resume sound like a keyword list.
          </p>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              How ATS software processes your resume
            </h2>
            <p>
              When you submit a resume, the ATS does several things in sequence:
            </p>
            <ol className="mt-4 space-y-3 list-decimal list-inside">
              <li>
                <strong className="text-forge-text">Parsing:</strong> The system
                extracts structured data from your document — name, contact
                info, job titles, companies, dates, skills, and the full text of
                each role. PDF parsing quality varies significantly between
                platforms.
              </li>
              <li className="mt-3">
                <strong className="text-forge-text">Scoring:</strong> The parsed
                content is compared against criteria set by the recruiting team —
                typically required skills, preferred skills, years of experience,
                education level, and specific keywords from the job description.
              </li>
              <li className="mt-3">
                <strong className="text-forge-text">Ranking:</strong> Candidates
                are ranked or categorized (qualified / unqualified / maybe) and
                appear in the recruiter&apos;s queue in that order. Being in the
                bottom 50% of ranked candidates rarely leads to a review.
              </li>
            </ol>
            <p className="mt-4">
              The critical insight is that your resume needs to pass the parser
              first and then score well against the job criteria. These are two
              separate problems, and most candidates only think about the second
              one.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              What an ATS resume optimizer actually does
            </h2>
            <p>
              A good optimizer addresses both parsing and scoring:
            </p>
            <ul className="mt-4 space-y-3 list-none">
              {[
                {
                  title: "Keyword gap analysis",
                  body: "Compares the skills, technologies, and phrases in your resume against the job description and identifies what's missing or underrepresented.",
                },
                {
                  title: "Format checking",
                  body: "Flags layout issues that cause parsing failures — multi-column designs, tables, headers/footers, unusual fonts, and graphics.",
                },
                {
                  title: "Section structure validation",
                  body: "Checks that your sections use standard labels and are in an order that ATS software expects.",
                },
                {
                  title: "Bullet rewriting",
                  body: "Rewrites your experience bullets to naturally incorporate missing keywords without making them sound like a keyword list. This is where AI-powered tools offer the most value.",
                },
                {
                  title: "Platform-specific guidance",
                  body: "Different ATS platforms (Greenhouse, Lever, Workday, iCIMS) have different parsing behavior and scoring logic. Platform-aware optimization produces better results.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>
                    <strong className="text-forge-text">{item.title}:</strong>{" "}
                    {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              What separates a good optimizer from a bad one
            </h2>
            <p>
              There are roughly three tiers of ATS optimization tools on the
              market:
            </p>
            <div className="mt-4 space-y-5">
              <div className="border-l-2 border-forge-border pl-4">
                <p className="text-forge-text font-medium">
                  Basic keyword matchers
                </p>
                <p className="mt-1 text-sm">
                  These count how many keywords from the job description appear
                  in your resume and give you a percentage. They&apos;re better
                  than nothing but miss the whole parsing side of the problem and
                  don&apos;t help you rewrite anything.
                </p>
              </div>
              <div className="border-l-2 border-forge-border pl-4">
                <p className="text-forge-text font-medium">
                  General AI rewriters
                </p>
                <p className="mt-1 text-sm">
                  Tools that rewrite bullets to include keywords but have no
                  platform-specific knowledge. A resume optimized generically
                  will score differently on Greenhouse vs Workday — these tools
                  don&apos;t account for that difference.
                </p>
              </div>
              <div className="border-l-2 border-forge-border-bright pl-4">
                <p className="text-forge-text font-medium">
                  Platform-aware optimizers
                </p>
                <p className="mt-1 text-sm">
                  Tools that know how specific ATS platforms parse PDFs, what
                  fields they weight, and how recruiters typically configure
                  their scoring. These produce meaningfully better results for
                  targeted applications.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              How to use an optimizer without making your resume sound robotic
            </h2>
            <p>
              The most common mistake is treating keyword suggestions as a
              checklist and inserting them verbatim wherever they fit. Recruiters
              who read your resume after the ATS filters are smart — they can
              tell when a resume was stuffed.
            </p>
            <p className="mt-4">
              The right approach:
            </p>
            <ul className="mt-3 space-y-3 list-none">
              {[
                "Use keyword suggestions as a signal, not a script. If 'cross-functional collaboration' is missing, find an actual example from your experience that demonstrates it — then write the bullet to match.",
                "Prioritize the skills and technologies you actually know. Adding 'Kubernetes' to pass a filter when you've never used it will surface in a technical screen.",
                "Keep bullets outcome-focused. Numbers, percentages, impact — this is what makes a resume readable to humans after it passes the ATS.",
                "One optimization per application. The same resume rarely performs well for two different jobs. Tailor each one.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              The ATS platforms worth knowing in 2026
            </h2>
            <p>
              The market is dominated by a handful of platforms. Each has
              distinct parsing behavior:
            </p>
            <ul className="mt-4 space-y-3 list-none">
              {[
                {
                  platform: "Greenhouse",
                  note: "Strong PDF parser, but two-column layouts break it. Used heavily in tech and startups.",
                },
                {
                  platform: "Lever",
                  note: "Similar to Greenhouse in parsing quality. Often used alongside Greenhouse at larger companies.",
                },
                {
                  platform: "Workday",
                  note: "Notoriously strict parser. Multi-column layouts, tables, and non-standard section headers frequently cause major data loss.",
                },
                {
                  platform: "iCIMS",
                  note: "Common in enterprise and non-tech industries. Prefers clean, simple formatting.",
                },
                {
                  platform: "Taleo (Oracle)",
                  note: "One of the oldest ATS platforms. Large companies and government. Parse quality is poor — simple is essential.",
                },
              ].map((item) => (
                <li key={item.platform} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>
                    <strong className="text-forge-text">{item.platform}:</strong>{" "}
                    {item.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              Try it on your resume
            </h2>
            <p>
              GetDreamRole is built specifically for platform-aware
              optimization. Choose the ATS the company uses, upload your resume,
              paste the job description, and get a scored analysis with
              AI-rewritten bullets — tuned to how that specific platform
              evaluates candidates. One-time $9.99.
            </p>
            <div className="mt-6">
              <Link
                href="/optimize"
                className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Optimize my resume →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
