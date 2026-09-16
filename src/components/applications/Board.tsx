"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { STATUS_LABELS, type ManualStatus, type PipelineStatus } from "@convex/lib/status";
import BoardCard, { type TrackerRow } from "./BoardCard";

/** The stages that get a column of their own. */
const COLUMNS: PipelineStatus[] = [
  "needs_review",
  "approved",
  "submitted",
  "interview",
  "offer",
];

/** Kits that are not ready to look at yet. */
const DRAFTING: PipelineStatus[] = ["discovered", "scored", "drafted"];

/** Everything that is over, one way or another. */
const CLOSED: PipelineStatus[] = ["rejected", "ghosted", "archived"];

function matchesSearch(row: TrackerRow, needle: string): boolean {
  if (needle.length === 0) return true;
  const haystack = `${row.job?.title ?? ""} ${row.job?.company ?? ""}`.toLowerCase();
  return haystack.includes(needle);
}

function Column({
  status,
  rows,
  onStatusChange,
}: {
  status: PipelineStatus;
  rows: TrackerRow[];
  onStatusChange: (row: TrackerRow, status: ManualStatus) => void;
}) {
  return (
    <section className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-forge-border bg-forge-surface p-3">
      <header className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-forge-muted">
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full border border-forge-border px-2 py-0.5 text-xs text-forge-muted">
          {rows.length}
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="text-xs text-forge-muted">Nothing here.</p>
      ) : (
        rows.map((row) => (
          <BoardCard
            key={row.application._id}
            row={row}
            onStatusChange={(next) => onStatusChange(row, next)}
          />
        ))
      )}
    </section>
  );
}

function Group({
  title,
  rows,
  startClosed,
  onStatusChange,
}: {
  title: string;
  rows: TrackerRow[];
  startClosed: boolean;
  onStatusChange: (row: TrackerRow, status: ManualStatus) => void;
}) {
  const [open, setOpen] = useState(!startClosed);

  if (rows.length === 0) return null;

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-forge-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-forge-muted" />
        )}
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-forge-muted">
          {title}
        </h2>
        <span className="rounded-full border border-forge-border px-2 py-0.5 text-xs text-forge-muted">
          {rows.length}
        </span>
      </button>

      {open ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <BoardCard
              key={row.application._id}
              row={row}
              onStatusChange={(next) => onStatusChange(row, next)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * The pipeline as a board: one column per live stage, a group for kits still
 * being built and a collapsed one for everything that is over.
 */
export default function Board({
  rows,
  search,
  onStatusChange,
}: {
  rows: TrackerRow[];
  search: string;
  onStatusChange: (row: TrackerRow, status: ManualStatus) => void;
}) {
  const needle = search.trim().toLowerCase();
  const visible = rows.filter((row) => matchesSearch(row, needle));
  const inStages = (stages: PipelineStatus[]) =>
    visible.filter((row) => stages.includes(row.application.status));

  return (
    <div className="flex flex-col gap-4">
      <Group
        title="Drafting"
        rows={inStages(DRAFTING)}
        startClosed={false}
        onStatusChange={onStatusChange}
      />

      <div className="-mx-6 overflow-x-auto px-6 pb-2">
        <div className="flex min-w-max gap-3">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              rows={inStages([status])}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>

      <Group
        title="Closed"
        rows={inStages(CLOSED)}
        startClosed
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
