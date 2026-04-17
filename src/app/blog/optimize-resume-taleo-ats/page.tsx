import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-taleo-ats")!;

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

export default function TaleoGuidePage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Taleo is older than the ATS platforms most job seekers talk about, and
          it behaves like it. A resume that looks polished in a design tool can
          still fail badly in Taleo because the parser is rigid and recruiter
          search often leans on exact phrases.
        </p>
        <p>
          If you are applying through Taleo, simpler is better. Think single
          column, standard headings, clear dates, and direct language. The{" "}
          <Link href="/ats/taleo" className="text-forge-text underline underline-offset-2">
            Taleo ATS page
          </Link>{" "}
          covers the shorter version if you want the quick overview first.
        </p>

        <GuideCta
          title="Start with the ATS-safe version"
          description="Choose Taleo in the optimizer to get conservative, ATS-friendly rewrites for an older recruiting system."
          href="/optimize?ats=taleo"
          label="Optimize my resume for Taleo"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What Taleo rewards
          </h2>
          <ul className="space-y-3">
            {[
              "Exact language from the job description where it honestly fits",
              "Simple formatting with no visual extras",
              "Clear repetition of critical tools and qualifications",
              "Standard headings and straightforward wording recruiters can scan quickly",
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
            What Taleo does badly
          </h2>
          <p>
            Taleo is not good at interpreting creative formatting or subtle
            paraphrasing. It is much safer to be direct. If the job asks for
            vendor management, stakeholder communication, and budgeting, those
            phrases should appear in the resume where true. If your resume needs
            a full layout reset, use the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>{" "}
            before tailoring the language.
          </p>
        </section>

        <GuideCta
          title="Check exact-match phrases before applying"
          description="GetDreamRole helps you line up your real experience with the terms Taleo is more likely to reward."
          href="/optimize?ats=taleo"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A Taleo checklist that keeps things simple
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Use a one-column PDF with no tables or icons.</li>
            <li>Match the exact job-description wording where honest.</li>
            <li>Keep dates and titles standard and easy to parse.</li>
            <li>Put important qualifications in a visible Skills section.</li>
            <li>Rewrite weak bullets so the core responsibilities are obvious.</li>
          </ol>
          <p className="mt-4">
            If you are also seeing silent rejection across platforms, read{" "}
            <Link href="/blog/why-qualified-candidates-get-rejected-by-ats" className="text-forge-text underline underline-offset-2">
              why qualified candidates still get rejected by ATS
            </Link>{" "}
            to spot the failure points faster.
          </p>
        </section>

        <GuideCta
          title="Submit the simpler, stronger version"
          description="Use the optimizer to clean up the resume before Taleo turns a formatting issue into a rejection."
          href="/optimize?ats=taleo"
          label="Start optimizing for Taleo"
        />
      </GuideArticleShell>
    </>
  );
}
