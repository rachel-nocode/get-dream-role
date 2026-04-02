import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "Optimize Your Resume for Lever ATS",
  description:
    "Lever is used by growth-stage tech companies and is designed for collaborative hiring. GetDreamRole optimizes your resume for Lever's context-aware scoring and hiring manager review process.",
};

const facts = [
  {
    label: "Parse quality",
    value: "Good",
    note: "Similar parse quality to Greenhouse. Standard single-column PDFs parse reliably. Lever handles modern formatting better than most.",
  },
  {
    label: "Keyword matching",
    value: "Context-aware",
    note: "Lever uses semantic matching — it understands phrases and context, not just exact keywords. Narrative clarity matters.",
  },
  {
    label: "Who reviews",
    value: "Full hiring team",
    note: "Lever is built for collaborative hiring. Engineers, designers, and PMs often review candidates alongside recruiters.",
  },
  {
    label: "Prevalent in",
    value: "Growth-stage tech",
    note: "Commonly used at Series A–C companies and mid-size tech firms. Job URL contains lever.co or jobs.lever.co.",
  },
];

const mistakes = [
  "Generic bullets with no technical specificity — Lever's semantic scoring weights context. 'Built features' scores lower than 'Built real-time data pipeline processing 2M events/day using Kafka and Flink'.",
  "Burying technical skills — with Lever's collaborative review, the engineer on the hiring committee is scanning for specific technologies. A clear Skills section helps.",
  "Weak summary section — Lever's interface surfaces your summary prominently. A strong, keyword-rich opening shapes how the hiring team frames your profile.",
  "Omitting impact metrics — Lever companies tend to be growth-stage where business impact is highly valued. Quantify wherever possible.",
  "Resume length mismatched to seniority — Lever companies hire fast and review many candidates. Keep it tight: 1 page for <5 years experience, 2 pages maximum otherwise.",
];

export default function LeverLandingPage() {
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
            Lever ATS
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-forge-text leading-tight">
            Stand out
            <br />
            in Lever.
          </h1>
          <p className="mt-5 text-forge-muted text-lg max-w-lg leading-relaxed">
            Lever is built for collaborative hiring — engineers and PMs review
            alongside recruiters. GetDreamRole optimizes your resume for
            Lever&apos;s context-aware scoring and the technical scrutiny that
            comes with team-based hiring.
          </p>
          <div className="mt-7">
            <Link
              href="/optimize?ats=lever"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Optimize for Lever →
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
            What costs candidates interviews in Lever
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
            What GetDreamRole does for Lever applications
          </h2>
          <ul className="mt-5 space-y-3">
            {[
              "Scores your resume using Lever's semantic context-matching model — phrases and meaning, not just keyword counts",
              "Rewrites experience bullets to include specific technical context that passes engineer review",
              "Strengthens your summary section with keywords that shape how the hiring team frames your profile",
              "Identifies missing skills and technologies from the job description and rewrites bullets to include them naturally",
              "Flags generic, low-signal bullets and rewrites them with measurable impact language",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-forge-muted text-sm leading-relaxed">
                <span className="text-forge-success mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              href="/optimize?ats=lever"
              className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Optimize my resume for Lever →
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-10 flex items-center gap-6 text-sm text-forge-muted">
          <span>Related:</span>
          <Link href="/ats/greenhouse" className="hover:text-forge-text transition-colors underline underline-offset-2">
            Greenhouse optimization
          </Link>
          <Link href="/ats" className="hover:text-forge-text transition-colors underline underline-offset-2">
            All ATS platforms
          </Link>
        </div>
      </main>
    </>
  );
}
