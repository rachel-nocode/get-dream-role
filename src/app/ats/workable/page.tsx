import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for Workable ATS",
  description:
    "Workable powers hiring at 30,000+ small and mid-sized companies. Learn how its AI Recruiter scoring works and how to rank in the top results before you apply.",
  path: "/ats/workable",
  keywords: [
    "optimize resume for workable",
    "workable ats resume",
    "workable resume tips",
    "workable ai recruiter",
    "workable ats guide",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for Workable ATS",
  description:
    "A practical guide for job seekers applying through Workable's AI-scored ATS.",
  path: "/ats/workable",
  keywords: [
    "optimize resume for workable",
    "workable ats resume",
    "workable resume tips",
  ],
});

export default function WorkableLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        eyebrow="Workable ATS"
        headlineLines={["Rank in", "Workable."]}
        intro="Workable runs the hiring pipeline at more than 30,000 companies worldwide. Its AI Recruiter scores every candidate 1–5 stars against the job description — low-scored resumes rarely get a human review. GetDreamRole calibrates your resume to that scoring."
        ctaLabel="Optimize for Workable"
        secondaryCtaLabel="Optimize my resume for Workable"
        ctaHref="/optimize?ats=workable"
        facts={[
          {
            label: "Parse quality",
            value: "Modern",
            note: "Handles single-column PDFs reliably. Two-column layouts sometimes work but fail unpredictably — not worth the risk.",
          },
          {
            label: "Keyword matching",
            value: "AI scoring + exact match",
            note: "Workable's AI Recruiter scores relevance, but still weights exact-match skill terms heavily. Use the posting's language verbatim.",
          },
          {
            label: "Who reviews",
            value: "SMB recruiter or founder",
            note: "Small teams who lean on the star rating. Top of the pipeline gets the attention; anything below 3 stars usually gets skipped.",
          },
          {
            label: "Prevalent in",
            value: "SMB, tech, services, hospitality",
            note: "Common at 10–500 person companies across industries globally.",
          },
        ]}
        mistakesTitle="What drops your Workable star rating"
        mistakes={[
          "Generic resume that doesn't mirror the posting's job title and required skills.",
          "Thin Skills section. Workable uses it as a primary keyword source.",
          "Vague bullets like 'improved velocity' instead of concrete scope, tools, and metrics.",
          "Missing years-of-experience phrasing that aligns with what the posting asks for.",
          "Out-of-date most-recent role. Workable heavily weights recent relevance.",
        ]}
        benefitsTitle="What GetDreamRole does for Workable applications"
        benefits={[
          "Scores your resume the same way Workable's AI Recruiter does",
          "Surfaces the exact-match skill terms to lift your star rating",
          "Rewrites bullets to include scope, tools, and measurable impact",
          "Builds a Skills section calibrated for Workable's keyword weighting",
          "Pushes you into the optimizer with Workable selected",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-workable-ats",
            label: "Full Workable optimization guide",
          },
          { href: "/blog/optimize-resume-greenhouse-ats", label: "Greenhouse guide" },
          { href: "/blog/optimize-resume-lever-ats", label: "Lever guide" },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
