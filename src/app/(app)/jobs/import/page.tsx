import type { Metadata } from "next";
import JobImportClient from "./JobImportClient";

export const metadata: Metadata = {
  title: "Import job",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JobImportPage() {
  return <JobImportClient />;
}
