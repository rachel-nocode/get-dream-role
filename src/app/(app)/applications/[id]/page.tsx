import type { Metadata } from "next";
import ApplicationDetailClient from "./ApplicationDetailClient";

export const metadata: Metadata = {
  title: "Application",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationDetailClient applicationId={id} />;
}
