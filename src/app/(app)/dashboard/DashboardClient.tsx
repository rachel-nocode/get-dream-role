"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarClock, FilePlus2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { StatusPill } from "@/components/app/StatusPill";
import { api } from "@convex/_generated/api";
import { PROVIDERS, findModel, formatUsd } from "@convex/ai/providers";
import { hasApplied, type PipelineStatus } from "@convex/lib/status";

type FunnelTile = { label: string; value: number; previous: number | null };

/** Each stage against the one before it, so the drop-off is the headline. */
function shareOfPrevious(tile: FunnelTile): string | null {
  if (tile.previous === null || tile.previous === 0) return null;
  return `${Math.round((tile.value / tile.previous) * 100)}% of previous`;
}

function buildFunnel(args: {
  discovered: number;
  statuses: PipelineStatus[];
  withDraft: number;
}): FunnelTile[] {
  const count = (stages: PipelineStatus[]) =>
    args.statuses.filter((status) => stages.includes(status)).length;

  const submitted = args.statuses.filter(hasApplied).length;
  const responses = count(["interview", "offer", "rejected"]);
  const interviews = count(["interview", "offer"]);
  const offers = count(["offer"]);

  const values: Array<[string, number]> = [
    ["Discovered", args.discovered],
    ["Drafted", args.withDraft],
    ["Submitted", submitted],
    ["Responses", responses],
    ["Interviews", interviews],
    ["Offers", offers],
  ];

  return values.map(([label, value], index) => ({
    label,
    value,
    previous: index === 0 ? null : values[index - 1][1],
  }));
}

function FunnelCard({ tile }: { tile: FunnelTile }) {
  const share = shareOfPrevious(tile);

  return (
    <div className="rounded-lg border border-forge-border bg-forge-surface p-4">
      <p className="text-sm text-forge-muted">{tile.label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{tile.value}</p>
      <p className="mt-1 text-xs text-forge-muted">{share ?? " "}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface">
      <div className="flex items-center justify-between gap-3 border-b border-forge-border px-5 py-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardClient() {
  const applications = useQuery(api.applications.list);
  const entitlements = useQuery(api.entitlements.getForCurrentUser);
  const discovery = useQuery(api.discovery.jobs.stats);
  const topJobs = useQuery(api.discovery.jobs.top, {});
  const due = useQuery(api.applications.dueActions);
  const usage = useQuery(api.aiSettings.usageThisMonth);
  const model = useQuery(api.aiSettings.resolvedModel);

  const isLoading = applications === undefined;
  const activeApply = entitlements?.some(
    (entitlement) =>
      entitlement.kind === "apply_copilot" && entitlement.status === "active",
  );
  const activeOptimizer = entitlements?.some(
    (entitlement) =>
      entitlement.kind === "optimizer_lifetime" && entitlement.status === "active",
  );

  const recent = applications?.slice(0, 5) ?? [];
  const funnel = buildFunnel({
    discovered: discovery?.total ?? 0,
    statuses: applications?.map((row) => row.application.status) ?? [],
    withDraft: applications?.filter((row) => row.draft !== null).length ?? 0,
  });

  const modelName =
    model === undefined
      ? "your model"
      : `${PROVIDERS[model.provider].label} ${findModel(model.provider, model.model)?.label ?? model.model}`;

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
              Where every application stands, what is due today, and what this month has cost.
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

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {funnel.map((tile) => (
            <FunnelCard key={tile.label} tile={tile} />
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Due today">
            <div className="divide-y divide-forge-border">
              {due === undefined ? (
                <p className="p-5 text-sm text-forge-muted">Loading follow-ups...</p>
              ) : due.length === 0 ? (
                <p className="p-5 text-sm text-forge-muted">
                  Nothing is due. Follow-ups appear here a week after you submit.
                </p>
              ) : (
                due.map((item) => (
                  <Link
                    key={item.applicationId}
                    href={`/applications/${item.applicationId}`}
                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-forge-elevated"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.title}</p>
                      <p className="mt-0.5 truncate text-sm text-forge-muted">{item.company}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm text-forge-accent">
                      <CalendarClock className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Panel>

          <div className="flex flex-col gap-4">
            <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <h2 className="font-display text-xl font-semibold">Cost this month</h2>
              <p className="mt-2 font-display text-3xl font-bold">
                {usage === undefined ? "-" : formatUsd(usage.costUsd)}
              </p>
              <p className="mt-2 text-sm text-forge-muted">
                {usage === undefined
                  ? "Adding up this month's calls..."
                  : `${usage.calls} call${usage.calls === 1 ? "" : "s"} on ${modelName}.`}{" "}
                <Link
                  href="/settings/ai"
                  className="text-forge-accent hover:text-forge-accent-hover"
                >
                  AI settings
                </Link>
              </p>
            </section>

            {!activeApply || !activeOptimizer ? (
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forge-border bg-forge-surface px-5 py-3">
                <p className="text-sm text-forge-muted">
                  Access: optimizer {activeOptimizer ? "unlocked" : "locked"} · copilot{" "}
                  {activeApply ? "active" : "beta"}
                </p>
                <Link
                  href="/settings/billing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-forge-accent hover:text-forge-accent-hover"
                >
                  Billing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : null}
          </div>
        </div>

        <Panel
          title="Top discovered jobs"
          action={
            <Link href="/jobs" className="text-sm text-forge-accent hover:text-forge-accent-hover">
              Open the queue
            </Link>
          }
        >
          <div className="divide-y divide-forge-border">
            {topJobs === undefined ? (
              <p className="p-5 text-sm text-forge-muted">Loading the queue...</p>
            ) : topJobs.length === 0 ? (
              <p className="p-5 text-sm text-forge-muted">
                Nothing scored yet. Add a board on the Jobs page and run a scan.
              </p>
            ) : (
              topJobs.map((job) => (
                <Link
                  key={job.id}
                  href="/jobs"
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-forge-elevated"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{job.title}</p>
                    <p className="mt-0.5 truncate text-sm text-forge-muted">
                      {job.company} · {job.remote ? "Remote" : job.location || "Location not stated"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-forge-accent/40 bg-forge-accent-dim px-2.5 py-1 text-xs font-semibold text-forge-accent">
                    {job.fitScore}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Recent applications"
          action={
            <Link
              href="/applications"
              className="text-sm text-forge-accent hover:text-forge-accent-hover"
            >
              View all
            </Link>
          }
        >
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
        </Panel>
      </div>
    </AppShell>
  );
}
