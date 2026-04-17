import type { Metadata } from "next";

export const siteConfig = {
  name: "GetDreamRole",
  url: "https://www.getdreamrole.com",
  ogImage: "/og.png",
  description:
    "AI-powered resume optimizer built for Greenhouse, Lever, Workday, iCIMS, Taleo, and other ATS platforms. Upload your resume, paste the job description, and get targeted rewrites that pass the filter.",
  price: "9.99",
  currency: "USD",
};

const defaultKeywords = [
  "ATS resume optimizer",
  "resume optimization",
  "resume ATS checker",
  "Greenhouse resume tips",
  "Workday resume format",
  "Lever ATS resume",
  "iCIMS resume guide",
  "Taleo resume guide",
];

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export const baseMetadata: Metadata = {
  title: {
    default: "GetDreamRole - AI Resume Optimizer for ATS",
    template: "%s | GetDreamRole",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  applicationName: siteConfig.name,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "GetDreamRole - AI Resume Optimizer for ATS",
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: "GetDreamRole - AI Resume Optimizer for ATS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetDreamRole - AI Resume Optimizer for ATS",
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
};

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: BuildMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: absoluteUrl(siteConfig.ogImage),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
  };
}

interface WebPageSchemaOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function buildWebPageSchema({
  title,
  description,
  path,
  keywords,
}: WebPageSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    keywords,
  };
}

interface BlogPostingSchemaOptions extends WebPageSchemaOptions {
  datePublished: string;
  dateModified?: string;
}

export function buildBlogPostingSchema({
  title,
  description,
  path,
  keywords,
  datePublished,
  dateModified,
}: BlogPostingSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: "en-US",
    keywords,
    image: absoluteUrl(siteConfig.ogImage),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.ogImage),
      },
    },
  };
}

interface SoftwareApplicationSchemaOptions extends WebPageSchemaOptions {
  applicationCategory?: string;
}

export function buildSoftwareApplicationSchema({
  title,
  description,
  path,
  keywords,
  applicationCategory = "BusinessApplication",
}: SoftwareApplicationSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    url: absoluteUrl(path),
    applicationCategory,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: siteConfig.price,
      priceCurrency: siteConfig.currency,
    },
    keywords,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}
