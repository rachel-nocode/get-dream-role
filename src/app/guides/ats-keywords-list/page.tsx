import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildBreadcrumbSchema,
  buildDatasetSchema,
  buildItemListSchema,
  buildMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Applicant Tracking System Keywords List for Resumes",
  description:
    "A practical ATS keywords list by role category, plus rules for finding the right resume keywords from any job description without stuffing.",
  path: "/guides/ats-keywords-list",
  keywords: [
    "applicant tracking system keywords list",
    "ATS keywords list",
    "resume keywords for ATS",
    "ATS keyword finder",
    "resume keyword optimization",
  ],
  type: "article",
});

const keywordGroups = [
  {
    category: "Engineering",
    items: ["TypeScript", "React", "Node.js", "AWS", "CI/CD", "PostgreSQL", "REST APIs", "system design"],
  },
  {
    category: "Product",
    items: ["roadmap", "user research", "experimentation", "metrics", "stakeholders", "requirements", "launch"],
  },
  {
    category: "Marketing",
    items: ["SEO", "conversion rate optimization", "campaigns", "lifecycle", "analytics", "content strategy"],
  },
  {
    category: "Sales",
    items: ["pipeline", "quota", "CRM", "discovery", "forecasting", "enterprise accounts", "renewals"],
  },
  {
    category: "Operations",
    items: ["process improvement", "vendor management", "forecasting", "compliance", "SOPs", "reporting"],
  },
];

const allKeywords = keywordGroups.flatMap((group) => group.items);

const schemas = [
  buildWebPageSchema({
    title: "Applicant Tracking System Keywords List",
    description:
      "A role-based guide to ATS keywords and resume keyword optimization.",
    path: "/guides/ats-keywords-list",
    keywords: ["ATS keywords list", "resume keywords for ATS"],
  }),
  buildItemListSchema({
    name: "ATS resume keywords list",
    description: "Common role keywords that applicant tracking systems and recruiters search for.",
    items: allKeywords,
  }),
  buildDatasetSchema({
    name: "GetDreamRole ATS keywords list",
    description: "Role-based ATS keyword examples for resume optimization.",
    path: "/guides/ats-keywords-list",
    keywords: ["ATS keywords list", "resume keyword optimization"],
  }),
  buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides/ats-keywords-list" },
    { name: "ATS Keywords List", path: "/guides/ats-keywords-list" },
  ]),
];

export default function AtsKeywordsListPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-forge-accent">
            ATS Keywords List
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-forge-text md:text-6xl">
            Resume keywords are not magic words. They are evidence.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-forge-muted">
            The right ATS keywords come from the exact job description:
            required tools, certifications, responsibilities, seniority signals,
            and domain terms. Use this list as a starting point, then tailor it
            to the role.
          </p>
        </section>

        <section className="mt-14 overflow-hidden rounded-xl border border-forge-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-forge-elevated text-xs uppercase tracking-wider text-forge-muted">
              <tr>
                <th className="px-5 py-4">Role area</th>
                <th className="px-5 py-4">Keyword examples</th>
                <th className="px-5 py-4">Where to prove them</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-border">
              {keywordGroups.map((group) => (
                <tr key={group.category} className="bg-forge-surface">
                  <td className="px-5 py-4 font-semibold text-forge-text">
                    {group.category}
                  </td>
                  <td className="px-5 py-4 text-forge-muted">
                    {group.items.join(", ")}
                  </td>
                  <td className="px-5 py-4 text-forge-muted">
                    Skills section plus experience bullets with outcomes.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-forge-text">
              How to find the right ATS keywords
            </h2>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-forge-muted">
              <li>1. Copy the required qualifications from the posting.</li>
              <li>2. Highlight tools, certifications, methods, and industries.</li>
              <li>3. Keep exact wording when it honestly matches your experience.</li>
              <li>4. Add synonyms only after the exact terms are covered.</li>
              <li>5. Prove important keywords in bullets, not only a skills list.</li>
            </ol>
          </div>
          <div className="rounded-xl border border-forge-border bg-forge-surface p-6">
            <h2 className="font-display text-2xl font-bold text-forge-text">
              Keyword stuffing backfires
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-forge-muted">
              Repeating a phrase ten times does not make a weak resume strong.
              ATS and recruiter search reward relevant terms, but humans still
              read the final document. Match language, then show proof.
            </p>
            <Link href="/tools/resume-keyword-scanner" className="mt-6 inline-flex rounded-lg bg-forge-accent px-5 py-2.5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover">
              Scan my resume keywords
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
