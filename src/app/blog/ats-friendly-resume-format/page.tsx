import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("ats-friendly-resume-format")!;

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

export default function AtsFriendlyFormatPage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Most advice about ATS resume format is too general to help. “Keep it
          simple” sounds right, but job seekers still need to know what that
          means in practice. A true ats-friendly resume format is not ugly. It
          is just structured in a way parsers can understand and recruiters can
          scan quickly.
        </p>
        <p>
          The safest format works across systems like{" "}
          <Link href="/ats/greenhouse" className="text-forge-text underline underline-offset-2">
            Greenhouse
          </Link>
          ,{" "}
          <Link href="/ats/workday" className="text-forge-text underline underline-offset-2">
            Workday
          </Link>
          , and{" "}
          <Link href="/ats/taleo" className="text-forge-text underline underline-offset-2">
            Taleo
          </Link>
          , even though those systems vary a lot in how forgiving they are.
        </p>

        <GuideCta
          title="Check whether your current resume format is costing you"
          description="Run the resume through the optimizer and see where layout, wording, and structure create ATS risk."
          href="/optimize"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The layout that usually parses best
          </h2>
          <ul className="space-y-3">
            {[
              "One column, top to bottom",
              "Plain text contact information near the top",
              "Standard headings like Summary, Work Experience, Skills, Education",
              "Simple bullet lists instead of tables, icons, graphics, or skill bars",
              "Consistent month-year date formats",
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
            The formatting choices that quietly hurt
          </h2>
          <p>
            The biggest troublemakers are sidebars, text boxes, tables, icons,
            and anything that relies on visual placement instead of text order.
            They may look polished to a human, but some ATS tools flatten them
            into nonsense. Workday and Taleo are especially unforgiving, which
            is why the{" "}
            <Link href="/blog/optimize-resume-workday-ats" className="text-forge-text underline underline-offset-2">
              Workday guide
            </Link>{" "}
            is a useful next step if you suspect formatting is the real issue.
          </p>
        </section>

        <GuideCta
          title="Turn the current resume into an ATS-safe one"
          description="Use the product flow to spot risky formatting and reinforce the right keywords before you apply."
          href="/optimize"
          label="Build my ATS-safe resume"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A cleaner format still needs better content
          </h2>
          <p>
            Resume format is the foundation, not the whole strategy. Once the
            document is easy to parse, you still need stronger matching against
            the job description. That is where ATS-specific pages like the{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/optimize-resume-icims-ats" className="text-forge-text underline underline-offset-2">
              iCIMS guide
            </Link>{" "}
            help.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2">
            <li>Fix the structure.</li>
            <li>Match the language of the target role.</li>
            <li>Rewrite weak bullets with real evidence and impact.</li>
            <li>Apply with the tailored version, not the generic one.</li>
          </ol>
        </section>

        <GuideCta
          title="Use the ATS-safe version for the next application"
          description="A simpler resume format plus targeted rewrites is a much stronger combination than format cleanup alone."
          href="/optimize"
          label="Start optimizing my resume"
        />
      </GuideArticleShell>
    </>
  );
}
