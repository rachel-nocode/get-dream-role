import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for Taleo ATS",
  description:
    "Taleo is an older ATS with rigid parsing and old-school keyword matching. Learn how to simplify your resume and choose wording that has a better chance of surviving Taleo.",
  path: "/ats/taleo",
  keywords: [
    "taleo resume guide",
    "optimize resume for taleo",
    "taleo ats resume",
    "taleo resume format",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for Taleo ATS",
  description:
    "A plain-English guide for job seekers applying through Taleo and other older ATS systems with rigid parsing rules.",
  path: "/ats/taleo",
  keywords: [
    "taleo resume guide",
    "optimize resume for taleo",
    "taleo ats resume",
  ],
});

export default function TaleoLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        path="/ats/taleo"
        eyebrow="Taleo ATS"
        headlineLines={["Make your resume", "survive Taleo."]}
        intro="Taleo is still used by large enterprises, government-adjacent employers, and organizations running older recruiting workflows. GetDreamRole helps you simplify your resume and match the exact phrasing Taleo is more likely to reward."
        ctaLabel="Optimize for Taleo"
        secondaryCtaLabel="Optimize my resume for Taleo"
        ctaHref="/optimize?ats=taleo"
        facts={[
          {
            label: "Parse quality",
            value: "Rigid",
            note: "Taleo is much less forgiving than modern ATS tools and tends to break on decorative formatting.",
          },
          {
            label: "Keyword matching",
            value: "Boolean-heavy",
            note: "Older Taleo flows often lean on exact matches and recruiter search rather than nuanced understanding.",
          },
          {
            label: "Who reviews",
            value: "Recruiters first",
            note: "Taleo often filters candidates heavily before the hiring manager sees the application.",
          },
          {
            label: "Prevalent in",
            value: "Large legacy organizations",
            note: "Common in companies with older Oracle-based recruiting systems and slower hiring workflows.",
          },
        ]}
        mistakesTitle="What breaks resumes in Taleo"
        mistakes={[
          "Using design-heavy templates instead of a simple, one-column document.",
          "Skipping exact job-description language in favor of paraphrases that Taleo may not connect.",
          "Hiding critical skills inside long paragraphs instead of using standard sections and clear bullet points.",
          "Trusting export settings from resume builders that create complicated PDFs.",
          "Applying with one generic resume across multiple roles instead of tailoring to each posting.",
        ]}
        benefitsTitle="What GetDreamRole does for Taleo applications"
        benefits={[
          "Simplifies your wording and layout for an older ATS environment",
          "Surfaces exact-match phrases worth adding from the job posting",
          "Rewrites bullets so the important skills are easier for recruiter search to find",
          "Reduces the risk of formatting-related parsing errors before submission",
          "Starts the optimizer in Taleo mode so the rewrite logic stays conservative and ATS-safe",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-taleo-ats",
            label: "Full Taleo optimization guide",
          },
          {
            href: "/blog/why-qualified-candidates-get-rejected-by-ats",
            label: "Why qualified candidates get rejected by ATS",
          },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
