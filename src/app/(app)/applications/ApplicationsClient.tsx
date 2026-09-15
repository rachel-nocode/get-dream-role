"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { FilePlus2, Search } from "lucide-react";
import Board from "@/components/applications/Board";
import type { TrackerRow } from "@/components/applications/BoardCard";
import AppShell from "@/components/app/AppShell";
import { api } from "@convex/_generated/api";
import type { ManualStatus } from "@convex/lib/status";

export default function ApplicationsClient() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const applications = useQuery(api.applications.list);
  const updateStatus = useMutation(api.applications.updateStatus);

  async function move(row: TrackerRow, status: ManualStatus) {
    setError("");
    try {
      await updateStatus({ applicationId: row.application._id, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move that application.");
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
              Pipeline
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold">Applications</h1>
          </div>
          <Link
            href="/jobs/import"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
          >
            <FilePlus2 className="h-4 w-4" />
            Import job
          </Link>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forge-muted" />
          <input
            type="search"
            defaultValue=""
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by company or title"
            aria-label="Filter by company or title"
            className="h-11 w-full rounded-lg border border-forge-border bg-forge-surface pl-9 pr-3 text-sm text-forge-text outline-none focus:border-forge-accent md:max-w-sm"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
            {error}
          </p>
        ) : null}

        {applications === undefined ? (
          <p className="text-sm text-forge-muted">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <p className="text-sm text-forge-muted">
              No applications yet. Import a job, or score a few from the discovery queue.
            </p>
          </div>
        ) : (
          <Board rows={applications} search={search} onStatusChange={move} />
        )}
      </div>
    </AppShell>
  );
}
