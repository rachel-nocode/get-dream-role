import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for Greenhouse ATS",
  description:
    "Learn how Greenhouse parses resumes, what recruiters search for, and how to optimize your resume so it survives Greenhouse filters and reaches a human review.",
  path: "/ats/greenhouse",
  keywords: [
    "optimize resume for greenhouse",
    "greenhouse ats resume",
    "greenhouse resume tips",
    "greenhouse ats guide",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for Greenhouse ATS",
  description:
    "A practical guide for job seekers who want to tailor resumes for Greenhouse-powered applications.",
  path: "/ats/greenhouse",
  keywords: [
    "optimize resume for greenhouse",
    "greenhouse ats resume",
    "greenhouse resume tips",
  ],
});

export default function GreenhouseLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        eyebrow="Greenhouse ATS"
        headlineLines={["Get past", "Greenhouse."]}
        intro="Greenhouse powers hiring at Airbnb, Dropbox, HubSpot, Notion, and thousands of tech companies. GetDreamRole optimizes your resume for how Greenhouse parses, scores, and ranks candidates."
        ctaLabel="Optimize for Greenhouse"
        secondaryCtaLabel="Optimize my resume for Greenhouse"
        ctaHref="/optimize?ats=greenhouse"
        facts={[
          {
            label: "Parse quality",
            value: "Good",
            note: "Handles standard single-column PDFs reliably. Two-column layouts are the main failure point.",
          },
          {
            label: "Keyword matching",
            value: "Scorecard-based",
            note: "Recruiters configure custom scorecards with weighted skills. Missing a required skill is often a hard filter.",
          },
          {
            label: "Who reviews",
            value: "Recruiter + hiring manager",
            note: "At many tech companies, an engineer or PM reviews candidates alongside recruiting.",
          },
          {
            label: "Prevalent in",
            value: "Tech and startups",
            note: "If the company is VC-backed, Greenhouse is often the ATS behind the application flow.",
          },
        ]}
        mistakesTitle="What gets resumes filtered out in Greenhouse"
        mistakes={[
          "Two-column or sidebar layouts often push skills and accomplishments into the wrong fields or drop them entirely.",
          "Contact details inside headers and text boxes are easy for Greenhouse to miss. Keep them in normal body text.",
          "Skills buried only inside experience bullets are harder for recruiters to search. Include a clear Skills section.",
          "Inconsistent dates like 'Jan '24' make work history harder to parse. Use a consistent month-year format.",
          "Treating Greenhouse like a generic ATS instead of matching the job description language line by line.",
        ]}
        benefitsTitle="What GetDreamRole does for Greenhouse applications"
        benefits={[
          "Scores your resume against the job description using Greenhouse-style keyword matching logic",
          "Finds missing required and preferred skills from the posting",
          "Rewrites bullets so the right keywords appear naturally instead of sounding stuffed",
          "Flags formatting choices that often confuse Greenhouse's parser",
          "Pushes you into the optimizer with Greenhouse selected so you start from the right ATS profile",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-greenhouse-ats",
            label: "Full Greenhouse optimization guide",
          },
          { href: "/blog/optimize-resume-lever-ats", label: "Lever ATS guide" },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
