"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, FilePlus2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { StatusPill } from "@/components/app/StatusPill";
import { api } from "@convex/_generated/api";

export default function DashboardClient() {
  const applications = useQuery(api.applications.list);
  const entitlements = useQuery(api.entitlements.getForCurrentUser);
  const isLoading = applications === undefined || entitlements === undefined;
  const activeApply = entitlements?.some(
    (entitlement) =>
      entitlement.kind === "apply_copilot" && entitlement.status === "active",
  );
  const activeOptimizer = entitlements?.some(
    (entitlement) =>
      entitlement.kind === "optimizer_lifetime" && entitlement.status === "active",
  );
  const recent = applications?.slice(0, 5) ?? [];
  const submittedCount =
    applications?.filter(({ application }) => application.status === "submitted").length ?? 0;
  const readyCount =
    applications?.filter(({ application }) => application.status === "ready").length ?? 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
              Apply Copilot
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold">Application dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-forge-muted">
              Track imported jobs, generated packets, and applications you have shipped.
            </p>
          </div>
          <Link
            href="/jobs/import"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
          >
            <FilePlus2 className="h-4 w-4" />
            Import job
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Applications", applications?.length ?? 0],
            ["Ready drafts", readyCount],
            ["Submitted", submittedCount],
            ["Apply plan", activeApply ? "Active" : "Beta"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <p className="text-sm text-forge-muted">{label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{isLoading ? "-" : value}</p>
            </div>
          ))}
        </section>

        {!activeApply || !activeOptimizer ? (
          <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Access</h2>
                <p className="mt-2 text-sm text-forge-muted">
                  Resume optimizer: {activeOptimizer ? "unlocked" : "not restored yet"} · Apply Copilot:{" "}
                  {activeApply ? "active" : "beta checkout available"}
                </p>
              </div>
              <Link
                href="/settings/billing"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
              >
                Billing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-forge-border bg-forge-surface">
          <div className="flex items-center justify-between border-b border-forge-border px-5 py-4">
            <h2 className="font-display text-xl font-semibold">Recent applications</h2>
            <Link href="/applications" className="text-sm text-forge-accent hover:text-forge-accent-hover">
              View all
            </Link>
          </div>
          <div className="divide-y divide-forge-border">
            {isLoading ? (
              <p className="p-5 text-sm text-forge-muted">Loading applications...</p>
            ) : recent.length > 0 ? (
              recent.map(({ application, job }) => (
                <Link
                  key={application._id}
                  href={`/applications/${application._id}`}
                  className="flex flex-col gap-3 p-5 transition-colors hover:bg-forge-elevated md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{job?.title ?? "Untitled role"}</p>
                    <p className="mt-1 text-sm text-forge-muted">
                      {job?.company ?? "Unknown company"} · {job?.location || "Remote/unspecified"}
                    </p>
                  </div>
                  <StatusPill status={application.status} />
                </Link>
              ))
            ) : (
              <div className="p-5">
                <p className="text-sm text-forge-muted">No imported jobs yet.</p>
                <Link
                  href="/jobs/import"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
                >
                  <FilePlus2 className="h-4 w-4" />
                  Import your first job
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
