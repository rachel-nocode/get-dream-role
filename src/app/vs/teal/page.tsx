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
  title: "GetDreamRole vs Teal: ATS Resume Checker Comparison",
  description:
    "Compare GetDreamRole and Teal for ATS resume scoring, job-description keyword matching, rewrites, tracking, and job-search workflow fit.",
  path: "/vs/teal",
  keywords: [
    "Teal alternative",
    "GetDreamRole vs Teal",
    "Teal resume checker alternative",
    "ATS resume checker comparison",
  ],
});

const rows = [
  ["Best fit", "Fast ATS-specific resume optimization", "Broader job-search workspace and tracker"],
  ["ATS targeting", "Greenhouse, Workday, Lever, iCIMS, Taleo, and generic profiles", "General resume checking and job matching"],
  ["Rewrite help", "Bullet rewrites tied to the job description", "Resume-building and improvement guidance"],
  ["Workflow", "Score, fix, apply", "Track jobs, manage resumes, and organize search"],
  ["Pricing model", "One-time upgrade after free scan", "Free tools with paid product tiers"],
];

const schemas = [
  buildWebPageSchema({
    title: "GetDreamRole vs Teal",
    description:
      "A comparison of GetDreamRole and Teal for ATS resume optimization and job-search workflows.",
    path: "/vs/teal",
    keywords: ["Teal alternative", "ATS resume checker comparison"],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/vs/teal" },
    { name: "Teal", path: "/vs/teal" },
  ]),
];

export default function TealComparisonPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-forge-accent">
            Comparison
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-forge-text md:text-6xl">
            GetDreamRole vs Teal
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-forge-muted">
            Teal is strongest as a broader job-search workspace. GetDreamRole is
            sharper when the immediate problem is ATS match: score this resume
            against this job and fix the weak spots before applying.
          </p>
        </section>

        <section className="mt-12 overflow-hidden rounded-xl border border-forge-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-forge-elevated text-xs uppercase tracking-wider text-forge-muted">
              <tr>
                <th className="px-5 py-4">Dimension</th>
                <th className="px-5 py-4">GetDreamRole</th>
                <th className="px-5 py-4">Teal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-border">
              {rows.map(([dimension, getdreamrole, competitor]) => (
                <tr key={dimension} className="bg-forge-surface">
                  <td className="px-5 py-4 font-semibold text-forge-text">{dimension}</td>
                  <td className="px-5 py-4 text-forge-muted">{getdreamrole}</td>
                  <td className="px-5 py-4 text-forge-muted">{competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-forge-border bg-forge-surface p-6">
            <h2 className="font-display text-xl font-semibold text-forge-text">
              Pick GetDreamRole if
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-forge-muted">
              You have a job description open, know or can infer the ATS, and
              want targeted keyword gaps plus bullet rewrites without managing a
              whole job-search CRM.
            </p>
          </div>
          <div className="rounded-xl border border-forge-border bg-forge-surface p-6">
            <h2 className="font-display text-xl font-semibold text-forge-text">
              Pick Teal if
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-forge-muted">
              You want job tracking, saved roles, resume management, and a
              larger workspace around the whole search.
            </p>
          </div>
        </section>

        <Link href="/free-ats-resume-checker" className="mt-10 inline-flex rounded-lg bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover">
          Try the free ATS checker
        </Link>
      </main>
    </>
  );
}
