import type { Metadata } from "next";
import OptimizePageClient from "@/app/optimize/OptimizePageClient";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildMetadata,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Optimize Your Resume for the Right ATS",
  description:
    "Upload your resume, paste the job description, choose the target ATS, and get rewrite suggestions built for Greenhouse, Lever, Workday, iCIMS, Taleo, and more.",
  path: "/optimize",
  keywords: [
    "ATS resume optimizer",
    "resume ATS checker",
    "optimize resume for workday",
    "optimize resume for greenhouse",
    "resume optimization tool",
  ],
});

const schemas = [
  buildWebPageSchema({
    title: "Optimize Your Resume for the Right ATS",
    description:
      "A step-by-step tool for matching your resume to a job description and the ATS platform behind the application.",
    path: "/optimize",
    keywords: [
      "ATS resume optimizer",
      "resume ATS checker",
      "resume optimization tool",
    ],
  }),
  buildSoftwareApplicationSchema({
    title: "GetDreamRole Resume Optimizer",
    description:
      "A web application that helps job seekers tailor resumes for specific ATS platforms using job descriptions and targeted bullet rewrites.",
    path: "/optimize",
    keywords: [
      "ATS resume optimizer",
      "resume ATS checker",
      "resume optimization tool",
    ],
  }),
];

export default function OptimizePage() {
  return (
    <>
      <StructuredData data={schemas} />
      <OptimizePageClient />
    </>
  );
}
