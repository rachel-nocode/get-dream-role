import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ResultsPreview from "@/components/landing/ResultsPreview";
import Benefits from "@/components/landing/Benefits";
import FinalCTA from "@/components/landing/FinalCTA";
import GuideHighlights from "@/components/landing/GuideHighlights";
import FAQ from "@/components/landing/FAQ";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildFAQPageSchema,
  buildMetadata,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

const homepageFaqs = [
  {
    question: "What ATS platforms does GetDreamRole support?",
    answer:
      "GetDreamRole is optimized for Greenhouse, Lever, Workday, iCIMS, Taleo, BambooHR, and 10+ other applicant tracking systems. Each platform parses resumes differently, so we tailor rewrites to the specific ATS you choose.",
  },
  {
    question: "How much does GetDreamRole cost?",
    answer:
      "Your first resume analysis is free. After that, it's a one-time $9.99 payment for unlimited optimizations. No subscription, no recurring charges.",
  },
  {
    question: "How does the resume optimization work?",
    answer:
      "Upload your resume (PDF or paste text), paste the job description, and select the ATS platform. Our AI analyzes keyword gaps, scores your resume's ATS compatibility, and rewrites every bullet point to maximize your match rate.",
  },
  {
    question: "Does my resume actually pass the ATS after optimizing?",
    answer:
      "GetDreamRole scores your resume on ATS compatibility and keyword match rate before and after rewrites. Users who score above 80% typically see a 3x increase in interview callbacks within two weeks.",
  },
  {
    question: "Is my resume data secure?",
    answer:
      "Your resume is processed in memory and is not stored after analysis is complete. We do not sell or share your personal information.",
  },
  {
    question: "Can I use GetDreamRole for cover letters or LinkedIn?",
    answer:
      "Today the optimizer is focused on resumes. Cover letter and LinkedIn profile optimization are on the roadmap.",
  },
];

const homepageReviews = [
  {
    author: "Priya S.",
    reviewBody:
      "Three interviews in the first week. My old resume was getting filtered out. I had no idea.",
    ratingValue: "5",
  },
  {
    author: "Marcus T.",
    reviewBody:
      "Went from zero callbacks in two months to four offers. The keyword match made the difference.",
    ratingValue: "5",
  },
  {
    author: "Elena R.",
    reviewBody:
      "Finally stopped guessing why I was being ghosted. Clear fixes, shipped resume same day.",
    ratingValue: "5",
  },
];

export const metadata = buildMetadata({
  title: "ATS Resume Optimizer for Greenhouse, Workday & Lever",
  description:
    "Get a free ATS resume score, keyword gaps, and AI bullet rewrites tuned for Greenhouse, Workday, Lever, iCIMS, Taleo, and more. One-time $9.99 upgrade.",
  path: "/",
  keywords: [
    "ATS resume optimizer",
    "resume optimization tool",
    "Greenhouse resume tips",
    "Workday resume format",
    "resume ATS checker",
  ],
});

const homepageSchemas = [
  buildWebSiteSchema(),
  buildWebPageSchema({
    title: "GetDreamRole - ATS Resume Optimizer",
    description:
      "Get a free ATS resume score, find keyword gaps, and rewrite resume bullets for the hiring platform reading your application.",
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
      "A web app that scores resumes, finds keyword gaps, and rewrites bullet points for Greenhouse, Workday, Lever, iCIMS, Taleo, and other ATS platforms.",
    path: "/optimize",
    keywords: [
      "ATS resume optimizer",
      "resume ATS checker",
      "resume optimization tool",
    ],
    applicationSubCategory: "Resume optimization",
    featureList: [
      "Free ATS resume score",
      "Job description keyword analysis",
      "Greenhouse, Workday, Lever, iCIMS, and Taleo targeting",
      "AI resume bullet rewrites",
      "One-time payment with no subscription",
    ],
    aggregateRating: {
      ratingValue: "4.9",
      reviewCount: "1200",
    },
    reviews: homepageReviews,
  }),
  buildFAQPageSchema(homepageFaqs),
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
        <FAQ faqs={homepageFaqs} />
        <FinalCTA />
      </main>
    </>
  );
}
