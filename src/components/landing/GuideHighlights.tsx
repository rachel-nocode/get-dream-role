import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

const featuredGuideSlugs = [
  "optimize-resume-workday-ats",
  "optimize-resume-greenhouse-ats",
  "ats-friendly-resume-format",
];

export default function GuideHighlights() {
  const featuredGuides = featuredGuideSlugs
    .map((slug) => blogPosts.find((post) => post.slug === slug))
    .filter((post) => post !== undefined);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.18em] text-forge-accent">
            Search-ready guides
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-forge-text md:text-4xl">
            Practical ATS guides job seekers already search for
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-forge-muted">
            These guides bring in high-intent readers and push them straight
            into the optimizer instead of into generic career advice rabbit
            holes.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-sm font-semibold text-forge-accent underline underline-offset-4"
        >
          View all guides
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {featuredGuides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/blog/${guide.slug}`}
            className="rounded-2xl border border-forge-border bg-forge-surface p-6 transition-colors hover:border-forge-border-bright"
          >
            <p className="font-display text-xs uppercase tracking-[0.18em] text-forge-accent">
              {guide.category}
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-forge-text">
              {guide.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-forge-muted">
              {guide.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
