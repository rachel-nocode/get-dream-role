import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/free-ats-resume-checker", priority: 1, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/tools/ats-score-checker", priority: 0.95, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/tools/resume-keyword-scanner", priority: 0.9, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/guides/ats-keywords-list", priority: 0.9, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/cover-letter-optimizer", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/ats", priority: 0.9, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/optimize", priority: 0.9, changeFrequency: "weekly" as const, lastModified: "2026-04-28" },
  { path: "/ats/greenhouse", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-02" },
  { path: "/ats/lever", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-16" },
  { path: "/ats/workday", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-16" },
  { path: "/ats/icims", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-15" },
  { path: "/ats/taleo", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-15" },
  { path: "/ats/brassring", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-23" },
  { path: "/ats/workable", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/ats/smartrecruiters", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/vs/jobscan", priority: 0.8, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/vs/teal", priority: 0.75, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/vs/resume-worded", priority: 0.75, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/alternatives/jobscan", priority: 0.75, changeFrequency: "monthly" as const, lastModified: "2026-04-28" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const, lastModified: "2026-04-02" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const, lastModified: "2026-04-02" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
