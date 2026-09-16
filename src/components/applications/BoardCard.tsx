"use client";

import Link from "next/link";
import type { Doc } from "@convex/_generated/dataModel";
import {
  STATUS_LABELS,
  isManualStatus,
  type ManualStatus,
  type PipelineStatus,
} from "@convex/lib/status";
import { applicationStatusOptions } from "@/components/app/StatusPill";

/** One row of `api.applications.list`, with the status already normalized. */
export type TrackerRow = {
  application: Omit<Doc<"applications">, "status"> & { status: PipelineStatus };
  job: Doc<"jobImports"> | null;
  draft: Doc<"applicationDrafts"> | null;
  daysInStage: number;
  nextActionAt: number | null;
  nextActionLabel: string | null;
  followupCount: number;
};

const SUBMIT_HINT = "submitted-hint";

function stageLine(row: TrackerRow): string {
  return row.daysInStage === 0 ? "Moved here today" : `${row.daysInStage}d in this stage`;
}

function nextActionLine(row: TrackerRow): string | null {
  if (row.nextActionAt === null) return null;
  const label = row.nextActionLabel ?? "Follow up";
  const due = new Date(row.nextActionAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return row.nextActionAt <= Date.now() ? `${label} — due now` : `${label} on ${due}`;
}

export default function BoardCard({
  row,
  onStatusChange,
}: {
  row: TrackerRow;
  onStatusChange: (status: ManualStatus) => void;
}) {
  const { application, job, draft } = row;
  const nextAction = nextActionLine(row);

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-forge-border bg-forge-bg p-3">
      <Link href={`/applications/${application._id}`} className="group">
        <p className="font-semibold leading-snug group-hover:text-forge-accent">
          {job?.title ?? "Untitled role"}
        </p>
        <p className="mt-0.5 text-sm text-forge-muted">{job?.company ?? "Unknown company"}</p>
      </Link>

      {draft ? (
        <p className="text-xs text-forge-muted">
          Match {draft.matchScore}% · ATS {draft.atsScore}%
        </p>
      ) : null}

      <p className="text-xs text-forge-muted">{stageLine(row)}</p>

      {nextAction ? (
        <p className="text-xs font-semibold text-forge-accent">{nextAction}</p>
      ) : null}

      <select
        aria-label={`Move ${job?.title ?? "this application"} to another stage`}
        value={isManualStatus(application.status) ? application.status : ""}
        onChange={(event) => onStatusChange(event.target.value as ManualStatus)}
        className="h-9 w-full rounded-lg border border-forge-border bg-forge-surface px-2 text-xs text-forge-text outline-none focus:border-forge-accent"
      >
        {isManualStatus(application.status) ? null : (
          <option value="">{STATUS_LABELS[application.status]}</option>
        )}
        {applicationStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={SUBMIT_HINT} disabled>
          Submitted: use Mark submitted in the apply kit
        </option>
      </select>
    </article>
  );
}
