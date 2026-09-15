"use client";

import clsx from "clsx";
import type { Doc } from "@convex/_generated/dataModel";
import type { ActivityType } from "@convex/validators";

export type ActivityEntry = Doc<"activityLog">;

const DOT_STYLES: Record<ActivityType, string> = {
  created: "bg-forge-border-bright",
  drafted: "bg-forge-accent",
  reviewed: "bg-forge-warning",
  approved: "bg-forge-accent",
  opened_form: "bg-forge-border-bright",
  submitted: "bg-forge-success",
  status_change: "bg-forge-border-bright",
  followup_drafted: "bg-forge-accent",
  note: "bg-forge-border-bright",
  ghosted: "bg-forge-danger",
};

function formatMoment(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Everything that has happened to one application, newest first. */
export default function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-forge-muted">Nothing has happened here yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry._id} className="flex gap-3">
          <span
            className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", DOT_STYLES[entry.type])}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm leading-6 text-forge-text break-words">{entry.message}</p>
            <p className="text-xs text-forge-muted">{formatMoment(entry.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The most recent follow-up email on an application, if one was drafted. */
export function latestFollowupFrom(
  entries: ActivityEntry[] | undefined,
): { subject: string; body: string } | null {
  const entry = entries?.find((item) => item.type === "followup_drafted");
  const payload: unknown = entry?.payload;

  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.subject !== "string" || typeof record.body !== "string") return null;

  return { subject: record.subject, body: record.body };
}
