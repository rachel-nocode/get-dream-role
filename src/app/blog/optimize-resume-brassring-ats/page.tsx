import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-brassring-ats")!;

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

export default function BrassRingAtsPost() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          BrassRing — now part of Infinite Talent (formerly IBM Kenexa) — is
          one of the oldest and most rigid applicant tracking systems still in
          wide use. If the company is a Fortune 500, a federal contractor, or
          a large hospital system, there is a good chance your resume is
          flowing through BrassRing.
        </p>
        <p>
          The parser is strict, the keyword matching is literal, and the
          recruiter workflow relies heavily on boolean searches. A resume
          that ranks well on Greenhouse can rank poorly on BrassRing for
          reasons that have nothing to do with your experience.
        </p>

        <GuideCta
          title="Tailor for BrassRing before you submit"
          description="Paste the job description, select BrassRing, and let GetDreamRole find the exact-match keywords the recruiter will search for."
          href="/optimize?ats=brassring"
          label="Optimize my resume for BrassRing"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What BrassRing does differently
          </h2>
          <p>
            BrassRing indexes every resume into a searchable database. When a
            recruiter is filling a requisition, they run boolean searches:
            <code className="mx-1 rounded bg-forge-elevated px-1.5 py-0.5 text-xs text-forge-text">
              (Python AND SQL) NOT junior
            </code>
            for example. If your resume uses a synonym the recruiter did not
            search for, you do not appear in the result set — no matter how
            qualified you are.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Use the exact job title from the posting, not a creative variant.",
              "Include both the acronym and the full term (e.g., \"SQL (Structured Query Language)\") so both searches match.",
              "Put must-have skills in a dedicated Skills section and repeat them in bullets where you used them.",
              "Avoid columns, text boxes, and icons. BrassRing's parser drops content it cannot place cleanly.",
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
            Formatting rules that actually matter
          </h2>
          <p>
            BrassRing is one of the few systems where formatting alone can
            sink a strong resume. A candidate with the right skills and a
            two-column template often scores lower than a weaker candidate
            with a plain layout. The parser simply cannot read the sidebar
            content correctly.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2">
            <li>Single-column layout. No sidebars, no tables.</li>
            <li>Standard section headings: Work Experience, Skills, Education.</li>
            <li>Contact info in body text, never in the header or footer.</li>
            <li>Dates in consistent <code className="rounded bg-forge-elevated px-1 text-xs">Mon YYYY</code> format.</li>
            <li>.docx or text-selectable PDF. Never a scanned image.</li>
          </ol>
          <p className="mt-4">
            If you need a broader formatting reset before tuning for
            BrassRing, the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>{" "}
            covers the fundamentals.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            Keyword strategy for boolean search
          </h2>
          <p>
            Most BrassRing-using recruiters are not reading your resume
            holistically. They are searching for specific terms and reviewing
            the candidates who matched. Your job is to make sure you match on
            every term they might search.
          </p>
          <p className="mt-4">
            Pull required skills and tools directly from the job posting.
            Include them verbatim, not as paraphrases. If the posting says
            &quot;Epic EHR,&quot; write &quot;Epic EHR&quot; — not &quot;Epic electronic health
            records system.&quot;
          </p>
        </section>

        <GuideCta
          title="Find every missing keyword"
          description="GetDreamRole compares your resume to the job description and surfaces the exact terms BrassRing recruiters search for."
          href="/optimize?ats=brassring"
          label="Run the BrassRing optimizer"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A BrassRing checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Strip any two-column or sidebar layout.</li>
            <li>Match the job title exactly, or include it in your summary.</li>
            <li>Write a Skills section with every must-have term from the posting.</li>
            <li>Repeat those skills in your bullets with context and impact.</li>
            <li>Run the finished resume through the optimizer with BrassRing selected.</li>
          </ol>
          <p className="mt-4">
            For companies that run Taleo alongside BrassRing, the{" "}
            <Link href="/blog/optimize-resume-taleo-ats" className="text-forge-text underline underline-offset-2">
              Taleo guide
            </Link>{" "}
            covers overlapping formatting rules.
          </p>
        </section>

        <GuideCta
          title="Submit a BrassRing-ready resume"
          description="One tool, every major ATS. Start with BrassRing selected."
          href="/optimize?ats=brassring"
          label="Start optimizing"
        />
      </GuideArticleShell>
    </>
  );
}
