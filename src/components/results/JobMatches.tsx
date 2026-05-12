"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import type { AnalysisResult, MatchedJob } from "@/lib/types";

type JobMatchResponse = {
  query: string;
  jobs: MatchedJob[];
};

function formatSalary(job: MatchedJob) {
  if (job.salaryMin === null && job.salaryMax === null) return null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: job.salaryCurrency ?? "USD",
    maximumFractionDigits: 0,
  });

  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${formatter.format(job.salaryMin)}-${formatter.format(job.salaryMax)}`;
  }

  return formatter.format(job.salaryMin ?? job.salaryMax ?? 0);
}

function formatPostedAt(value: string | null) {
  if (!value) return null;

  const posted = new Date(value);
  if (Number.isNaN(posted.getTime())) return null;

  const days = Math.max(0, Math.round((Date.now() - posted.getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function snippet(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= 230) return clean;
  return `${clean.slice(0, 230).trim()}...`;
}

export default function JobMatches({ result }: { result: AnalysisResult }) {
  const [data, setData] = useState<JobMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optimizedResume: result.optimizedResume,
          jobTitle: result.jobTitle,
          keywords: [
            ...result.presentKeywords,
            ...result.suggestedKeywords,
            ...result.missingKeywords,
          ],
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Could not load job matches.");
      }

      setData(body as JobMatchResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load job matches.");
    } finally {
      setLoading(false);
    }
  }, [result]);

  useEffect(() => {
    if (data === null && !loading && !error) {
      loadJobs();
    }
  }, [data, error, loadJobs, loading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-forge-text">
            Matched Jobs
          </h2>
          <p className="mt-2 text-sm leading-6 text-forge-muted">
            {data?.query ? `Search: ${data.query}` : "Searching from your optimized resume"}
          </p>
        </div>
        <button
          type="button"
          onClick={loadJobs}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-forge-border bg-forge-elevated px-4 text-sm font-medium text-forge-text transition-colors hover:border-forge-border-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {loading && data === null ? (
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-forge-border bg-forge-surface">
          <div className="flex items-center gap-3 text-sm text-forge-muted">
            <Loader2 className="h-5 w-5 animate-spin text-forge-accent" />
            Finding jobs...
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-forge-danger/30 bg-forge-danger/5 p-5 text-sm text-forge-danger">
          {error}
        </div>
      ) : null}

      {!loading && !error && data?.jobs.length === 0 ? (
        <div className="rounded-xl border border-forge-border bg-forge-surface p-6 text-sm text-forge-muted">
          No matching jobs found yet.
        </div>
      ) : null}

      {data?.jobs.length ? (
        <div className="grid gap-4">
          {data.jobs.map((job) => {
            const salary = formatSalary(job);
            const postedAt = formatPostedAt(job.postedAt);

            return (
              <article
                key={job.id}
                className="rounded-xl border border-forge-border bg-forge-surface p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-forge-accent/20 bg-forge-accent/10 px-3 py-1 text-xs font-semibold text-forge-accent">
                        {job.matchScore}% match
                      </span>
                      {job.isRemote ? (
                        <span className="rounded-full border border-forge-success/20 bg-forge-success/10 px-3 py-1 text-xs font-semibold text-forge-success">
                          Remote
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-forge-text">
                      {job.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-forge-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {postedAt ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {postedAt}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg transition-colors hover:bg-forge-accent-hover"
                  >
                    Apply
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <p className="mt-4 text-sm leading-6 text-forge-muted">
                  {snippet(job.description)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.matchedKeywords.slice(0, 8).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-forge-success/20 bg-forge-success/10 px-3 py-1 text-xs text-forge-success"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-forge-muted">
                  {job.employmentType ? <span>{job.employmentType}</span> : null}
                  {salary ? <span>{salary}</span> : null}
                  {job.missingKeywords.length ? (
                    <span>Gaps: {job.missingKeywords.slice(0, 3).join(", ")}</span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}
