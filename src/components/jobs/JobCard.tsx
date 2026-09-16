"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import ScoreBadge from "./ScoreBadge";

type CardAction = "save" | "dismiss" | "import";

function formatSalary(job: Doc<"discoveredJobs">): string | null {
  const parts = [job.salaryMin, job.salaryMax]
    .filter((amount): amount is number => typeof amount === "number" && amount > 0)
    .map((amount) => amount.toLocaleString("en-US"));
  if (parts.length === 0) return null;

  return `${parts.join(" – ")}${job.salaryCurrency ? ` ${job.salaryCurrency}` : ""}`;
}

function formatPosted(postedAt: number | undefined): string {
  if (postedAt === undefined) return "Posted date unknown";
  return `Posted ${new Date(postedAt).toLocaleDateString()}`;
}

export default function JobCard({
  job,
  onSave,
  onDismiss,
  onImport,
}: {
  job: Doc<"discoveredJobs">;
  onSave: () => Promise<void>;
  onDismiss: () => Promise<void>;
  onImport: () => Promise<void>;
}) {
  const [pending, setPending] = useState<CardAction | null>(null);
  const salary = formatSalary(job);

  async function run(action: CardAction, task: () => Promise<void>) {
    setPending(action);
    try {
      await task();
    } finally {
      setPending(null);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-forge-border bg-forge-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-display text-lg font-semibold hover:text-forge-accent"
          >
            {job.title}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-1 text-sm text-forge-muted">
            {job.company} · {job.remote ? "Remote" : job.location || "Location not stated"} ·{" "}
            {formatPosted(job.postedAt)}
            {salary ? ` · ${salary}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ScoreBadge label="Match" score={job.prefilterScore} />
          {job.fitScore === undefined ? null : <ScoreBadge label="Fit" score={job.fitScore} />}
        </div>
      </div>

      {job.fitReasons && job.fitReasons.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm text-forge-muted">
          {job.fitReasons.map((reason) => (
            <li key={reason}>· {reason}</li>
          ))}
        </ul>
      ) : null}

      {job.hardGateFails && job.hardGateFails.length > 0 ? (
        <div className="flex flex-col gap-1 rounded-lg border border-forge-warning/40 bg-forge-warning/10 px-3 py-2 text-sm text-forge-warning">
          {job.hardGateFails.map((gate) => (
            <p key={gate} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {gate}
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending !== null || job.status === "saved"}
          onClick={() => run("save", onSave)}
          className="inline-flex h-10 items-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "save" ? "Saving..." : job.status === "saved" ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          disabled={pending !== null || job.status === "dismissed"}
          onClick={() => run("dismiss", onDismiss)}
          className="inline-flex h-10 items-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-muted hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "dismiss" ? "Dismissing..." : job.status === "dismissed" ? "Dismissed" : "Dismiss"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => run("import", onImport)}
          className="inline-flex h-10 items-center rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "import" ? "Building..." : "Build apply kit"}
        </button>
      </div>
    </article>
  );
}
