import Link from "next/link";
import { getRelatedBlogPosts } from "@/lib/blog-posts";

interface RelatedGuidesProps {
  currentSlug: string;
}

export default function RelatedGuides({ currentSlug }: RelatedGuidesProps) {
  const relatedPosts = getRelatedBlogPosts(currentSlug);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-14 border-t border-forge-border pt-10">
      <h2 className="font-display text-2xl font-semibold text-forge-text">
        Related guides
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-forge-muted">
        Keep going with the next guide that matches the ATS or resume problem
        you are working through right now.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-2xl border border-forge-border bg-forge-surface p-5 transition-colors hover:border-forge-border-bright"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-forge-accent">
              {post.category}
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-forge-text">
              {post.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
