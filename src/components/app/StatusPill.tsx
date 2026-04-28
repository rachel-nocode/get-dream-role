import clsx from "clsx";

const statusLabels = {
  draft: "Draft",
  ready: "Ready",
  opened: "Opened",
  submitted: "Submitted",
  interview: "Interview",
  rejected: "Rejected",
  archived: "Archived",
} as const;

const statusClassNames = {
  draft: "border-forge-border bg-forge-elevated text-forge-muted",
  ready: "border-forge-accent/40 bg-forge-accent-dim text-forge-accent",
  opened: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  submitted: "border-forge-success/30 bg-forge-success/10 text-forge-success",
  interview: "border-purple-300/30 bg-purple-300/10 text-purple-200",
  rejected: "border-forge-danger/30 bg-forge-danger/10 text-forge-danger",
  archived: "border-forge-border bg-forge-surface text-forge-muted",
} as const;

export type ApplicationStatus = keyof typeof statusLabels;

export function StatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusClassNames[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export const applicationStatusOptions = Object.entries(statusLabels).map(
  ([value, label]) => ({ value: value as ApplicationStatus, label }),
);
