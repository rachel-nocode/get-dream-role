import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for Workday ATS",
  description:
    "Workday is one of the strictest ATS systems in the market. Learn how to format your resume, match exact wording, and avoid parsing mistakes that quietly filter you out.",
  path: "/ats/workday",
  keywords: [
    "workday ats resume",
    "how to pass workday",
    "workday resume format",
    "workday resume tips",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for Workday ATS",
  description:
    "A plain-English guide to getting resumes through Workday's rigid parser and keyword checks.",
  path: "/ats/workday",
  keywords: [
    "workday ats resume",
    "how to pass workday",
    "workday resume format",
  ],
});

export default function WorkdayLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        eyebrow="Workday ATS"
        headlineLines={["Crack", "Workday."]}
        intro="Workday is used by many enterprise employers and it is much less forgiving than modern ATS systems. GetDreamRole helps you rewrite and reformat your resume for Workday's exact parsing and keyword rules."
        ctaLabel="Optimize for Workday"
        secondaryCtaLabel="Optimize my resume for Workday"
        ctaHref="/optimize?ats=workday"
        facts={[
          {
            label: "Parse quality",
            value: "Strict",
            note: "Tables, columns, floating elements, and fancy formatting regularly cause data loss in Workday.",
          },
          {
            label: "Keyword matching",
            value: "Exact + density",
            note: "Many Workday setups still reward exact-string matches and repeated evidence of required skills.",
          },
          {
            label: "Who reviews",
            value: "HR + business unit",
            note: "Workday often enforces strict qualification gates before a hiring team member ever sees your resume.",
          },
          {
            label: "Prevalent in",
            value: "Enterprise and Fortune 500",
            note: "Banks, healthcare systems, manufacturers, and large software companies lean heavily on Workday.",
          },
        ]}
        mistakesTitle="Why resumes fail in Workday"
        mistakesIntro="Qualified candidates get screened out in Workday all the time because the parser never understood their resume in the first place."
        mistakes={[
          "Any multi-column layout can scramble content and mix titles, dates, and bullets together.",
          "Tables for skills or education often disappear or merge into nearby text.",
          "Only using abbreviations for required skills. Workday often prefers the exact language from the job description.",
          "Ignoring the manual application fields after upload. Those fields may still affect screening.",
          "Uploading PDFs with form fields, signatures, or protection that block clean parsing.",
        ]}
        benefitsTitle="What GetDreamRole does for Workday applications"
        benefits={[
          "Rewrites your resume into a simpler structure that Workday can parse more reliably",
          "Matches your content against the exact language in the job description",
          "Expands abbreviations so both short and long forms appear where needed",
          "Scores required and preferred qualifications before you submit",
          "Sends you straight into the optimizer with Workday selected so the rewrite logic starts from the strictest ATS case",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-workday-ats",
            label: "Full Workday optimization guide",
          },
          {
            href: "/blog/ats-friendly-resume-format",
            label: "ATS-friendly resume format guide",
          },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
