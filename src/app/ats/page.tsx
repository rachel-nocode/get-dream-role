import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ATS Platform Support",
  description:
    "Choose the ATS the company uses and get resume guidance tuned to Greenhouse, Lever, Workday, iCIMS, Taleo, and other applicant tracking systems.",
  path: "/ats",
  keywords: [
    "ATS platforms",
    "Greenhouse vs Workday ATS",
    "resume ATS guides",
    "applicant tracking system help",
  ],
});

const platforms = [
  {
    id: "greenhouse",
    name: "Greenhouse",
    tag: "Used by: tech companies & startups",
    summary:
      "Good PDF parser, recruiter scorecards, strong keyword matching. The most common ATS at VC-backed companies.",
    href: "/ats/greenhouse",
    hasDedicatedPage: true,
  },
  {
    id: "lever",
    name: "Lever",
    tag: "Used by: growth-stage companies",
    summary:
      "Context-aware matching with a CRM-style candidate pipeline. Hiring managers actively co-review — narrative and framing matter.",
    href: "/ats/lever",
    hasDedicatedPage: true,
  },
  {
    id: "workday",
    name: "Workday",
    tag: "Used by: Fortune 500 & enterprise",
    summary:
      "One of the strictest parsers on the market. Complex formatting causes major data loss. Exact keyword density is critical.",
    href: "/ats/workday",
    hasDedicatedPage: true,
  },
  {
    id: "icims",
    name: "iCIMS",
    tag: "Used by: mid-market & enterprise",
    summary:
      "Semantic similarity scoring ranks candidates by contextual relevance. Clean formatting and contextual keyword usage beat keyword stuffing.",
    href: "/optimize?ats=icims",
    hasDedicatedPage: false,
  },
  {
    id: "taleo",
    name: "Taleo",
    tag: "Used by: large companies & government",
    summary:
      "One of the oldest ATS platforms. Boolean keyword matching with rigid parsing rules. Simple, single-column formatting is essential.",
    href: "/optimize?ats=taleo",
    hasDedicatedPage: false,
  },
  {
    id: "generic",
    name: "Generic ATS",
    tag: "Unknown or unlisted system",
    summary:
      "Safe defaults optimized for cross-platform compatibility. Best choice when you can't identify which ATS the company uses.",
    href: "/optimize?ats=generic",
    hasDedicatedPage: false,
  },
];

export default function AtsHubPage() {
  return (
    <>
      <StructuredData
        data={buildWebPageSchema({
          title: "ATS Platform Support",
          description:
            "A hub page for Greenhouse, Lever, Workday, iCIMS, Taleo, and other ATS-specific resume guides.",
          path: "/ats",
          keywords: ["ATS platforms", "resume ATS guides", "ATS comparison"],
        })}
      />
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-forge-accent text-xs tracking-[0.18em] uppercase font-display">
          Platform Support
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-forge-text">
          Every ATS is different.
          <br />
          GetDreamRole knows each one.
        </h1>
        <p className="mt-4 text-forge-muted text-lg max-w-xl leading-relaxed">
          Greenhouse parses resumes differently than Workday. Lever weights
          candidates differently than Taleo. Generic optimizers miss this.
          GetDreamRole doesn&apos;t.
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="group relative border border-forge-border bg-forge-surface rounded-xl p-6 hover:border-forge-border-bright transition-colors"
            >
              <p className="text-forge-accent text-xs tracking-wider uppercase font-display">
                {p.tag}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-forge-text group-hover:text-forge-accent transition-colors">
                {p.name}
              </h2>
              <p className="mt-3 text-sm text-forge-muted leading-relaxed">
                {p.summary}
              </p>
              <p className="mt-4 text-xs text-forge-accent">
                {p.hasDedicatedPage ? "Full guide →" : "Optimize now →"}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 border-t border-forge-border pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-forge-text">
              Not sure which ATS the company uses?
            </p>
            <p className="mt-1 text-sm text-forge-muted">
              Look for the job URL — Greenhouse jobs end in{" "}
              <code className="text-forge-text bg-forge-elevated px-1.5 py-0.5 rounded text-xs">
                greenhouse.io
              </code>
              , Lever in{" "}
              <code className="text-forge-text bg-forge-elevated px-1.5 py-0.5 rounded text-xs">
                lever.co
              </code>
              , Workday in{" "}
              <code className="text-forge-text bg-forge-elevated px-1.5 py-0.5 rounded text-xs">
                myworkdayjobs.com
              </code>
              .
            </p>
          </div>
          <Link
            href="/optimize"
            className="shrink-0 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Start Optimizing →
          </Link>
        </div>
      </main>
    </>
  );
}
