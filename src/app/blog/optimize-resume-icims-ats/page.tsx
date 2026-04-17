import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-icims-ats")!;

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

export default function ICimsGuidePage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          iCIMS is a common ATS in enterprise recruiting, healthcare, education,
          and other organizations that process a lot of applicants. That usually
          means recruiter search and structured fields matter a lot. If your
          resume is messy or too generic, iCIMS makes it easy to disappear.
        </p>
        <p>
          A strong iCIMS resume guide starts with structure: standard headings,
          readable dates, a clear skills section, and bullets that make the key
          tools easy to find. For the short version, the{" "}
          <Link href="/ats/icims" className="text-forge-text underline underline-offset-2">
            iCIMS ATS page
          </Link>{" "}
          is a good place to start.
        </p>

        <GuideCta
          title="Tailor the resume for iCIMS first"
          description="Choose iCIMS in the optimizer to surface missing keywords, weak bullets, and ATS-unsafe structure before you apply."
          href="/optimize?ats=icims"
          label="Optimize my resume for iCIMS"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What helps in iCIMS
          </h2>
          <ul className="space-y-3">
            {[
              "Standard section names recruiters can search and scan quickly",
              "Clear repetition of core tools, certifications, and domain knowledge",
              "Bullets that explain experience in context instead of just listing tasks",
              "A summary that lines up with the role level and industry language",
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
            What usually hurts candidates
          </h2>
          <p>
            The biggest issue is not dramatic parser failure. It is lower
            visibility. If your resume does not repeat the right tools, business
            terms, or certifications in the right places, you can still be
            buried under stronger keyword matches. That is especially true in
            high-volume roles where recruiter search is the real gate.
          </p>
          <p className="mt-4">
            If you are also unsure about the layout, fix that with the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>
            .
          </p>
        </section>

        <GuideCta
          title="Strengthen the recruiter-search version"
          description="Use the optimizer to reinforce the most important skills and make the resume easier for iCIMS recruiters to find."
          href="/optimize?ats=icims"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A simple iCIMS checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Use clear section names and clean dates.</li>
            <li>Put certifications and tools in obvious places.</li>
            <li>Match the language of the target role and industry.</li>
            <li>Rewrite generic bullets with context and outcomes.</li>
            <li>Check the final version against the posting before submitting.</li>
          </ol>
          <p className="mt-4">
            If the employer uses an older ATS, compare this with the{" "}
            <Link href="/blog/optimize-resume-taleo-ats" className="text-forge-text underline underline-offset-2">
              Taleo guide
            </Link>{" "}
            to see how much more conservative the resume needs to become.
          </p>
        </section>

        <GuideCta
          title="Apply with an iCIMS-ready resume"
          description="Use a cleaner, better-matched version of your resume instead of sending the generic one again."
          href="/optimize?ats=icims"
          label="Start optimizing for iCIMS"
        />
      </GuideArticleShell>
    </>
  );
}
