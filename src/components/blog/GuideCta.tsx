import Link from "next/link";

interface GuideCtaProps {
  title: string;
  description: string;
  href: string;
  label: string;
}

export default function GuideCta({
  title,
  description,
  href,
  label,
}: GuideCtaProps) {
  return (
    <div className="rounded-2xl border border-forge-border bg-forge-surface p-6">
      <p className="font-display text-xl font-semibold text-forge-text">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-forge-muted">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forge-accent px-5 py-2.5 text-sm font-semibold text-forge-bg transition-colors hover:bg-forge-accent-hover"
      >
        {label}
      </Link>
    </div>
  );
}
