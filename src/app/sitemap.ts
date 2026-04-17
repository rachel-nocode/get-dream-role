import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/ats", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/optimize", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/ats/greenhouse", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ats/lever", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ats/workday", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ats/icims", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ats/taleo", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
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
