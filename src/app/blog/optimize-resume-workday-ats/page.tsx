import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-workday-ats")!;

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

export default function WorkdayGuidePage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          If you are applying through Workday, resume formatting matters more
          than most people realize. Workday is one of the least forgiving ATS
          systems in the market. A resume can be well written and still fail
          because the parser mangled the content before any recruiter saw it.
        </p>
        <p>
          That is why the best workday ats resume strategy is simple: keep the
          structure plain, match the wording in the job description carefully,
          and remove anything decorative. You can also compare this with the{" "}
          <Link href="/ats/workday" className="text-forge-text underline underline-offset-2">
            Workday ATS landing page
          </Link>{" "}
          before you jump into the product flow.
        </p>

        <GuideCta
          title="Start with the strictest ATS settings"
          description="Select Workday in the optimizer and get a cleaner, ATS-safe version of your resume before you apply."
          href="/optimize?ats=workday"
          label="Optimize my resume for Workday"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What Workday cares about most
          </h2>
          <ul className="space-y-3">
            {[
              "A simple one-column layout with no sidebars or floating content",
              "Exact wording for required tools, certifications, and responsibilities",
              "Clear job titles, company names, and dates in a standard format",
              "Bullets that prove skill depth instead of vague summaries",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-forge-accent">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Workday is much less forgiving than Greenhouse or Lever. If you need
            a broader reset on structure, start with the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The common Workday failures
          </h2>
          <p>
            Candidates run into trouble when they rely on tables, icons,
            columns, or skill meters. Workday often scrambles or drops that
            content. Another frequent problem is paraphrasing the job
            description too much. If the posting says “Structured Query
            Language,” make sure both “SQL” and “Structured Query Language”
            appear where they honestly fit.
          </p>
        </section>

        <GuideCta
          title="Check the exact wording before you submit"
          description="GetDreamRole highlights the missing terms and rewrites thin bullets so the resume speaks Workday's language."
          href="/optimize?ats=workday"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A simple Workday checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Use a plain PDF with one column and no tables.</li>
            <li>Match the exact terms in the job description where honest.</li>
            <li>Put critical tools in both Skills and Experience sections.</li>
            <li>Keep dates and titles easy to parse.</li>
            <li>Re-enter the important information carefully in the online form.</li>
          </ol>
          <p className="mt-4">
            If you want a less strict comparison point, the{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse guide
            </Link>{" "}
            shows how a more modern ATS changes the resume emphasis.
          </p>
        </section>

        <GuideCta
          title="Apply with a Workday-safe version"
          description="Use the product flow to turn the current resume into a simpler, better-matched version before the ATS sees it."
          href="/optimize?ats=workday"
          label="Start optimizing for Workday"
        />
      </GuideArticleShell>
    </>
  );
}
