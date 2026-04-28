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
  title: "Free ATS Resume Checker: Score Your Resume in 30 Seconds",
  description:
    "Run a free ATS resume check against a real job description. Get an ATS score, keyword gaps, formatting risks, and next-step fixes before you apply.",
  path: "/free-ats-resume-checker",
  keywords: [
    "free ATS resume checker",
    "ATS resume checker free",
    "free resume scanner",
    "check my resume ATS",
    "resume ATS score free",
  ],
});

const checks = [
  "Keyword match against the exact job description",
  "ATS-safe section headings and work history structure",
  "Missing required and preferred skills",
  "Formatting risks like columns, tables, headers, and text boxes",
  "Bullet strength, specificity, and measurable impact",
];

const faqs = [
  {
    question: "Is the ATS resume checker really free?",
    answer:
      "Yes. Your first resume analysis is free. You can see the score, keyword gaps, and suggested fixes before deciding whether to unlock unlimited optimizations.",
  },
  {
    question: "Do I need a job description?",
    answer:
      "Yes for the best result. ATS matching is job-specific, so the checker compares your resume to the posting you are applying for instead of giving a generic resume score.",
  },
  {
    question: "Do you store my resume?",
    answer:
      "Resume text is processed for the analysis and results are kept in your browser session. Do not upload sensitive documents you would not want processed by an AI service.",
  },
  {
    question: "How is this different from Jobscan?",
    answer:
      "GetDreamRole focuses on ATS-specific rewrites for Greenhouse, Workday, Lever, iCIMS, Taleo, and similar systems, with one free scan and a one-time upgrade instead of a recurring subscription.",
  },
];

const schemas = [
  buildWebPageSchema({
    title: "Free ATS Resume Checker",
    description:
      "A free ATS checker that scores a resume against a real job description and explains keyword, formatting, and section risks.",
    path: "/free-ats-resume-checker",
    keywords: ["free ATS resume checker", "resume ATS score free"],
  }),
  buildSoftwareApplicationSchema({
    title: "GetDreamRole Free ATS Resume Checker",
    description:
      "A free web tool for checking ATS resume compatibility against a target job description.",
    path: "/free-ats-resume-checker",
    keywords: ["free ATS resume checker", "free resume scanner"],
    applicationSubCategory: "Resume checker",
    offerPrice: "0",
    featureList: checks,
  }),
  buildHowToSchema({
    name: "How to check your resume for ATS compatibility",
    description:
      "Check a resume by uploading it, adding the job description, choosing the target ATS, and reviewing score, keywords, and formatting risks.",
    steps: [
      {
        name: "Upload or paste your resume",
        text: "Use a PDF or paste the resume text so the checker can read your actual content.",
      },
      {
        name: "Paste the job description",
        text: "ATS matching depends on the target role, so include the job posting before scoring.",
      },
      {
        name: "Choose the ATS platform",
        text: "Select Greenhouse, Workday, Lever, iCIMS, Taleo, or generic ATS when the platform is unknown.",
      },
      {
        name: "Review the score and gaps",
        text: "Fix missing keywords, risky formatting, weak bullets, and section issues before applying.",
      },
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Free ATS Resume Checker", path: "/free-ats-resume-checker" },
  ]),
];

export default function FreeAtsResumeCheckerPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-forge-accent">
              Free ATS Resume Checker
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-forge-text md:text-6xl">
              Score your resume before the ATS does.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-forge-muted">
              Upload your resume, paste the job description, and see the
              keyword gaps, formatting risks, and weak bullets that can keep a
              qualified candidate out of the recruiter pile.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/optimize"
                className="rounded-lg bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg transition-colors hover:bg-forge-accent-hover"
              >
                Score my resume free
              </Link>
              <Link
                href="/vs/jobscan"
                className="rounded-lg border border-forge-border px-6 py-3 text-sm font-semibold text-forge-text transition-colors hover:border-forge-border-bright"
              >
                Compare with Jobscan
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-forge-border bg-forge-surface p-6">
            <p className="font-display text-xs uppercase tracking-[0.18em] text-forge-muted">
              Free scan includes
            </p>
            <div className="mt-5 flex items-end gap-2">
              <span className="font-display text-6xl font-bold text-forge-success">
                87
              </span>
              <span className="pb-2 text-sm text-forge-muted">ATS score</span>
            </div>
            <ul className="mt-6 space-y-3">
              {checks.map((check) => (
                <li key={check} className="flex gap-3 text-sm text-forge-muted">
                  <span className="text-forge-accent">{"->"}</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "What your ATS score means",
              body: "A strong score means the resume is readable, mapped to the role, and specific enough for recruiter search. Under 70 usually means missing keywords, generic bullets, or risky formatting.",
            },
            {
              title: "Why generic checkers disagree",
              body: "Most checkers use different rules. GetDreamRole anchors the score to the job description and the ATS platform, because Workday and Greenhouse do not fail resumes the same way.",
            },
            {
              title: "What to fix first",
              body: "Start with required skills, section headings, contact details, and bullets that prove the target qualifications. Polish comes after the parser can read the document.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-forge-border pt-5">
              <h2 className="font-display text-xl font-semibold text-forge-text">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold text-forge-text">
            Free vs paid
          </h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-forge-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-forge-elevated text-xs uppercase tracking-wider text-forge-muted">
                <tr>
                  <th className="px-5 py-4">Feature</th>
                  <th className="px-5 py-4">Free scan</th>
                  <th className="px-5 py-4">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border">
                {[
                  ["ATS score", "Included", "Included"],
                  ["Keyword gaps", "Included", "Included"],
                  ["Bullet rewrites", "Limited", "Unlimited"],
                  ["Repeat scans", "One analysis", "Unlimited"],
                  ["Price", "$0", "$9.99 one-time"],
                ].map(([feature, free, paid]) => (
                  <tr key={feature} className="bg-forge-surface">
                    <td className="px-5 py-4 text-forge-text">{feature}</td>
                    <td className="px-5 py-4 text-forge-muted">{free}</td>
                    <td className="px-5 py-4 text-forge-muted">{paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold text-forge-text">
            Common questions
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-forge-border bg-forge-surface p-5">
                <h3 className="font-display text-lg font-semibold text-forge-text">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forge-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
