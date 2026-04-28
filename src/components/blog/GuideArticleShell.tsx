import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import type { BlogPostMeta } from "@/lib/blog-posts";
import RelatedGuides from "@/components/blog/RelatedGuides";
import StructuredData from "@/components/seo/StructuredData";
import { buildBreadcrumbSchema } from "@/lib/seo";

interface GuideArticleShellProps {
  post: BlogPostMeta;
  eyebrow: string;
  children: ReactNode;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GuideArticleShell({
  post,
  eyebrow,
  children,
}: GuideArticleShellProps) {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted transition-colors hover:text-forge-text"
        >
          <ArrowLeft className="h-4 w-4" />
          All guides
        </Link>

        <div className="mt-10">
          <p className="font-display text-xs uppercase tracking-[0.18em] text-forge-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-forge-text md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs text-forge-muted">
            <span>{formatDate(post.date)}</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <div className="mt-12 space-y-8 leading-relaxed text-forge-muted">
          {children}
        </div>

        <RelatedGuides currentSlug={post.slug} />
      </main>
    </>
  );
}
