import type { Metadata } from "next";
import Link from "next/link";
import GuideArticleShell from "@/components/blog/GuideArticleShell";
import GuideCta from "@/components/blog/GuideCta";
import StructuredData from "@/components/seo/StructuredData";
import { getBlogPost } from "@/lib/blog-posts";
import { buildBlogPostingSchema, buildMetadata } from "@/lib/seo";

const post = getBlogPost("why-qualified-candidates-get-rejected-by-ats")!;

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

export default function RejectedByAtsPage() {
  return (
    <>
      <StructuredData data={schema} />
      <GuideArticleShell post={post} eyebrow={post.category}>
        <p>
          Many qualified candidates do get rejected by ATS before a recruiter
          reads their resume. Usually that does not happen because the person is
          unqualified. It happens because the resume was hard to parse, weakly
          matched, or too generic for the role.
        </p>
        <p>
          The important takeaway is this: ATS rejection is often a resume
          packaging problem, not a talent problem. That is why job seekers who
          are clearly capable can still hear nothing back until they fix the way
          their experience is being presented.
        </p>

        <GuideCta
          title="Check the resume before the ATS checks you"
          description="Run the current version against a real job description and see the gaps before you submit another application."
          href="/optimize"
          label="Optimize my resume now"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            The three main failure points
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              <strong className="text-forge-text">Parsing failure:</strong> the
              ATS could not read the document cleanly.
            </li>
            <li>
              <strong className="text-forge-text">Matching failure:</strong> the
              key skills or role language were missing or underrepresented.
            </li>
            <li>
              <strong className="text-forge-text">Signal failure:</strong> the
              resume mentioned the right ideas but the bullets were too weak or
              too vague to stand out.
            </li>
          </ol>
          <p className="mt-4">
            The{" "}
            <Link href="/blog/ats-friendly-resume-format" className="text-forge-text underline underline-offset-2">
              ATS-friendly resume format guide
            </Link>{" "}
            helps with the first problem. ATS-specific guides like the{" "}
            <Link href="/blog/optimize-resume-workday-ats" className="text-forge-text underline underline-offset-2">
              Workday guide
            </Link>{" "}
            help with the second and third.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            Why generic resumes keep losing
          </h2>
          <p>
            A generic resume might be “good enough” for your background, but it
            is rarely good enough for a specific posting. ATS systems reward
            alignment. Recruiters reward clarity. A generic version tends to
            miss both. That is why tailoring one role at a time is so much more
            effective than endlessly polishing a master resume.
          </p>
        </section>

        <GuideCta
          title="Turn a generic resume into a tailored one"
          description="Use the optimizer to match the role language, strengthen weak bullets, and reduce ATS blind spots."
          href="/optimize"
          label="Build my tailored resume"
        />

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-forge-text">
            What to do next if this sounds familiar
          </h2>
          <ul className="space-y-3">
            {[
              "Simplify the format so the ATS can read it cleanly.",
              "Pick the right ATS guide if you know which system the company uses.",
              "Match the language of the target role instead of sending a generic version.",
              "Rewrite low-signal bullets so the evidence is easier to see.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-forge-accent">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            If you know the employer uses Greenhouse, Lever, Workday, iCIMS, or
            Taleo, head to the matching guide from the{" "}
            <Link href="/ats" className="text-forge-text underline underline-offset-2">
              ATS platform hub
            </Link>
            .
          </p>
        </section>

        <GuideCta
          title="Give the next application a better chance"
          description="A clearer, better-matched resume can fix silent rejection faster than another round of random edits."
          href="/optimize"
          label="Start optimizing my resume"
        />
      </GuideArticleShell>
    </>
  );
}
