export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: number;
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "optimize-resume-greenhouse-ats",
    title: "How to Optimize Your Resume for Greenhouse ATS (2026 Guide)",
    description:
      "Greenhouse is used by thousands of tech companies. Here's exactly how it parses your resume, what it scores, and how to make sure you pass the filter.",
    date: "2026-04-02",
    readTime: 7,
  },
  {
    slug: "ats-resume-optimizer-guide",
    title: "What Is an ATS Resume Optimizer? Complete Guide for 2026",
    description:
      "ATS software rejects 75% of resumes before a human reads them. This guide explains how optimizers work, what to look for, and how to use one effectively.",
    date: "2026-04-02",
    readTime: 6,
  },
];
