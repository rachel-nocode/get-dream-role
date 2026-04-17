import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ResultsPreview from "@/components/landing/ResultsPreview";
import Benefits from "@/components/landing/Benefits";
import FinalCTA from "@/components/landing/FinalCTA";
import GuideHighlights from "@/components/landing/GuideHighlights";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildMetadata,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Resume Optimizer for Greenhouse, Workday, Lever and More",
  description:
    "Optimize your resume for the ATS the company actually uses. GetDreamRole helps job seekers rewrite resumes for Greenhouse, Lever, Workday, iCIMS, Taleo, and more.",
  path: "/",
  keywords: [
    "ATS resume optimizer",
    "resume optimization tool",
    "Greenhouse resume tips",
    "Workday resume format",
    "resume ATS checker",
  ],
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What ATS platforms does GetDreamRole support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GetDreamRole is optimized for Greenhouse, Lever, Workday, iCIMS, Taleo, BambooHR, and 10+ other applicant tracking systems. Each platform parses resumes differently — GetDreamRole tailors rewrites to the specific ATS you choose.",
      },
    },
    {
      "@type": "Question",
      name: "How much does GetDreamRole cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GetDreamRole is a one-time payment of $9.99. There is no subscription, no recurring charges, and no limits on how many resumes you optimize.",
      },
    },
    {
      "@type": "Question",
      name: "How does the resume optimization work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your resume (PDF or paste text), paste the job description, and select the ATS platform. GetDreamRole's AI analyzes keyword gaps, scores your resume's ATS compatibility, and rewrites every bullet point to maximize your match rate.",
      },
    },
    {
      "@type": "Question",
      name: "Is my resume data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your resume is processed in memory and is not stored after analysis is complete. GetDreamRole does not sell or share your personal information.",
      },
    },
  ],
};

const homepageSchemas = [
  buildWebPageSchema({
    title: "GetDreamRole - AI Resume Optimizer for ATS",
    description:
      "Optimize your resume for the ATS the company actually uses, then turn job descriptions into cleaner, more targeted resume bullets.",
    path: "/",
    keywords: [
      "ATS resume optimizer",
      "resume ATS checker",
      "resume optimization",
    ],
  }),
  buildSoftwareApplicationSchema({
    title: "GetDreamRole Resume Optimizer",
    description:
      "A web app that helps job seekers optimize resumes for Greenhouse, Workday, Lever, iCIMS, Taleo, and other ATS platforms.",
    path: "/optimize",
    keywords: [
      "ATS resume optimizer",
      "resume ATS checker",
      "resume optimization tool",
    ],
  }),
  faqSchema,
];

export default function Home() {
  return (
    <>
      <StructuredData data={homepageSchemas} />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ResultsPreview />
        <GuideHighlights />
        <Benefits />
        <FinalCTA />
      </main>
    </>
  );
}
