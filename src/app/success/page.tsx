import type { Metadata } from "next";
import SuccessPageClient from "./SuccessPageClient";

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Payment confirmation for GetDreamRole.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return <SuccessPageClient />;
}
