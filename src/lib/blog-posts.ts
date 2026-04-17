export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: number;
  category: string;
  primaryKeyword: string;
  keywords: string[];
  relatedSlugs: string[];
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "optimize-resume-workday-ats",
    title: "How to Optimize Your Resume for Workday ATS (2026 Guide)",
    description:
      "Workday is one of the strictest ATS systems. Learn how to format your resume, match exact keywords, and avoid the parsing issues that quietly filter out qualified candidates.",
    date: "2026-04-16",
    readTime: 7,
    category: "ATS Optimization",
    primaryKeyword: "workday ats resume",
    keywords: [
      "workday ats resume",
      "how to pass workday",
      "workday resume format",
      "workday resume tips",
    ],
    relatedSlugs: [
      "optimize-resume-lever-ats",
      "ats-friendly-resume-format",
      "why-qualified-candidates-get-rejected-by-ats",
    ],
  },
  {
    slug: "optimize-resume-lever-ats",
    title: "How to Optimize Your Resume for Lever ATS (2026 Guide)",
    description:
      "Lever rewards context, clarity, and hiring-team readability. This guide shows how to tune your resume for Lever's semantic matching and collaborative review process.",
    date: "2026-04-16",
    readTime: 6,
    category: "ATS Optimization",
    primaryKeyword: "lever ats resume",
    keywords: [
      "lever ats resume",
      "optimize resume for lever",
      "lever resume tips",
      "lever ats guide",
    ],
    relatedSlugs: [
      "optimize-resume-greenhouse-ats",
      "ats-friendly-resume-format",
      "ats-resume-optimizer-guide",
    ],
  },
  {
    slug: "optimize-resume-icims-ats",
    title: "How to Optimize Your Resume for iCIMS ATS (2026 Guide)",
    description:
      "iCIMS is common in enterprise, healthcare, and large recruiting teams. Here is how to structure your resume so iCIMS parses it cleanly and surfaces you for the right roles.",
    date: "2026-04-15",
    readTime: 6,
    category: "ATS Optimization",
    primaryKeyword: "icims resume guide",
    keywords: [
      "icims resume guide",
      "optimize resume for icims",
      "icims ats resume",
      "icims resume tips",
    ],
    relatedSlugs: [
      "optimize-resume-taleo-ats",
      "ats-friendly-resume-format",
      "why-qualified-candidates-get-rejected-by-ats",
    ],
  },
  {
    slug: "optimize-resume-taleo-ats",
    title: "How to Optimize Your Resume for Taleo ATS (2026 Guide)",
    description:
      "Taleo is older, stricter, and much less forgiving than modern ATS platforms. This guide covers the formatting and keyword choices that help your resume survive Taleo.",
    date: "2026-04-15",
    readTime: 6,
    category: "ATS Optimization",
    primaryKeyword: "taleo resume guide",
    keywords: [
      "taleo resume guide",
      "optimize resume for taleo",
      "taleo ats resume",
      "taleo resume format",
    ],
    relatedSlugs: [
      "optimize-resume-workday-ats",
      "ats-friendly-resume-format",
      "why-qualified-candidates-get-rejected-by-ats",
    ],
  },
  {
    slug: "ats-friendly-resume-format",
    title: "ATS-Friendly Resume Format: What Actually Parses in 2026",
    description:
      "Most resume formatting advice is too vague to help. This guide breaks down the layouts, section names, date formats, and PDF choices that actually work in modern ATS systems.",
    date: "2026-04-14",
    readTime: 8,
    category: "Resume Format",
    primaryKeyword: "ats-friendly resume format",
    keywords: [
      "ats-friendly resume format",
      "resume for ats",
      "ats safe resume template",
      "resume formatting for ats",
    ],
    relatedSlugs: [
      "optimize-resume-workday-ats",
      "optimize-resume-greenhouse-ats",
      "why-qualified-candidates-get-rejected-by-ats",
    ],
  },
  {
    slug: "why-qualified-candidates-get-rejected-by-ats",
    title: "Why Qualified Candidates Still Get Rejected by ATS",
    description:
      "Strong candidates get filtered out every day because their resume never survives parsing or matching. Here are the quiet failure points and how to fix them before you apply.",
    date: "2026-04-14",
    readTime: 7,
    category: "ATS Strategy",
    primaryKeyword: "why qualified candidates get rejected by ats",
    keywords: [
      "why qualified candidates get rejected by ats",
      "why ats rejects resumes",
      "resume filtered by ats",
      "ats resume mistakes",
    ],
    relatedSlugs: [
      "ats-friendly-resume-format",
      "ats-resume-optimizer-guide",
      "optimize-resume-workday-ats",
    ],
  },
  {
    slug: "optimize-resume-greenhouse-ats",
    title: "How to Optimize Your Resume for Greenhouse ATS (2026 Guide)",
    description:
      "Greenhouse is used by thousands of tech companies. Here's exactly how it parses your resume, what it scores, and how to make sure you pass the filter.",
    date: "2026-04-02",
    readTime: 7,
    category: "ATS Optimization",
    primaryKeyword: "optimize resume for greenhouse",
    keywords: [
      "optimize resume for greenhouse",
      "greenhouse ats resume",
      "greenhouse resume tips",
      "greenhouse ats guide",
    ],
    relatedSlugs: [
      "optimize-resume-lever-ats",
      "ats-friendly-resume-format",
      "ats-resume-optimizer-guide",
    ],
  },
  {
    slug: "ats-resume-optimizer-guide",
    title: "What Is an ATS Resume Optimizer? Complete Guide for 2026",
    description:
      "ATS software rejects 75% of resumes before a human reads them. This guide explains how optimizers work, what to look for, and how to use one effectively.",
    date: "2026-04-02",
    readTime: 6,
    category: "Getting Started",
    primaryKeyword: "ats resume optimizer",
    keywords: [
      "ats resume optimizer",
      "what is an ats resume optimizer",
      "ats resume checker",
      "ats optimization tool",
    ],
    relatedSlugs: [
      "why-qualified-candidates-get-rejected-by-ats",
      "ats-friendly-resume-format",
      "optimize-resume-greenhouse-ats",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string) {
  const currentPost = getBlogPost(slug);

  if (!currentPost) {
    return [];
  }

  return currentPost.relatedSlugs
    .map((relatedSlug) => getBlogPost(relatedSlug))
    .filter((post): post is BlogPostMeta => post !== undefined);
}
