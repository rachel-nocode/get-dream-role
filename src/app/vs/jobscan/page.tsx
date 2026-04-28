import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildBreadcrumbSchema,
  buildMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "GetDreamRole vs Jobscan: Which ATS Resume Optimizer Wins in 2026?",
  description:
    "Honest comparison of GetDreamRole and Jobscan. Pricing, ATS coverage, accuracy, speed, and privacy. See which resume optimizer is right for your job search.",
  path: "/vs/jobscan",
  keywords: [
    "jobscan alternative",
    "jobscan vs getdreamrole",
    "jobscan competitor",
    "best ats resume optimizer",
    "ats resume checker comparison",
  ],
});

const faqs = [
  {
    question: "Is GetDreamRole cheaper than Jobscan?",
    answer:
      "Yes. GetDreamRole is a one-time $9.99 payment with unlimited optimizations after the first free scan. Jobscan charges a recurring monthly subscription. For most job searches (4–8 weeks), GetDreamRole costs roughly 4x–10x less.",
  },
  {
    question: "Does GetDreamRole support the same ATS platforms as Jobscan?",
    answer:
      "GetDreamRole provides dedicated optimization profiles for Greenhouse, Lever, Workday, iCIMS, and Taleo — the five ATS systems that power most tech and mid-market hiring. Jobscan mentions more ATS systems but uses a single generic scoring engine for all of them.",
  },
  {
    question: "Which is more accurate for resume scoring?",
    answer:
      "Accuracy depends on whether the optimizer knows how your specific ATS parses resumes. GetDreamRole tailors keyword weighting to the ATS you select. Jobscan returns a generic match rate regardless of ATS choice.",
  },
  {
    question: "Can I try GetDreamRole before paying?",
    answer:
      "Your first resume analysis is free — score, keyword gaps, and rewritten bullets included. No credit card required.",
  },
  {
    question: "Why would someone choose Jobscan over GetDreamRole?",
    answer:
      "Jobscan has a larger product suite (cover letters, LinkedIn optimization, job tracker) and stronger brand recognition. If you want a single subscription covering the entire job search workflow, Jobscan is broader. If you want the most accurate ATS-specific resume score for the lowest price, GetDreamRole wins.",
  },
];

