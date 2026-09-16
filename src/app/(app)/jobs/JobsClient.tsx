"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { LinkIcon, RefreshCw, Sparkles } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import JobCard from "@/components/jobs/JobCard";
import QueueTabs, { type QueueTab } from "@/components/jobs/QueueTabs";
import SourcesPanel from "@/components/jobs/SourcesPanel";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PROVIDERS, estimateScoringCost, findModel, formatUsd } from "@convex/ai/providers";
import { DEFAULT_SCORE_BATCH } from "@convex/discovery/prefilter";
import type { JobSourceKind } from "@convex/validators";

export default function JobsClient() {
  const router = useRouter();
  const [tab, setTab] = useState<QueueTab>("new");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState<"scan" | "score" | null>(null);

  const sources = useQuery(api.discovery.sources.list);
  const stats = useQuery(api.discovery.jobs.stats);
  const jobs = useQuery(api.discovery.jobs.list, { status: tab });
  const profile = useQuery(api.careerProfile.get);
  const model = useQuery(api.aiSettings.resolvedModel);

  const scanSources = useAction(api.discovery.actions.scanSources);
  const scoreJobs = useAction(api.discovery.actions.scoreJobs);
  const addSource = useMutation(api.discovery.sources.add);
  const toggleSource = useMutation(api.discovery.sources.toggle);
  const removeSource = useMutation(api.discovery.sources.remove);
  const setStatus = useMutation(api.discovery.jobs.setStatus);
  const importToApplication = useMutation(api.discovery.jobs.importToApplication);

  const counts = {
    new: stats?.new ?? 0,
    scored: stats?.scored ?? 0,
    saved: stats?.saved ?? 0,
    dismissed: stats?.dismissed ?? 0,
  };
  const profileConfirmed = profile?.confirmedAt !== undefined;

  async function guard(task: () => Promise<string>) {
    setNotice("");
    setError("");
    try {
      setNotice(await task());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function run(kind: "scan" | "score", task: () => Promise<string>) {
    setRunning(kind);
    await guard(task);
    setRunning(null);
  }

  function scoringCostLine() {
    if (model === undefined) return "Checking which model you are on...";
    const info = findModel(model.provider, model.model);
    const name = `${PROVIDERS[model.provider].label} ${info?.label ?? model.model}`;
    if (!info) return `Scores up to ${DEFAULT_SCORE_BATCH} jobs on ${name}.`;
    return `≈ ${formatUsd(estimateScoringCost(info, DEFAULT_SCORE_BATCH))} for ${DEFAULT_SCORE_BATCH} jobs on ${name}`;
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
              Discovery
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold">Jobs worth your time</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-forge-muted">
              A scan pulls postings from the boards and feeds you watch and scores them for free
              against your preferences. Only the postings that survive that go to a model.
            </p>
          </div>
          <Link
            href="/jobs/import"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
          >
            <LinkIcon className="h-4 w-4" />
            Paste a job URL
          </Link>
        </section>

        {error ? (
          <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 py-3 text-sm text-forge-success">
            {notice}
          </p>
        ) : null}

        <SourcesPanel
          sources={sources ?? []}
          onAdd={(kind: JobSourceKind, identifier: string) =>
            guard(async () => {
              await addSource({ kind, identifier });
              return "Source added. Scan when you are ready.";
            })
          }
          onToggle={(sourceId: Id<"jobSources">) =>
            guard(async () => {
              const enabled = await toggleSource({ sourceId });
              return enabled ? "Source enabled." : "Source paused.";
            })
          }
          onRemove={(sourceId: Id<"jobSources">) =>
            guard(async () => {
              const { cleared } = await removeSource({ sourceId });
              return `Source removed. ${cleared} untouched job${cleared === 1 ? "" : "s"} cleared.`;
            })
          }
        />

        <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Run discovery</h2>
              <p className="mt-2 text-sm text-forge-muted">
                Scanning is free. Scoring reads your profile and the posting, and costs{" "}
                {scoringCostLine()}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={running !== null}
                onClick={() =>
                  run("scan", async () => {
                    const result = await scanSources({});
                    const failures = result.errors
                      .map((entry) => `${entry.label}: ${entry.message}`)
                      .join(" ");
                    return `Scanned ${result.scanned} postings · ${result.inserted} new · ${result.updated} updated.${
                      failures ? ` Problems: ${failures}` : ""
                    }`;
                  })
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                {running === "scan" ? "Scanning..." : "Scan now"}
              </button>
              <button
                type="button"
                disabled={running !== null}
                onClick={() =>
                  run("score", async () => {
                    const result = await scoreJobs({ limit: DEFAULT_SCORE_BATCH });
                    const skipped =
                      result.skippedForBudget > 0
                        ? ` ${result.skippedForBudget} left for tomorrow: today's scoring budget is spent.`
                        : "";
                    return `Scored ${result.scored} job${result.scored === 1 ? "" : "s"} for ${formatUsd(
                      result.costUsd,
                    )}.${skipped}`;
                  })
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {running === "score" ? "Scoring..." : "Score top jobs"}
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <QueueTabs active={tab} counts={counts} onSelect={setTab} />

          {jobs === undefined ? (
            <p className="text-sm text-forge-muted">Loading the queue...</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <p className="text-sm text-forge-muted">
                Nothing in this tab yet. Add a board or feed above, run a scan, then score the
                postings that survive the free pre-filter.
              </p>
              {profileConfirmed ? null : (
                <p className="mt-3 text-sm text-forge-muted">
                  Scoring needs your target titles, locations and salary floor.{" "}
                  <Link
                    href="/profile"
                    className="text-forge-accent hover:text-forge-accent-hover"
                  >
                    Confirm your profile
                  </Link>{" "}
                  first.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onSave={() =>
                    guard(async () => {
                      await setStatus({ id: job._id, status: "saved" });
                      return `Saved ${job.title}.`;
                    })
                  }
                  onDismiss={() =>
                    guard(async () => {
                      await setStatus({ id: job._id, status: "dismissed" });
                      return `Dismissed ${job.title}.`;
                    })
                  }
                  onImport={() =>
                    guard(async () => {
                      const result = await importToApplication({ discoveredJobId: job._id });
                      router.push(`/applications/${result.applicationId}`);
                      return `Apply kit started for ${job.title}.`;
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
