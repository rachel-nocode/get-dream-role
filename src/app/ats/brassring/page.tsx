import type { Metadata } from "next";
import AtsLandingContent from "@/components/ats/AtsLandingContent";
import StructuredData from "@/components/seo/StructuredData";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for BrassRing ATS",
  description:
    "Learn how BrassRing (Infinite Talent, IBM Kenexa) parses resumes, how its boolean keyword search works, and how to format your resume so it ranks in recruiter searches.",
  path: "/ats/brassring",
  keywords: [
    "optimize resume for brassring",
    "brassring ats resume",
    "brassring resume tips",
    "kenexa resume guide",
    "ibm talent ats",
  ],
});

const schema = buildWebPageSchema({
  title: "Optimize Your Resume for BrassRing ATS",
  description:
    "A practical guide for job seekers applying through BrassRing, Infinite Talent, or IBM Kenexa.",
  path: "/ats/brassring",
  keywords: [
    "optimize resume for brassring",
    "brassring ats resume",
    "brassring resume tips",
  ],
});

export default function BrassRingLandingPage() {
  return (
    <>
      <StructuredData data={schema} />
      <AtsLandingContent
        eyebrow="BrassRing ATS"
        headlineLines={["Get past", "BrassRing."]}
        intro="BrassRing (Infinite Talent, formerly IBM Kenexa) is one of the oldest enterprise ATS systems still in wide use. Rigid parser, boolean keyword search, high-volume recruiter workflows. GetDreamRole matches your resume to how BrassRing ranks."
        ctaLabel="Optimize for BrassRing"
        secondaryCtaLabel="Optimize my resume for BrassRing"
        ctaHref="/optimize?ats=brassring"
        facts={[
          {
            label: "Parse quality",
            value: "Strict",
            note: "Two-column layouts, text boxes, and icons cause parsing failures. Single-column PDFs are the safe path.",
          },
          {
            label: "Keyword matching",
            value: "Boolean search",
            note: "Recruiters run boolean queries. Synonyms and paraphrased skills do not match. Use exact posting language.",
          },
          {
            label: "Who reviews",
            value: "Recruiting team",
            note: "High-volume recruiters reviewing top-N boolean search results. Human review happens after filtering.",
          },
          {
            label: "Prevalent in",
            value: "Fortune 500, healthcare, government",
            note: "Common at large hospital systems, federal contractors, and legacy Fortune 500 companies.",
          },
        ]}
        mistakesTitle="What gets resumes filtered out in BrassRing"
        mistakes={[
          "Two-column layouts, sidebars, and text boxes drop content silently during parsing.",
          "Using creative job titles instead of the posting's exact title — boolean searches miss you.",
          "Paraphrasing required skills (e.g., writing 'Python programming' when posting asks for 'Python').",
          "Contact info in headers or footers. BrassRing frequently misreads these regions.",
          "Scanned PDFs or image-based resumes. BrassRing cannot OCR reliably.",
        ]}
        benefitsTitle="What GetDreamRole does for BrassRing applications"
        benefits={[
          "Extracts boolean-searchable keywords from the job description verbatim",
          "Flags paraphrased skills and rewrites them to exact-match terms",
          "Catches formatting that BrassRing's parser commonly drops",
          "Builds a Skills section tuned for boolean search hit rates",
          "Pushes you into the optimizer with BrassRing selected",
        ]}
        relatedLinks={[
          {
            href: "/blog/optimize-resume-brassring-ats",
            label: "Full BrassRing optimization guide",
          },
          { href: "/blog/optimize-resume-taleo-ats", label: "Taleo guide" },
          { href: "/blog/optimize-resume-workday-ats", label: "Workday guide" },
          { href: "/ats", label: "Other ATS platforms" },
        ]}
      />
    </>
  );
}