const schemas = [
  buildWebPageSchema({
    title: "GetDreamRole vs Jobscan: Which ATS Resume Optimizer Wins?",
    description:
      "Honest head-to-head comparison of GetDreamRole and Jobscan across pricing, ATS coverage, accuracy, and privacy.",
    path: "/vs/jobscan",
    keywords: [
      "jobscan alternative",
      "jobscan vs getdreamrole",
      "ats resume optimizer comparison",
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/vs/jobscan" },
    { name: "Jobscan", path: "/vs/jobscan" },
  ]),
];

type Verdict = "getdreamrole" | "jobscan" | "tie";

const comparison: {
  dimension: string;
  getdreamrole: string;
  jobscan: string;
  verdict: Verdict;
}[] = [
  {
    dimension: "Pricing",
    getdreamrole: "$9.99 one-time, unlimited optimizations",
    jobscan: "Monthly subscription, $49.95+/mo",
    verdict: "getdreamrole",
  },
  {
    dimension: "First scan",
    getdreamrole: "Free, no credit card",
    jobscan: "Limited free tier, then paywall",
    verdict: "getdreamrole",
  },
  {
    dimension: "ATS-specific profiles",
    getdreamrole: "5 dedicated profiles (Greenhouse, Lever, Workday, iCIMS, Taleo)",
    jobscan: "Generic scoring engine, ATS name is cosmetic",
    verdict: "getdreamrole",
  },
  {
    dimension: "Scoring accuracy",
    getdreamrole: "Keyword weighting calibrated per ATS",
    jobscan: "Single match-rate model across all jobs",
    verdict: "getdreamrole",
  },
  {
    dimension: "Bullet-level rewrites",
    getdreamrole: "Every bullet rewritten with keyword targeting",
    jobscan: "Suggestions, manual edits expected",
    verdict: "getdreamrole",
  },
  {
    dimension: "Cover letter tool",
    getdreamrole: "On roadmap",
    jobscan: "Included",
    verdict: "jobscan",
  },
  {
    dimension: "LinkedIn optimizer",
    getdreamrole: "Not offered",
    jobscan: "Included",
    verdict: "jobscan",
  },
  {
    dimension: "Resume builder",
    getdreamrole: "Not offered (optimize existing resume)",
    jobscan: "Included",
    verdict: "jobscan",
  },
  {
    dimension: "Data privacy",
    getdreamrole: "Resume processed in memory, not stored",
    jobscan: "Account-based storage, retained per terms",
    verdict: "getdreamrole",
  },
  {
    dimension: "Speed",
    getdreamrole: "Under 30s per optimization",
    jobscan: "Similar, dashboard overhead",
    verdict: "tie",
  },
  {
    dimension: "Brand recognition",
    getdreamrole: "New, growing",
    jobscan: "Established since 2013",
    verdict: "jobscan",
  },
];

const verdictLabel: Record<Verdict, string> = {
  getdreamrole: "GetDreamRole",
  jobscan: "Jobscan",
  tie: "Tie",
};

const verdictClass: Record<Verdict, string> = {
  getdreamrole: "text-forge-accent",
  jobscan: "text-forge-muted",
  tie: "text-forge-muted",
};

export default function JobscanComparisonPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="pt-24 pb-24">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 mb-16">
          <nav className="text-sm text-forge-muted mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-forge-text transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-forge-text">GetDreamRole vs Jobscan</li>
            </ol>
          </nav>
          <p className="font-display text-forge-accent text-xs tracking-[0.2em] uppercase mb-4">
            Comparison
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight text-forge-text mb-6">
            GetDreamRole vs Jobscan
          </h1>
          <p className="text-lg text-forge-muted max-w-2xl leading-relaxed">
            Two resume optimizers, two different philosophies. Jobscan is a
            broad career-platform subscription. GetDreamRole is a focused
            ATS-specific optimizer with a one-time price. Here is how they
            stack up in 2026.
          </p>
        </section>

        {/* Quick verdict */}
        <section className="max-w-5xl mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
              <p className="text-xs text-forge-muted tracking-wider uppercase font-display mb-2">
                Pick GetDreamRole if
              </p>
              <p className="text-forge-text leading-relaxed">
                You want the most accurate ATS-specific score, you know which
                ATS the company uses, and you want a one-time price with
                unlimited scans.
              </p>
            </div>
            <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
              <p className="text-xs text-forge-muted tracking-wider uppercase font-display mb-2">
                Pick Jobscan if
              </p>
              <p className="text-forge-text leading-relaxed">
                You want an all-in-one job search suite (cover letters,
                LinkedIn, tracker) and are comfortable with a monthly
                subscription.
              </p>
            </div>
            <div className="bg-forge-surface border border-forge-accent rounded-xl p-6">
              <p className="text-xs text-forge-accent tracking-wider uppercase font-display mb-2">
                Our verdict
              </p>
              <p className="text-forge-text leading-relaxed">
                If the goal is passing the filter for the job you are
                applying to today, GetDreamRole is the sharper tool at a
                fraction of the cost.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-5xl mx-auto px-6 mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forge-text mb-8">
            Feature-by-feature breakdown
          </h2>
          <div className="bg-forge-surface border border-forge-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-forge-elevated">
                <tr className="text-left">
                  <th className="px-5 py-4 font-display text-forge-muted tracking-wider uppercase text-xs">
                    Dimension
                  </th>
                  <th className="px-5 py-4 font-display text-forge-accent tracking-wider uppercase text-xs">
                    GetDreamRole
                  </th>
                  <th className="px-5 py-4 font-display text-forge-muted tracking-wider uppercase text-xs">
                    Jobscan
                  </th>
                  <th className="px-5 py-4 font-display text-forge-muted tracking-wider uppercase text-xs text-right">
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.dimension}
                    className={`border-t border-forge-border ${
                      i % 2 === 0 ? "bg-transparent" : "bg-forge-bg/30"
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-forge-text">
                      {row.dimension}
                    </td>
                    <td className="px-5 py-4 text-forge-muted">
                      {row.getdreamrole}
                    </td>
                    <td className="px-5 py-4 text-forge-muted">
                      {row.jobscan}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-semibold ${verdictClass[row.verdict]}`}
                    >
                      {verdictLabel[row.verdict]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing section */}
        <section className="max-w-5xl mx-auto px-6 mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forge-text mb-8">
            The real cost over a job search
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-forge-surface border border-forge-accent rounded-xl p-6">
              <p className="font-display text-forge-accent text-xs tracking-[0.2em] uppercase mb-3">
                GetDreamRole
              </p>
              <p className="text-4xl font-display font-bold text-forge-text mb-2">
                $9.99
              </p>
              <p className="text-forge-muted text-sm mb-4">one-time</p>
              <ul className="text-forge-text text-sm space-y-2">
                <li>First scan free</li>
                <li>Unlimited optimizations after</li>
                <li>No recurring charge, ever</li>
                <li>5 ATS-specific profiles</li>
              </ul>
            </div>
            <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
              <p className="font-display text-forge-muted text-xs tracking-[0.2em] uppercase mb-3">
                Jobscan (typical plan)
              </p>
              <p className="text-4xl font-display font-bold text-forge-text mb-2">
                $49.95
              </p>
              <p className="text-forge-muted text-sm mb-4">per month</p>
              <ul className="text-forge-text text-sm space-y-2">
                <li>Limited free scans</li>
                <li>Monthly auto-renewal</li>
                <li>Full suite (cover letter, LinkedIn)</li>
                <li>Generic ATS scoring</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-forge-muted mt-6">
            A typical tech job search takes 4–8 weeks. At $9.99 one-time vs
            $49.95/mo, GetDreamRole costs 20x less over a two-month search.
          </p>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forge-text mb-8">
            Common questions
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-forge-surface border border-forge-border rounded-xl p-5"
              >
                <h3 className="font-semibold text-forge-text text-lg mb-2">
                  {faq.question}
                </h3>
                <p className="text-forge-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forge-text mb-4">
            Try GetDreamRole free
          </h2>
          <p className="text-forge-muted text-lg mb-8">
            Upload your resume, pick your ATS, and see the score before paying
            anything.
          </p>
          <Link
            href="/optimize"
            className="inline-block bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Start free analysis &rarr;
          </Link>
        </section>
      </main>
    </>
  );
}
