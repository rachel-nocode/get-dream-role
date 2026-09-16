"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { SOURCE_KINDS, SOURCE_KIND_LIST } from "@convex/discovery/kinds";
import type { JobSourceKind } from "@convex/validators";

function scanLine(source: Doc<"jobSources">): string {
  if (source.lastScannedAt === undefined) return "Not scanned yet";
  const when = new Date(source.lastScannedAt).toLocaleString();
  const count = source.lastCount === undefined ? "" : ` · ${source.lastCount} postings`;
  return `Scanned ${when}${count}`;
}

export default function SourcesPanel({
  sources,
  onAdd,
  onToggle,
  onRemove,
}: {
  sources: Doc<"jobSources">[];
  onAdd: (kind: JobSourceKind, identifier: string) => Promise<void>;
  onToggle: (sourceId: Id<"jobSources">) => Promise<void>;
  onRemove: (sourceId: Id<"jobSources">) => Promise<void>;
}) {
  const [kind, setKind] = useState<JobSourceKind>("greenhouse");
  const [adding, setAdding] = useState(false);
  const info = SOURCE_KINDS[kind];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const identifier = String(new FormData(form).get("identifier") ?? "");

    setAdding(true);
    try {
      await onAdd(kind, identifier);
      form.reset();
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">Sources</h2>
      <p className="mt-2 text-sm text-forge-muted">
        Company boards you care about, plus free remote feeds. Removing a source also clears the
        jobs from it you have not triaged.
      </p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-forge-muted">Source</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as JobSourceKind)}
            aria-label="Source type"
            className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text"
          >
            {SOURCE_KIND_LIST.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.feed ? " (feed)" : ""}
              </option>
            ))}
          </select>
        </label>

        {info.feed ? null : (
          <label className="flex flex-[2] flex-col gap-1 text-sm">
            <span className="text-forge-muted">{info.identifierLabel}</span>
            <input
              name="identifier"
              placeholder={info.placeholder}
              autoComplete="off"
              spellCheck={false}
              className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text placeholder:text-forge-muted"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={adding}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {adding ? "Adding..." : "Add source"}
        </button>
      </form>
      <p className="mt-2 text-xs text-forge-muted">{info.help}</p>

      <div className="mt-5 flex flex-col gap-3">
        {sources.length === 0 ? (
          <p className="text-sm text-forge-muted">
            No sources yet. A feed is the quickest start; a company board is the highest signal.
          </p>
        ) : null}

        {sources.map((source) => (
          <div
            key={source._id}
            className="flex flex-col gap-2 rounded-lg border border-forge-border bg-forge-bg p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">{source.label}</p>
              <p className="mt-1 text-sm text-forge-muted">{scanLine(source)}</p>
              {source.lastError ? (
                <p className="mt-1 text-sm text-forge-danger">{source.lastError}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onToggle(source._id)}
                className={clsx(
                  "inline-flex h-10 items-center rounded-full border px-3 text-xs font-semibold",
                  source.enabled
                    ? "border-forge-success/40 bg-forge-success/10 text-forge-success"
                    : "border-forge-border bg-forge-elevated text-forge-muted",
                )}
              >
                {source.enabled ? "Enabled" : "Paused"}
              </button>
              <button
                type="button"
                onClick={() => onRemove(source._id)}
                aria-label={`Remove ${source.label}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-danger hover:bg-forge-elevated"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
