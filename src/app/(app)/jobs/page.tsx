import type { Metadata } from "next";
import JobsClient from "./JobsClient";

export const metadata: Metadata = {
  title: "Job discovery",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JobsPage() {
  return <JobsClient />;
}
