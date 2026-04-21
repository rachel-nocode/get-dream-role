import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-workable-ats")!;

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

export default function WorkableAtsPost() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Workable powers hiring at more than 30,000 small and mid-sized
          companies worldwide. If the job post lives on a subdomain like
          <code className="mx-1 rounded bg-forge-elevated px-1.5 py-0.5 text-xs text-forge-text">
            apply.workable.com
          </code>
          , your resume is flowing through Workable&apos;s parser and AI
          matching engine.
        </p>
        <p>
          Workable is more modern than legacy ATS systems like Taleo or
          BrassRing. It parses clean PDFs well and uses AI scoring to rank
          candidates by relevance rather than pure keyword matching. But
          Workable still rewards resumes that match the posting&apos;s
          language directly.
        </p>

        <GuideCta
          title="Optimize for Workable before you apply"
          description="Paste the job description, pick Workable, and get a resume calibrated for its AI scoring engine."
          href="/optimize?ats=workable"
          label="Optimize for Workable"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            How Workable ranks candidates
          </h2>
          <p>
            Workable uses an AI Recruiter feature that scores each applicant
            against the job description. The score is visible to recruiters
            as a 1–5 star rating. Higher-scored candidates appear at the top
            of the pipeline, which means low-scoring candidates often never
            get manually reviewed.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Match job title language early in your resume (summary or most recent role).",
              "Hit the required skills list verbatim — Workable weights exact-match terms heavily.",
              "Include years-of-experience phrasing that aligns with the posting (e.g., \"5+ years of TypeScript\").",
              "Keep your most recent role detailed. Workable emphasizes recent relevance.",
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
            Formatting Workable handles well
          </h2>
          <p>
            Workable&apos;s parser is forgiving compared to older systems. A
            standard single-column PDF is the safe default. Two-column
            layouts sometimes work but fail unpredictably — not worth the
            risk when you are trying to rank high.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2">
            <li>Single column, 10.5–11pt body text.</li>
            <li>Clear section headings: Work Experience, Skills, Education.</li>
            <li>Contact details in body text.</li>
            <li>PDF with selectable text, not a screenshot.</li>
            <li>File name includes your name and role (e.g., <code className="rounded bg-forge-elevated px-1 text-xs">Jane-Doe-SWE-Resume.pdf</code>).</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The Workable-specific mistakes
          </h2>
          <p>
            The biggest mistake is sending a generic resume and hoping
            Workable&apos;s AI will figure out that you&apos;re qualified. The AI
            is not a mind reader — it scores based on what is on the page
            versus what the posting asks for. Vague bullets like &quot;improved
            team velocity&quot; score lower than concrete ones like &quot;increased
            deployment frequency by 3x using GitHub Actions.&quot;
          </p>
          <p className="mt-4">
            Another common miss: leaving the Skills section thin. Workable
            uses the Skills section as a primary keyword source. A resume
            with rich experience bullets but no Skills section often ranks
            lower than one with both.
          </p>
        </section>

        <GuideCta
          title="See your Workable match score before you apply"
          description="GetDreamRole scores your resume the same way Workable does and rewrites bullets to lift your rank."
          href="/optimize?ats=workable"
          label="Run the Workable optimizer"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A Workable checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Match the posting&apos;s job title in your summary or most recent role.</li>
            <li>Copy the required skills list into your own Skills section.</li>
            <li>Rewrite at least your top 3 bullets with scope, tools, and measurable impact.</li>
            <li>Include years-of-experience phrasing for core skills.</li>
            <li>Run the optimizer with Workable selected before you submit.</li>
          </ol>
          <p className="mt-4">
            Comparing Workable to competitor systems?{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse
            </Link>{" "}
            and{" "}
            <Link href="/blog/optimize-resume-lever-ats" className="text-forge-text underline underline-offset-2">
              Lever
            </Link>{" "}
            are the closest peers in terms of parser quality.
          </p>
        </section>

        <GuideCta
          title="Apply with a Workable-ready resume"
          description="Your resume, calibrated for Workable's AI score. Under 30 seconds."
          href="/optimize?ats=workable"
          label="Start optimizing"
        />
      </GuideArticleShell>
    </>
  );
}
