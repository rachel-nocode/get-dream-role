import type { Metadata } from "next";
import ApplicationsClient from "./ApplicationsClient";

export const metadata: Metadata = {
  title: "Applications | GetDreamRole",
};

export default function ApplicationsPage() {
  return <ApplicationsClient />;
}
