import type { Metadata } from "next";
import JobImportClient from "./JobImportClient";

export const metadata: Metadata = {
  title: "Import job | GetDreamRole",
};

export default function JobImportPage() {
  return <JobImportClient />;
}
