import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

interface FactItem {
  label: string;
  value: string;
  note: string;
}

interface RelatedLink {
  href: string;
  label: string;
}

interface AtsLandingContentProps {
  eyebrow: string;
  headlineLines: [string, string];
  intro: string;
  ctaLabel: string;
  secondaryCtaLabel: string;
  ctaHref: string;
  facts: FactItem[];
  mistakesTitle: string;
  mistakesIntro?: string;
  mistakes: string[];
  benefitsTitle: string;
  benefits: string[];
  relatedLinks: RelatedLink[];
}

export default function AtsLandingContent({
  eyebrow,
  headlineLines,
  intro,
  ctaLabel,
  secondaryCtaLabel,
  ctaHref,
  facts,
  mistakesTitle,
  mistakesIntro,
  mistakes,
  benefitsTitle,
  benefits,
  relatedLinks,
}: AtsLandingContentProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Link
          href="/ats"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted transition-colors hover:text-forge-text"
        >
          <ArrowLeft className="h-4 w-4" />
          All platforms
        </Link>

        <div className="mt-10">
          <p className="font-display text-xs uppercase tracking-[0.18em] text-forge-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-forge-text md:text-5xl">
            {headlineLines[0]}
            <br />
            {headlineLines[1]}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-forge-muted">
            {intro}
          </p>
          <div className="mt-7">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-lg bg-forge-accent px-6 py-3 font-semibold text-forge-bg transition-colors hover:bg-forge-accent-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-forge-border bg-forge-surface p-5"
            >
              <p className="font-display text-xs uppercase tracking-wider text-forge-muted">
                {fact.label}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-forge-text">
                {fact.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-forge-muted">
                {fact.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-forge-text">
            {mistakesTitle}
          </h2>
          {mistakesIntro ? (
            <p className="mt-3 text-sm text-forge-muted">{mistakesIntro}</p>
          ) : null}
          <ul className="mt-6 space-y-4">
            {mistakes.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-3 text-sm leading-relaxed text-forge-muted"
              >
                <span className="mt-0.5 shrink-0 text-forge-accent">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 rounded-xl border border-forge-border bg-forge-surface p-8">
          <h2 className="font-display text-xl font-semibold text-forge-text">
            {benefitsTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            {benefits.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-3 text-sm leading-relaxed text-forge-muted"
              >
                <span className="mt-0.5 shrink-0 text-forge-success">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-lg bg-forge-accent px-5 py-2.5 text-sm font-semibold text-forge-bg transition-colors hover:bg-forge-accent-hover"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-forge-muted">
          <span>Related:</span>
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline underline-offset-2 transition-colors hover:text-forge-text"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
