import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import {
  buildBlogPostingSchema,
  buildHowToSchema,
  buildMetadata,
} from "@/lib/seo";

const post = getBlogPost("does-my-resume-pass-ats")!;

export const metadata: Metadata = buildMetadata({
  title: post.title,
  description: post.description,
  path: `/blog/${post.slug}`,
  keywords: post.keywords,
  type: "article",
});

const schemas = [
  buildBlogPostingSchema({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    datePublished: post.date,
  }),
  buildHowToSchema({
    name: "How to know if your resume passes ATS",
    description:
      "Check resume pass likelihood by reviewing score, structure, section headings, contact details, and job-specific keyword match.",
    steps: [
      {
        name: "Check parser-safe structure",
        text: "Use one column, standard headings, selectable text, and normal body text for contact details.",
      },
      {
        name: "Compare against the job description",
        text: "Look for missing required tools, certifications, responsibilities, and role-specific phrases.",
      },
      {
        name: "Review bullet evidence",
        text: "Make sure important skills appear in experience bullets with outcomes, not only in a skills list.",
      },
      {
        name: "Run a job-specific ATS scan",
        text: "Use a checker with the exact posting and ATS platform before submitting.",
      },
    ],
  }),
];

const redFlags = [
  "The resume uses two columns, tables, icons, text boxes, or skill bars.",
  "Contact information lives in a header, footer, image, or decorative block.",
  "The job description asks for tools that never appear in your resume.",
  "Skills are listed once but never proven in the experience section.",
  "Dates, titles, and companies are inconsistent or hard to parse.",
  "The resume is a scanned PDF or has text that cannot be selected.",
];

export default function DoesMyResumePassAtsPage() {
  return (
    <>
      <StructuredData data={schemas} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p className="text-forge-text">
          Your resume is more likely to pass ATS if it scores 75 or higher
          against the job description, uses standard section headings, includes
          contact details as normal text, uses a single-column layout, and
          saves as selectable text. The only useful test is against the actual
          role you want.
        </p>

        <GuideCta
          title="Run the real test"
          description="Upload the resume, paste the job description, choose the ATS if you know it, and see what would likely break before you apply."
          href="/free-ats-resume-checker"
          label="Check my resume free"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The 30-second ATS pass/fail check
          </h2>
          <ul className="space-y-3">
            {redFlags.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-forge-accent">{"->"}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            One red flag does not guarantee rejection. Several red flags
            together mean the resume is gambling with the parser before a human
            gets a fair look.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What ATS software actually checks
          </h2>
          <p>
            Most systems care about readable structure, required keywords, job
            titles, dates, skills, education, certifications, and how closely
            your resume matches the posting. Some systems, like{" "}
            <Link href="/ats/workday" className="text-forge-text underline underline-offset-2">
              Workday
            </Link>
            , are strict about parsing. Others, like{" "}
            <Link href="/ats/greenhouse" className="text-forge-text underline underline-offset-2">
              Greenhouse
            </Link>
            , are more flexible but still rely on recruiter search and scorecard
            keywords.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What to do if your resume is failing
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Move to a one-column format with standard headings.</li>
            <li>Paste the job description and pull out required skills.</li>
            <li>Add exact terms only where they are honest and provable.</li>
            <li>Rewrite generic bullets with outcomes, tools, and scope.</li>
            <li>Run another scan before submitting.</li>
          </ol>
        </section>

        <GuideCta
          title="Fix the score before the application"
          description="GetDreamRole shows missing keywords and rewrites weak bullets without inventing experience."
          href="/optimize"
          label="Optimize this resume"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            Common ATS pass questions
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-forge-text">
                Can a PDF pass ATS?
              </h3>
              <p className="mt-2">
                Yes, if the PDF has selectable text and a simple structure.
                Scanned PDFs and design-heavy exports are riskier.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-forge-text">
                Does Word format matter?
              </h3>
              <p className="mt-2">
                In strict systems, a clean DOCX can parse more reliably than a
                complex PDF. The structure matters more than the file extension.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-forge-text">
                Do pictures get you rejected?
              </h3>
              <p className="mt-2">
                Pictures are not useful for ATS matching and can create parsing
                risk. Keep critical resume content as plain text.
              </p>
            </div>
          </div>
        </section>
      </GuideArticleShell>
    </>
  );
}
