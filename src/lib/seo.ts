import type { Metadata } from "next";

export const siteConfig = {
  name: "GetDreamRole",
  url: "https://www.getdreamrole.com",
  ogImage: "/og",
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
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
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
  applicationSubCategory?: string;
  featureList?: string[];
  offerPrice?: string;
  reviews?: Review[];
  aggregateRating?: {
    ratingValue: string;
    reviewCount: string;
    bestRating?: string;
    worstRating?: string;
  };
}

export function buildSoftwareApplicationSchema({
  title,
  description,
  path,
  keywords,
  applicationCategory = "BusinessApplication",
  applicationSubCategory,
  featureList,
  offerPrice = siteConfig.price,
  reviews,
  aggregateRating,
}: SoftwareApplicationSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: title,
    description,
    url: absoluteUrl(path),
    applicationCategory,
    applicationSubCategory,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      price: offerPrice,
      priceCurrency: siteConfig.currency,
    },
    keywords,
    featureList,
    audience: {
      "@type": "Audience",
      audienceType: "Job seekers",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    ...(aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating ?? "5",
        worstRating: aggregateRating.worstRating ?? "1",
      },
    }),
    ...(reviews && {
      review: reviews.map((review) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.author,
        },
        reviewBody: review.reviewBody,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.ratingValue,
          bestRating: "5",
          worstRating: "1",
        },
      })),
    }),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

interface FAQ {
  question: string;
  answer: string;
}

export function buildFAQPageSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

interface Breadcrumb {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

interface HowToStep {
  name: string;
  text: string;
}

interface HowToSchemaOptions {
  name: string;
  description: string;
  steps: HowToStep[];
}

export function buildHowToSchema({
  name,
  description,
  steps,
}: HowToSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

interface ItemListSchemaOptions {
  name: string;
  description: string;
  items: string[];
}

export function buildItemListSchema({
  name,
  description,
  items,
}: ItemListSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item,
    })),
  };
}

interface DatasetSchemaOptions {
  name: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function buildDatasetSchema({
  name,
  description,
  path,
  keywords,
}: DatasetSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path),
    keywords,
    creator: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    license: absoluteUrl(path),
  };
}

interface Review {
  author: string;
  reviewBody: string;
  ratingValue: string;
}

export function buildReviewsSchema(
  itemName: string,
  itemUrl: string,
  reviews: Review[]
) {
  return reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: itemName,
      url: itemUrl,
    },
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.ratingValue,
      bestRating: "5",
      worstRating: "1",
    },
  }));
}
