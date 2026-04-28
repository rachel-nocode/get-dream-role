import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for SmartRecruiters ATS",
  description:
    "SmartRecruiters powers hiring at Bosch, IKEA, LinkedIn, Visa, and hundreds of global employers. Learn how its match-score ranking works and how to land in the top 20%.",
  path: "/ats/smartrecruiters",
  keywords: [
    "optimize resume for smartrecruiters",
    "smartrecruiters ats resume",
    "smartrecruiters resume tips",
    "smartrecruiters match score",
    "smartrecruiters ats guide",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for SmartRecruiters ATS",
  description:
    "A practical guide for job seekers applying through SmartRecruiters' enterprise ATS.",
  path: "/ats/smartrecruiters",
  keywords: [
    "optimize resume for smartrecruiters",
    "smartrecruiters ats resume",
    "smartrecruiters resume tips",
  ],
});

export default function SmartRecruitersLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        path="/ats/smartrecruiters"
        eyebrow="SmartRecruiters ATS"
        headlineLines={["Rank in", "SmartRecruiters."]}
        intro="SmartRecruiters powers hiring at Bosch, IKEA, Visa, LinkedIn, Atos, and hundreds of other global employers. Its hybrid engine combines keyword match with contextual AI scoring — and recruiters lean on the visible match percentage as a first filter."
        ctaLabel="Optimize for SmartRecruiters"
        secondaryCtaLabel="Optimize my resume for SmartRecruiters"
        ctaHref="/optimize?ats=smartrecruiters"
        facts={[
          {
            label: "Parse quality",
            value: "Strong",
            note: "Modern parser designed for global employers. Single column is still the safe path; photos work in EU but may confuse the parser.",
          },
          {
            label: "Keyword matching",
            value: "Hybrid AI + exact match",
            note: "Combines semantic scoring with exact keyword density. Use the posting's skill names verbatim and internationally recognized terms.",
          },
          {
            label: "Who reviews",
            value: "Global enterprise recruiter",
            note: "High-volume recruiters at Fortune 500s and multinationals. Anyone below the visible top 20% rarely gets human review.",
          },
          {
            label: "Prevalent in",
            value: "Global enterprise, EU, consumer brands",
            note: "Common at multinationals with operations in Europe, retail/consumer giants, and large B2B enterprises.",
          },
        ]}
        mistakesTitle="What tanks your SmartRecruiters match score"
        mistakes={[
          "Skipping the pre-screening questions or answering them vaguely — they weight heavily in the final score.",
          "Leaving out certifications the posting requires. SmartRecruiters treats these as hard filters.",
          "Region-specific job titles that don't match the posting's language.",
          "Paraphrasing skill names (e.g., 'SAP system' when the posting asks for 'SAP ERP').",
          "Resume longer than 2 pages. Enterprise recruiters skim; length does not get rewarded.",
        ]}
        benefitsTitle="What GetDreamRole does for SmartRecruiters applications"
        benefits={[
          "Extracts the exact skill names and certifications SmartRecruiters weights",
          "Flags region-specific titles and rewrites them to match the posting",
          "Builds a Skills section tuned for match-percentage ranking",
          "Catches formatting that weakens parse quality for global employers",
          "Pushes you into the optimizer with SmartRecruiters selected",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-smartrecruiters-ats",
            label: "Full SmartRecruiters optimization guide",
          },
          { href: "/blog/optimize-resume-workable-ats", label: "Workable guide" },
          { href: "/blog/optimize-resume-greenhouse-ats", label: "Greenhouse guide" },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
