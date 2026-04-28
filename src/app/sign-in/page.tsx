import type { Metadata } from "next";
import SignInPageClient from "./SignInPageClient";

export const metadata: Metadata = {
  title: "Sign in | GetDreamRole",
  description: "Sign in to GetDreamRole Apply Copilot.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/dashboard";

  return <SignInPageClient nextPath={nextPath} />;
}
