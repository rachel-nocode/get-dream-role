import type { Metadata } from "next";
import PaymentPageClient from "./PaymentPageClient";

export const metadata: Metadata = {
  title: "Unlock GetDreamRole",
  description: "Unlock unlimited GetDreamRole resume optimizations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentPage() {
  return <PaymentPageClient />;
}
