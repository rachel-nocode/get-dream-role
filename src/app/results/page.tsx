import type { Metadata } from "next";
import ResultsPageClient from "./ResultsPageClient";

export const metadata: Metadata = {
  title: "Resume Analysis Results",
  description: "Private GetDreamRole resume analysis results.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsPage() {
  return <ResultsPageClient />;
}
