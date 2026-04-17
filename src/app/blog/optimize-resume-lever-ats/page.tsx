import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("optimize-resume-lever-ats")!;

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

export default function LeverGuidePage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Lever sits in the middle of ATS and collaborative hiring software. It
          helps recruiting teams search, review, and move candidates together.
          That means your resume has to do two jobs: it has to match recruiter
          filters and it has to make sense to the hiring team members reading it
          later.
        </p>
        <p>
          A strong lever ats resume is specific, clear, and grounded in real
          results. If Greenhouse rewards clean keyword alignment, Lever rewards
          that plus stronger narrative context. The{" "}
          <Link href="/ats/lever" className="text-forge-text underline underline-offset-2">
            Lever ATS page
          </Link>{" "}
          is a good companion if you want the shorter version first.
        </p>

        <GuideCta
          title="Build the Lever version before you apply"
          description="Choose Lever in the optimizer to get rewrite suggestions built for semantic matching and hiring-team readability."
          href="/optimize?ats=lever"
          label="Optimize my resume for Lever"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What works well in Lever
          </h2>
          <ul className="space-y-3">
            {[
              "Bullets that explain what you built, with what tools, and with what outcome",
              "A summary that frames your role level and area of expertise quickly",
              "Clear technical keywords backed up by evidence in your experience section",
              "Readable language that works for both recruiters and teammates reviewing your profile",
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
            What weakens your match
          </h2>
          <p>
            Generic phrases like “collaborated cross-functionally” or “built
            features” do not give Lever much to work with. A better bullet says
            who you worked with, what system you touched, and what changed
            because of it. If the job description emphasizes analytics,
            experimentation, customer workflows, or stakeholder communication,
            your bullets should reflect that language with real examples.
          </p>
          <p className="mt-4">
            If your resume structure is still noisy, clean that up with the{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly format guide
            </Link>{" "}
            before optimizing the language.
          </p>
        </section>

        <GuideCta
          title="Turn vague bullets into higher-signal ones"
          description="GetDreamRole rewrites weak lines into clearer experience statements matched to the posting you care about."
          href="/optimize?ats=lever"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            A practical Lever checklist
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>Write a short summary matched to the role.</li>
            <li>Make core tools easy to spot.</li>
            <li>Rewrite generic bullets with scope, context, and outcome.</li>
            <li>Mirror the role language honestly, especially around collaboration.</li>
            <li>Keep the whole document readable for humans after the ATS pass.</li>
          </ol>
          <p className="mt-4">
            If the company uses Greenhouse instead, switch to the{" "}
            <Link href="/blog/optimize-resume-greenhouse-ats" className="text-forge-text underline underline-offset-2">
              Greenhouse guide
            </Link>{" "}
            so you tailor for the right system.
          </p>
        </section>

        <GuideCta
          title="Apply with the Lever-specific version"
          description="A targeted resume performs better than a generic one when a full hiring team is reading inside Lever."
          href="/optimize?ats=lever"
          label="Start optimizing for Lever"
        />
      </GuideArticleShell>
    </>
  );
}
