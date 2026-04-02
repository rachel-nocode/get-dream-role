import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import Footer from "@/components/landing/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "GetDreamRole — AI Resume Optimizer for ATS",
    template: "%s | GetDreamRole",
  },
  description:
    "AI-powered resume optimizer built for Greenhouse, Lever, Workday & 10+ ATS platforms. Upload your resume, paste the job description, and get rewrites that pass the filters. One-time $9.99.",
  metadataBase: new URL("https://www.getdreamrole.com"),
  openGraph: {
    type: "website",
    url: "https://www.getdreamrole.com",
    siteName: "GetDreamRole",
    title: "GetDreamRole — AI Resume Optimizer for ATS",
    description:
      "AI-powered resume optimizer built for Greenhouse, Lever, Workday & 10+ ATS platforms. Upload your resume, paste the job description, and get rewrites that pass the filters. One-time $9.99.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetDreamRole — AI Resume Optimizer for ATS",
    description:
      "AI-powered resume optimizer for Greenhouse, Lever, Workday & more. Paste the job description, get AI rewrites that beat ATS filters. One-time $9.99.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${spaceGrotesk.variable} ${sora.variable}`}>
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
