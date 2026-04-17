import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for iCIMS ATS",
  description:
    "iCIMS is common in enterprise and high-volume hiring teams. Learn how to structure your resume for clean parsing, stronger keyword coverage, and more recruiter visibility in iCIMS.",
  path: "/ats/icims",
  keywords: [
    "icims resume guide",
    "optimize resume for icims",
    "icims ats resume",
    "icims resume tips",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for iCIMS ATS",
  description:
    "A guide for job seekers who want a cleaner resume structure and better keyword coverage for iCIMS-powered applications.",
  path: "/ats/icims",
  keywords: [
    "icims resume guide",
    "optimize resume for icims",
    "icims ats resume",
  ],
});

export default function ICimsLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        eyebrow="iCIMS ATS"
        headlineLines={["Get more interviews", "through iCIMS."]}
        intro="iCIMS is widely used in enterprise, healthcare, education, and high-volume recruiting teams. GetDreamRole helps you structure your resume so iCIMS can parse it cleanly and match you to the right job criteria."
        ctaLabel="Optimize for iCIMS"
        secondaryCtaLabel="Optimize my resume for iCIMS"
        ctaHref="/optimize?ats=icims"
        facts={[
          {
            label: "Parse quality",
            value: "Moderate",
            note: "iCIMS handles plain PDFs well but gets unreliable when the resume uses columns, tables, or decorative layouts.",
          },
          {
            label: "Keyword matching",
            value: "Structured + semantic",
            note: "iCIMS often blends exact skills with broader contextual relevance, especially in large recruiting teams.",
          },
          {
            label: "Who reviews",
            value: "Recruiters at scale",
            note: "iCIMS is common where many applicants are being screened quickly and recruiter search matters a lot.",
          },
          {
            label: "Prevalent in",
            value: "Enterprise and healthcare",
            note: "Large employers with recurring hiring needs often run a big part of their recruiting funnel through iCIMS.",
          },
        ]}
        mistakesTitle="What trips candidates up in iCIMS"
        mistakes={[
          "Using custom section names that make work history and skills harder to map into structured recruiter search fields.",
          "Letting key tools or certifications appear only once instead of reinforcing them in a summary, skills section, and experience bullets.",
          "Using visual resume templates built for design, not parsing.",
          "Assuming a keyword percentage is enough instead of proving experience with the required tools in context.",
          "Skipping industry-specific phrases that enterprise recruiters actually filter by.",
        ]}
        benefitsTitle="What GetDreamRole does for iCIMS applications"
        benefits={[
          "Helps you clean up structure so iCIMS extracts the right fields",
          "Highlights missing job-description terms before you apply",
          "Rewrites experience bullets with clearer context and recruiter-friendly language",
          "Balances keyword coverage with readable, believable experience statements",
          "Preloads the optimizer with iCIMS so the rewrite flow matches a high-volume ATS environment",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-icims-ats",
            label: "Full iCIMS optimization guide",
          },
          {
            href: "/blog/ats-friendly-resume-format",
            label: "ATS-friendly resume format guide",
          },
          { href: "/ats", label: "All ATS platforms" },
        ]}
      />
    </>
  );
}
