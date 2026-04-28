import type { Metadata } from "next";
import ApplicationsClient from "./ApplicationsClient";

export const metadata: Metadata = {
  title: "Applications",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationsPage() {
  return <ApplicationsClient />;
}
