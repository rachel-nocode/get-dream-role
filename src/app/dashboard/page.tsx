import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | GetDreamRole",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
