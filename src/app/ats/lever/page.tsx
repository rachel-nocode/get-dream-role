import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for Lever ATS",
  description:
    "Learn how Lever scores resumes, what collaborative hiring teams look for, and how to optimize your resume for Lever's semantic matching.",
  path: "/ats/lever",
  keywords: [
    "lever ats resume",
    "optimize resume for lever",
    "lever resume tips",
    "lever ats guide",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for Lever ATS",
  description:
    "A practical guide for tailoring resumes to Lever's semantic matching and hiring-team review flow.",
  path: "/ats/lever",
  keywords: [
    "lever ats resume",
    "optimize resume for lever",
    "lever resume tips",
  ],
});

export default function LeverLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        path="/ats/lever"
        eyebrow="Lever ATS"
        headlineLines={["Stand out", "in Lever."]}
        intro="Lever is built for collaborative hiring, which means engineers, PMs, and recruiters may all scan the same resume. GetDreamRole helps you write for Lever's context-aware matching and team-based review."
        ctaLabel="Optimize for Lever"
        secondaryCtaLabel="Optimize my resume for Lever"
        ctaHref="/optimize?ats=lever"
        facts={[
          {
            label: "Parse quality",
            value: "Good",
            note: "Similar to Greenhouse. Standard single-column PDFs parse well and modern layouts fare better than in older ATS tools.",
          },
          {
            label: "Keyword matching",
            value: "Context-aware",
            note: "Lever understands meaning and phrasing, not just exact keyword repetition.",
          },
          {
            label: "Who reviews",
            value: "Full hiring team",
            note: "Hiring managers and teammates often review candidates directly inside Lever.",
          },
          {
            label: "Prevalent in",
            value: "Growth-stage tech",
            note: "Lever is common at product-led startups and growing software companies.",
          },
        ]}
        mistakesTitle="What costs candidates interviews in Lever"
        mistakes={[
          "Generic bullets with weak technical detail. Lever rewards context, not vague statements like 'built features'.",
          "A weak summary section that fails to frame your background for the hiring team.",
          "Burying core skills so they are hard for both recruiters and engineers to scan quickly.",
          "Leaving out metrics and impact when applying to growth-stage companies that care about business outcomes.",
          "Sending the same resume everywhere instead of matching the language of the role you want.",
        ]}
        benefitsTitle="What GetDreamRole does for Lever applications"
        benefits={[
          "Rewrites bullets with stronger technical and business context",
          "Surfaces missing technologies and phrases from the job description",
          "Strengthens the top of the resume so hiring teams frame your background correctly",
          "Keeps the content readable for humans while still improving ATS relevance",
          "Pushes you into the optimizer with Lever preselected so the rewrite flow matches the target ATS",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-lever-ats",
            label: "Full Lever optimization guide",
          },
          {
            href: "/blog/optimize-resume-greenhouse-ats",
            label: "Greenhouse optimization guide",
          },
          { href: "/ats", label: "All ATS platforms" },
        ]}
      />
    </>
  );
}
