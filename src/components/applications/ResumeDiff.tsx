"use client";

import clsx from "clsx";
import type { ChangeLogEntry } from "@convex/validators";
import CopyButton from "./CopyButton";

function EvidenceChips({
  evidenceIds,
  factText,
}: {
  evidenceIds: string[];
  factText: Record<string, string>;
}) {
  if (evidenceIds.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {evidenceIds.map((id) => (
        <span
          key={id}
          title={factText[id] ?? "A fact from your profile"}
          className="cursor-help rounded-full border border-forge-accent/40 bg-forge-accent-dim px-2 py-0.5 text-[11px] font-semibold text-forge-accent"
        >
          {id}
        </span>
      ))}
    </div>
  );
}

function DiffRow({ entry }: { entry: ChangeLogEntry }) {
  const changed = entry.rewritten !== entry.original;

  return (
    <div className="grid gap-2 border-b border-forge-border p-3 last:border-b-0 md:grid-cols-2 md:gap-4">
      <p className={clsx("text-sm leading-6", changed ? "text-forge-muted" : "text-forge-muted/60")}>
        {entry.original}
      </p>
      <p
        className={clsx(
          "rounded-lg text-sm leading-6",
          changed
            ? "border border-forge-accent/40 bg-forge-accent-dim px-3 py-2 text-forge-text"
            : "px-3 py-2 text-forge-muted/60",
        )}
      >
        {entry.rewritten}
      </p>
    </div>
  );
}

/**
 * The resume the way a user needs to check it: their own bullet on the left,
 * the tailored one on the right, and every change explained underneath with
 * the facts it rests on.
 */
export default function ResumeDiff({
  changeLog,
  factText,
  resumeText,
}: {
  changeLog: ChangeLogEntry[];
  factText: Record<string, string>;
  resumeText: string;
}) {
  const changed = changeLog.filter((entry) => entry.rewritten !== entry.original);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Tailored resume</h2>
          <p className="mt-1 text-sm text-forge-muted">
            {changeLog.length === 0
              ? "This draft was made before change tracking. Copy it and compare it yourself."
              : `${changed.length} of ${changeLog.length} bullet${
                  changeLog.length === 1 ? "" : "s"
                } rewritten. The rest are yours, untouched.`}
          </p>
        </div>
        <CopyButton value={resumeText} label="Copy resume" />
      </div>

      {changeLog.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-forge-border bg-forge-bg">
          <div className="hidden grid-cols-2 gap-4 border-b border-forge-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-forge-muted md:grid">
            <span>From your profile</span>
            <span>Tailored for this job</span>
          </div>
          {changeLog.map((entry, index) => (
            <DiffRow key={entry.bulletId ?? `row-${index}`} entry={entry} />
          ))}
        </div>
      ) : null}

      {changed.length > 0 ? (
        <div>
          <h3 className="font-display text-lg font-semibold">Change log</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {changed.map((entry, index) => (
              <li
                key={entry.bulletId ?? `change-${index}`}
                className="rounded-lg border border-forge-border bg-forge-bg p-4"
              >
                <p className="text-sm leading-6 text-forge-text">{entry.rewritten}</p>
                <p className="mt-2 text-xs text-forge-muted">{entry.reason}</p>
                <EvidenceChips evidenceIds={entry.evidenceIds} factText={factText} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="rounded-lg border border-forge-border bg-forge-bg p-4">
        <summary className="cursor-pointer text-sm font-semibold text-forge-text">
          Full resume text
        </summary>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-forge-text">
          {resumeText}
        </pre>
      </details>
    </div>
  );
}
