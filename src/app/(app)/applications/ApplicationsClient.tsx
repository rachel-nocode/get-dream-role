"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { FilePlus2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { StatusPill } from "@/components/app/StatusPill";
import { api } from "@convex/_generated/api";

export default function ApplicationsClient() {
  const applications = useQuery(api.applications.list);

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

        <section className="rounded-lg border border-forge-border bg-forge-surface">
          <div className="divide-y divide-forge-border">
            {applications === undefined ? (
              <p className="p-5 text-sm text-forge-muted">Loading applications...</p>
            ) : applications.length > 0 ? (
              applications.map(({ application, job, draft }) => (
                <Link
                  key={application._id}
                  href={`/applications/${application._id}`}
                  className="grid gap-3 p-5 transition-colors hover:bg-forge-elevated md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-semibold">{job?.title ?? "Untitled role"}</p>
                    <p className="mt-1 text-sm text-forge-muted">
                      {job?.company ?? "Unknown company"} · {job?.location || "Remote/unspecified"}
                    </p>
                    {draft ? (
                      <p className="mt-2 text-xs text-forge-muted">
                        Match {draft.matchScore}% · ATS {draft.atsScore}%
                      </p>
                    ) : null}
                  </div>
                  <StatusPill status={application.status} />
                </Link>
              ))
            ) : (
              <div className="p-5">
                <p className="text-sm text-forge-muted">No applications yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
