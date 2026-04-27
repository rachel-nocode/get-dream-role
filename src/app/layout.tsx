import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import Footer from "@/components/landing/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { baseMetadata, buildOrganizationSchema } from "@/lib/seo";
import StructuredData from "@/components/seo/StructuredData";
import DataFastAnalytics from "@/components/analytics/DataFastAnalytics";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${spaceGrotesk.variable} ${sora.variable}`}>
      <body className="flex flex-col min-h-screen">
        <StructuredData data={buildOrganizationSchema()} />
        <div className="flex-1">{children}</div>
        <Footer />
        <DataFastAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
