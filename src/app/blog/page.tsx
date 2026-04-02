import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Resume & ATS Guides",
  description:
    "Guides and tips for beating ATS filters, optimizing your resume for Greenhouse, Lever, Workday, and landing more interviews.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="font-display text-4xl font-bold text-forge-text">
          Guides
        </h1>
        <p className="mt-3 text-forge-muted text-lg">
          Practical advice for beating ATS filters and landing interviews.
        </p>

        <div className="mt-14 divide-y divide-forge-border">
          {blogPosts.map((post) => (
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
