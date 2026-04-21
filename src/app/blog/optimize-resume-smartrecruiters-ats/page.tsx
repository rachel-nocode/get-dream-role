import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-smartrecruiters-ats")!;

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

export default function SmartRecruitersAtsPost() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          SmartRecruiters powers hiring at Bosch, IKEA, Visa, LinkedIn, Atos,
          and hundreds of other global employers. If the application URL
          includes{" "}
          <code className="mx-1 rounded bg-forge-elevated px-1.5 py-0.5 text-xs text-forge-text">
            jobs.smartrecruiters.com
          </code>
          , your resume is flowing through its parser and matching engine.
        </p>
        <p>
          SmartRecruiters is a modern, enterprise-grade ATS. Parser quality
          is strong. Its matching engine uses both keyword density and
          contextual AI scoring. Recruiters at SmartRecruiters customers are
          usually high-volume and lean heavily on the platform&apos;s
          ranking.
        </p>

        <GuideCta
          title="Optimize for SmartRecruiters"
          description="Paste the job description, select SmartRecruiters, and get a resume tuned for its hybrid matching engine."
          href="/optimize?ats=smartrecruiters"
          label="Optimize for SmartRecruiters"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            How SmartRecruiters scores you
          </h2>
          <p>
            SmartRecruiters ranks candidates on a combination of keyword
            match, experience relevance, and posting-specific screening
            questions. The platform exposes this as a match percentage to
            recruiters, and many use it as a first filter before any human
            review.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Answer the pre-screening questions honestly — they weight heavily in the match score.",
              "Include the posting's must-have skills and certifications verbatim in your Skills section.",
              "Use internationally recognized skill names (e.g., \"SAP ERP\" not \"SAP system\") — SmartRecruiters serves global employers.",
              "Keep the resume length to 1–2 pages. Enterprise recruiters skim; SmartRecruiters does not reward length.",
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
            Formatting for a global parser
          </h2>
          <p>
            Because SmartRecruiters serves global employers in dozens of
            languages and regions, its parser is more lenient than legacy US
            systems. Still, the safe path is the same: single column, clean
            headings, standard fonts.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2">
            <li>Single column. No icons, no photos (standard in US; a photo is common in Europe but may confuse the parser).</li>
            <li>Standard section headings in English, even on international applications.</li>
            <li>Dates in <code className="rounded bg-forge-elevated px-1 text-xs">Mon YYYY</code> format.</li>
            <li>PDF with selectable text. File size under 5MB.</li>
            <li>Skills section with both acronyms and full terms.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            SmartRecruiters mistakes that kill your rank
          </h2>
          <p>
            Recruiters running SmartRecruiters typically see hundreds of
            applicants per requisition. The platform ranks them by match
            score, and anyone below the visible top 20% often never gets a
            human review. Small wording choices matter.
          </p>
          <p className="mt-4">
            The most common misses: (1) skipping the pre-screening questions
            or answering them vaguely, (2) leaving out certifications the
            posting required, and (3) using region-specific job titles that
            do not match the posting&apos;s language.
          </p>
        </section>

        <GuideCta
          title="Rank in the SmartRecruiters top 20%"
          description="GetDreamRole surfaces the keywords and certifications SmartRecruiters weights highest — and rewrites bullets so you match them naturally."
          href="/optimize?ats=smartrecruiters"
          label="Run the SmartRecruiters optimizer"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A SmartRecruiters checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Mirror the posting&apos;s job title in your summary.</li>
            <li>Include required certifications in a dedicated section, verbatim.</li>
            <li>Use the posting&apos;s skill names exactly — no synonyms.</li>
            <li>Answer every screening question. Skipping them tanks the score.</li>
            <li>Optimize with SmartRecruiters selected before submitting.</li>
          </ol>
          <p className="mt-4">
            If you are also applying to companies on{" "}
            <Link href="/blog/optimize-resume-workable-ats" className="text-forge-text underline underline-offset-2">
              Workable
            </Link>{" "}
            or{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse
            </Link>
            , the same keyword-first approach applies with minor tweaks.
          </p>
        </section>

        <GuideCta
          title="Submit a SmartRecruiters-ready resume"
          description="Calibrated for match-score ranking. Under 30 seconds."
          href="/optimize?ats=smartrecruiters"
          label="Start optimizing"
        />
      </GuideArticleShell>
    </>
  );
}
