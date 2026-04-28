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
  title: "GetDreamRole vs Resume Worded: Which Resume Checker Fits?",
  description:
    "Compare GetDreamRole and Resume Worded for ATS-specific job matching, resume scoring, bullet rewrites, and recruiter-style feedback.",
  path: "/vs/resume-worded",
  keywords: [
    "Resume Worded alternative",
    "GetDreamRole vs Resume Worded",
    "Resume Worded competitor",
    "ATS resume checker comparison",
  ],
});

const rows = [
  ["Primary job", "Optimize a resume for one job description and ATS", "Analyze resume quality and wording"],
  ["ATS-specific logic", "Platform profiles for major ATS systems", "Broader resume feedback"],
  ["Keyword gaps", "Based on the target job description", "General and role-aligned feedback"],
  ["Rewrite mode", "Bullet rewrites for missing terms and stronger evidence", "Line-level resume improvement guidance"],
  ["Best moment", "Right before applying to a specific role", "When improving an overall resume baseline"],
];

const schemas = [
  buildWebPageSchema({
    title: "GetDreamRole vs Resume Worded",
    description:
      "A comparison of GetDreamRole and Resume Worded for resume checking and ATS optimization.",
    path: "/vs/resume-worded",
    keywords: ["Resume Worded alternative", "ATS resume checker comparison"],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/vs/resume-worded" },
    { name: "Resume Worded", path: "/vs/resume-worded" },
  ]),
];

export default function ResumeWordedComparisonPage() {
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
            GetDreamRole vs Resume Worded
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-forge-muted">
            Resume Worded is useful for improving resume quality. GetDreamRole
            is built for the more urgent question: will this resume match this
            job in this ATS?
          </p>
        </section>

        <section className="mt-12 overflow-hidden rounded-xl border border-forge-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-forge-elevated text-xs uppercase tracking-wider text-forge-muted">
              <tr>
                <th className="px-5 py-4">Dimension</th>
                <th className="px-5 py-4">GetDreamRole</th>
                <th className="px-5 py-4">Resume Worded</th>
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

        <section className="mt-12 rounded-xl border border-forge-border bg-forge-surface p-6">
          <h2 className="font-display text-2xl font-bold text-forge-text">
            Use both ideas in the right order
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-forge-muted">
            First, make the base resume clear and specific. Then, before each
            important application, run the resume against the exact posting and
            tune keywords, bullets, and ATS-safe structure for that job.
          </p>
          <Link href="/tools/ats-score-checker" className="mt-6 inline-flex rounded-lg bg-forge-accent px-5 py-2.5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover">
            Check my ATS score
          </Link>
        </section>
      </main>
    </>
  );
}
