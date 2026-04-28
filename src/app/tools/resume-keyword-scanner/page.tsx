import type { Metadata } from "next";
import AtsScoreCheckerPage from "../ats-score-checker/page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Resume Keyword Scanner for ATS Job Matching",
  description:
    "Scan your resume for missing job-description keywords, ATS match gaps, and weak bullet evidence before you apply.",
  path: "/tools/resume-keyword-scanner",
  keywords: [
    "resume keyword scanner",
    "ATS keyword finder",
    "resume keywords for ATS",
    "resume keyword optimization",
  ],
});

export default AtsScoreCheckerPage;
