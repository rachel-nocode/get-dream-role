import clsx from "clsx";
import {
  MANUAL_STATUSES,
  STATUS_LABELS,
  normalizeStatus,
  type ManualStatus,
  type PipelineStatus,
  type StoredStatus,
} from "@convex/lib/status";

export type { ManualStatus, PipelineStatus };
export type ApplicationStatus = StoredStatus;

const statusClassNames: Record<PipelineStatus, string> = {
  discovered: "border-forge-border bg-forge-elevated text-forge-muted",
  scored: "border-forge-border-bright bg-forge-elevated text-forge-text",
  drafted: "border-forge-border bg-forge-elevated text-forge-muted",
  needs_review: "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
  approved: "border-forge-accent/40 bg-forge-accent-dim text-forge-accent",
  submitted: "border-forge-success/30 bg-forge-success/10 text-forge-success",
  interview: "border-purple-500/40 bg-purple-500/10 text-purple-500",
  offer: "border-forge-success/50 bg-forge-success/20 text-forge-success",
  rejected: "border-forge-danger/30 bg-forge-danger/10 text-forge-danger",
  ghosted: "border-forge-border bg-forge-surface text-forge-muted",
  archived: "border-forge-border bg-forge-surface text-forge-muted",
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const stage = normalizeStatus(status);

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusClassNames[stage],
      )}
    >
      {STATUS_LABELS[stage]}
    </span>
  );
}

/**
 * The moves a user can make by hand. "Submitted" is missing on purpose: it
 * goes through the apply kit so the daily and per-company caps are checked.
 */
export const applicationStatusOptions = MANUAL_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));
