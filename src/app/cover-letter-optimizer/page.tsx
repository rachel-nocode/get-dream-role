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
  title: "Cover Letter ATS Optimizer: Match the Job in Minutes",
  description:
    "Optimize a cover letter for ATS keyword match, job-specific language, and recruiter readability using the same job description as your resume.",
  path: "/cover-letter-optimizer",
  keywords: [
    "cover letter ATS optimizer",
    "ATS cover letter",
    "cover letter ATS friendly",
    "optimize cover letter for ATS",
    "cover letter keywords",
  ],
});

const schemas = [
  buildWebPageSchema({
    title: "Cover Letter ATS Optimizer",
    description:
      "A product landing page for matching cover letters to job descriptions and ATS keyword expectations.",
    path: "/cover-letter-optimizer",
    keywords: ["cover letter ATS optimizer", "cover letter keywords"],
  }),
  buildSoftwareApplicationSchema({
    title: "GetDreamRole Cover Letter ATS Optimizer",
    description:
      "A planned GetDreamRole workflow for matching cover letters to target roles using ATS-aware keyword analysis.",
    path: "/cover-letter-optimizer",
    keywords: ["cover letter ATS optimizer", "ATS cover letter"],
    applicationSubCategory: "Cover letter optimization",
  }),
  buildHowToSchema({
    name: "How to optimize a cover letter for ATS",
    description:
      "Use the job description to align cover letter language with required skills and role outcomes.",
    steps: [
      { name: "Paste the job description", text: "Use the same posting you are targeting with your resume." },
      { name: "Identify must-have keywords", text: "Pull role-specific tools, responsibilities, and qualifications." },
      { name: "Rewrite around proof", text: "Use the keywords in context with evidence, not stuffing." },
      { name: "Keep it readable", text: "The cover letter still needs to persuade a human recruiter." },
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Cover Letter ATS Optimizer", path: "/cover-letter-optimizer" },
  ]),
];

export default function CoverLetterOptimizerPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-forge-accent">
            Cover Letter ATS Optimizer
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-forge-text md:text-6xl">
            Match the cover letter to the job, not a template.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-forge-muted">
            Some hiring workflows scan cover letters, some do not. Either way,
            the safest cover letter uses the same job-specific language as your
            resume and proves the strongest requirements quickly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/optimize" className="rounded-lg bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover">
              Optimize my resume first
            </Link>
            <Link href="/free-ats-resume-checker" className="rounded-lg border border-forge-border px-6 py-3 text-sm font-semibold text-forge-text hover:border-forge-border-bright">
              Check ATS fit
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            ["Keywords", "Mirror the role language where it fits your real background."],
            ["Proof", "Tie each claim to a result, project, customer, system, or metric."],
            ["Format", "Keep the letter plain, short, and readable by both parsers and people."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-forge-border bg-forge-surface p-6">
              <h2 className="font-display text-xl font-semibold text-forge-text">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                {body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
