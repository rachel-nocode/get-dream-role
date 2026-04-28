import type { Metadata } from "next";
import ApplicationDetailClient from "./ApplicationDetailClient";

export const metadata: Metadata = {
  title: "Application | GetDreamRole",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationDetailClient applicationId={id} />;
}
