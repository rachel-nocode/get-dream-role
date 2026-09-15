import type { Metadata } from "next";
import AiSettingsClient from "./AiSettingsClient";

export const metadata: Metadata = {
  title: "AI settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AiSettingsPage() {
  return <AiSettingsClient />;
}
