import clsx from "clsx";

const STRONG = 75;
const FAIR = 50;

/** Green for a strong match, amber for a maybe, grey for the rest. */
export default function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        score >= STRONG
          ? "border-forge-success/40 bg-forge-success/10 text-forge-success"
          : score >= FAIR
            ? "border-forge-warning/40 bg-forge-warning/10 text-forge-warning"
            : "border-forge-border bg-forge-elevated text-forge-muted",
      )}
    >
      {label} {Math.round(score)}
    </span>
  );
}
