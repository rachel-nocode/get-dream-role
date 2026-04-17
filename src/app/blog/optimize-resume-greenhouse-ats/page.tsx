import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-greenhouse-ats")!;

export const metadata: Metadata = buildMetadata({
  title: post.title,
  description: post.description,
  path: `/blog/${post.slug}`,
  keywords: post.keywords,
  type: "article",
});

const schema = buildBlogPostingSchema({
  title: post.title,
  description: post.description,
  path: `/blog/${post.slug}`,
  keywords: post.keywords,
  datePublished: post.date,
});

export default function GreenhouseAtsPost() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Greenhouse is one of the most common ATS platforms in tech, which is
          why so many job seekers search for greenhouse resume tips after they
          spot a `greenhouse.io` apply link. The upside is that Greenhouse can
          parse resumes fairly well. The downside is that recruiters still use
          keyword filters, scorecards, and fast scans that can quietly bury a
          solid candidate.
        </p>
        <p>
          The goal is not to stuff keywords. The goal is to make your resume
          easy for Greenhouse to parse and easy for a recruiter to search. If
          you also want the faster product flow, start with the{" "}
          <Link href="/ats/greenhouse" className="text-forge-text underline underline-offset-2">
            Greenhouse landing page
          </Link>{" "}
          or jump straight into{" "}
          <Link href="/optimize?ats=greenhouse" className="text-forge-text underline underline-offset-2">
            the optimizer with Greenhouse selected
          </Link>
          .
        </p>

        <GuideCta
          title="Tailor the resume before you submit it"
          description="Paste the job description, choose Greenhouse, and let GetDreamRole surface missing keywords and rewrite weak bullets before you apply."
          href="/optimize?ats=greenhouse"
          label="Optimize my resume for Greenhouse"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What Greenhouse usually gets right
          </h2>
          <p>
            Compared with older ATS systems, Greenhouse is better at reading a
            normal PDF resume. Single-column layouts, standard section headings,
            and plain text contact information usually parse cleanly. That means
            many candidates do not fail because Greenhouse is broken. They fail
            because the resume does not line up well enough with the role.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Use standard section names like Work Experience, Skills, and Education.",
              "Repeat high-value tools and skills in both a Skills section and your experience bullets.",
              "Mirror the language in the job description when it describes must-have tools or responsibilities.",
              "Keep dates and job titles easy to read so the recruiter can scan quickly after the ATS pass.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-forge-accent">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The Greenhouse mistakes that still cost interviews
          </h2>
          <p>
            The biggest mistake is assuming Greenhouse is “easy” and sending the
            same resume everywhere. Recruiters still search their candidate pool
            by skill, job title, experience level, and product language. If your
            resume says “built internal tools” while the job description says
            “built customer-facing workflow automation in TypeScript,” you may
            never show up as a strong match.
          </p>
          <p className="mt-4">
            Greenhouse candidates should also avoid the formatting problems that
            slip content into the wrong place, especially sidebars, text boxes,
            and overdesigned templates. If you need a broader formatting reset,
            the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>{" "}
            is the next best read.
          </p>
        </section>

        <GuideCta
          title="See the keyword gaps before a recruiter does"
          description="Run the resume against the exact job description and get rewritten bullets built for Greenhouse-style recruiter search."
          href="/optimize?ats=greenhouse"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A better Greenhouse checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Start with a plain, single-column PDF.</li>
            <li>Use a short summary that matches the target role.</li>
            <li>Make sure the top required skills appear early and naturally.</li>
            <li>Rewrite generic bullets with tools, scope, and measurable impact.</li>
            <li>Check the finished version against the job description before submitting.</li>
          </ol>
          <p className="mt-4">
            If you are comparing platforms, read the{" "}
            <Link href="/blog/optimize-resume-lever-ats" className="text-forge-text underline underline-offset-2">
              Lever guide
            </Link>{" "}
            too. It helps show where Greenhouse and Lever behave similarly and
            where the resume emphasis changes.
          </p>
        </section>

        <GuideCta
          title="Apply with a Greenhouse-specific version"
          description="A tailored resume beats a generic one almost every time. Let the optimizer build the ATS-safe version before you hit submit."
          href="/optimize?ats=greenhouse"
          label="Start optimizing for Greenhouse"
        />
      </GuideArticleShell>
    </>
  );
}
