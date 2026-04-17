import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { blogPosts } from "@/lib/blog-posts";
import { buildMetadata, buildWebPageSchema } from "@/lib/seo";
import StructuredData from "@/components/seo/StructuredData";

export const metadata: Metadata = buildMetadata({
  title: "Resume & ATS Guides",
  description:
    "High-intent ATS guides for Greenhouse, Lever, Workday, iCIMS, Taleo, and resume formatting. Built for job seekers who want more interviews, not generic advice.",
  path: "/blog",
  keywords: [
    "ATS guides",
    "resume ATS guides",
    "workday resume guide",
    "Greenhouse resume tips",
    "ATS-friendly resume format",
  ],
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const featuredSlugs = [
  "optimize-resume-workday-ats",
  "ats-friendly-resume-format",
  "why-qualified-candidates-get-rejected-by-ats",
];

export default function BlogPage() {
  const featuredPosts = featuredSlugs
    .map((slug) => blogPosts.find((post) => post.slug === slug))
    .filter((post) => post !== undefined);
  const featuredPostSlugs = new Set(featuredPosts.map((post) => post.slug));
  const remainingPosts = blogPosts.filter((post) => !featuredPostSlugs.has(post.slug));

  return (
    <>
      <StructuredData
        data={buildWebPageSchema({
          title: "Resume & ATS Guides",
          description:
            "A guide library for ATS optimization, resume formatting, and platform-specific advice for Greenhouse, Lever, Workday, iCIMS, and Taleo.",
          path: "/blog",
          keywords: ["ATS guides", "resume guides", "ATS-friendly resume"],
        })}
      />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="font-display text-4xl font-bold text-forge-text">
          Resume & ATS Guides
        </h1>
        <p className="mt-3 text-forge-muted text-lg">
          Practical guides for job seekers who already have a role in mind and
          want a resume that survives the ATS.
        </p>

        <div className="mt-12 grid gap-4">
          {featuredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-2xl border border-forge-border bg-forge-surface p-6 transition-colors hover:border-forge-border-bright"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-forge-accent">
                Featured guide
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-snug text-forge-text">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                {post.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 divide-y divide-forge-border">
          {remainingPosts.map((post) => (
            <article key={post.slug} className="py-10 first:pt-0">
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="font-display text-xl font-semibold text-forge-text group-hover:text-forge-accent transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="mt-3 text-forge-muted text-sm leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-forge-muted">
                  <span>{formatDate(post.date)}</span>
                  <span>{post.readTime} min read</span>
                  <span className="ml-auto flex items-center gap-1 text-forge-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
