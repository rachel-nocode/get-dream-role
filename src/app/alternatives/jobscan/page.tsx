import type { Metadata } from "next";
import JobscanComparisonPage from "../../vs/jobscan/page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Jobscan Alternative: GetDreamRole vs Jobscan",
  description:
    "Looking for a Jobscan alternative? Compare GetDreamRole and Jobscan on ATS-specific scoring, pricing, privacy, and resume rewrites.",
  path: "/alternatives/jobscan",
  keywords: [
    "Jobscan alternative",
    "Jobscan competitor",
    "alternative to Jobscan",
    "best ATS resume optimizer",
  ],
});

export default JobscanComparisonPage;
