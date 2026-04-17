import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("ats-resume-optimizer-guide")!;

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

export default function AtsOptimizerGuidePost() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          An ATS resume optimizer helps you compare your resume against a real
          job description before you apply. That matters because most hiring
          pipelines do not start with a human reading your PDF. They start with
          software parsing it, matching it, and deciding whether it looks strong
          enough to surface to recruiting.
        </p>
        <p>
          The useful question is not “does ATS exist?” It is “what kind of
          optimizer gives me a better shot at this specific application?” The
          answer is usually a tool that combines keyword matching, formatting
          checks, and ATS-specific guidance for systems like{" "}
          <Link href="/ats/greenhouse" className="text-forge-text underline underline-offset-2">
            Greenhouse
          </Link>
          ,{" "}
          <Link href="/ats/workday" className="text-forge-text underline underline-offset-2">
            Workday
          </Link>
          , and{" "}
          <Link href="/ats/lever" className="text-forge-text underline underline-offset-2">
            Lever
          </Link>
          .
        </p>

        <GuideCta
          title="Try an optimizer on a real job description"
          description="Upload the resume you already have, paste the job description, and get ATS-specific rewrite suggestions instead of vague advice."
          href="/optimize"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What a good ATS optimizer actually checks
          </h2>
          <ul className="space-y-3">
            {[
              "Whether your resume can be parsed cleanly by the target ATS",
              "Which required skills or phrases are missing from the resume",
              "Whether your experience bullets prove those skills clearly enough",
              "How well the structure, dates, and section names support recruiter search",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-forge-accent">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            A weak optimizer only counts keywords. A better one helps you fix
            the actual document. A strong one knows that a Workday resume needs
            different handling than a Lever resume.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What separates a useful tool from a generic AI rewrite
          </h2>
          <p>
            General-purpose AI tools can make your bullets sound smoother, but
            they usually do not know whether the company is using a strict ATS
            parser or a more flexible one. That is why platform-specific guides
            like the{" "}
            <Link href="/blog/optimize-resume-workday-ats" className="text-forge-text underline underline-offset-2">
              Workday ATS guide
            </Link>{" "}
            and the{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse ATS guide
            </Link>{" "}
            matter. The same resume can perform differently in each system.
          </p>
        </section>

        <GuideCta
          title="Get ATS-specific rewrite help instead of guesswork"
          description="Choose the target ATS, then let GetDreamRole rewrite low-signal bullets with the right keywords and cleaner structure."
          href="/optimize"
          label="Start optimizing for ATS"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            When to use an optimizer
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>When you already have a target role and job description.</li>
            <li>When your resume is broadly good but not tailored enough.</li>
            <li>When you keep getting no response from ATS-heavy companies.</li>
            <li>When you need a quick rewrite without losing your real experience.</li>
          </ol>
          <p className="mt-4">
            If your main concern is resume layout, pair this guide with the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>
            . If the problem is silent rejection, read{" "}
            <Link href="/blog/why-qualified-candidates-get-rejected-by-ats" className="text-forge-text underline underline-offset-2">
              why qualified candidates still get rejected by ATS
            </Link>
            .
          </p>
        </section>

        <GuideCta
          title="Turn the next application into a tailored one"
          description="Instead of guessing which keywords matter, run the resume against the posting and apply with a stronger version."
          href="/optimize"
          label="Optimize my resume for this job"
        />
      </GuideArticleShell>
    </>
  );
}
