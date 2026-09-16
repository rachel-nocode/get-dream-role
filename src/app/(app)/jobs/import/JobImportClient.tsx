"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { PIPELINE_STEPS } from "@/components/applications/GenerateBar";
import { api } from "@convex/_generated/api";
import {
  PROVIDERS,
  estimateCostPerApplication,
  findModel,
  formatUsd,
} from "@convex/ai/providers";

export default function JobImportClient() {
  const router = useRouter();
  const profile = useQuery(api.careerProfile.get);
  const model = useQuery(api.aiSettings.resolvedModel);
  const importFromUrl = useAction(api.jobs.importFromUrl);
  const generateApplyKit = useAction(api.ai.draftActions.generateApplyKit);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"idle" | "importing" | "generating">("idle");

  const confirmed = profile?.confirmedAt !== undefined;

  function costLine() {
    if (model === undefined) return "Checking which model you are on...";
    const info = findModel(model.provider, model.model);
    const label = `${PROVIDERS[model.provider].label} ${info?.label ?? model.model}`;
    if (!info) return `Runs on ${label}.`;
    return `≈ ${formatUsd(estimateCostPerApplication(info))} on ${label}${
      model.usingHouseKey ? ", the shared trial key" : ""
    }.`;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy("importing");

    try {
      const url = String(new FormData(event.currentTarget).get("url") ?? "");
      const imported = await importFromUrl({ url });

      // Without a confirmed profile there is nothing honest to tailor from,
      // so the posting is saved and the user picks it up on its own page.
      if (!confirmed) {
        router.push(`/applications/${imported.applicationId}`);
        return;
      }

      setBusy("generating");
      const generated = await generateApplyKit({ jobImportId: imported.jobImportId });
      router.push(`/applications/${generated.applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import that job.");
      setBusy("idle");
    }
  }

  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
            New application
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold">Import a job by URL</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-forge-muted">
            Supports Greenhouse, Lever and Ashby job URLs. Everything the apply kit claims comes
            from your confirmed master profile, so there is no resume to paste here.
          </p>
          <p className="mt-3 text-sm text-forge-muted">{costLine()}</p>
          <Link
            href="/jobs"
            className="mt-4 inline-flex text-sm text-forge-accent hover:text-forge-accent-hover"
          >
            Or browse jobs discovery found for you
          </Link>
        </section>

        <form onSubmit={submit} className="rounded-lg border border-forge-border bg-forge-surface p-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-forge-muted" htmlFor="job-url">
                Job URL
              </label>
              <input
                id="job-url"
                name="url"
                type="url"
                placeholder="https://boards.greenhouse.io/company/jobs/123456"
                className="mt-2 h-12 w-full rounded-lg border border-forge-border bg-forge-bg px-4 text-sm text-forge-text outline-none focus:border-forge-accent"
                required
              />
            </div>

            {profile !== undefined && !confirmed ? (
              <p className="rounded-lg border border-forge-warning/30 bg-forge-warning/10 px-4 py-3 text-sm text-forge-warning">
                Confirm your master profile first.{" "}
                <Link href="/profile" className="font-semibold underline">
                  Go to your profile
                </Link>
                .
              </p>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
                {error}{" "}
                {error.toLowerCase().includes("profile") ? (
                  <Link href="/profile" className="font-semibold underline">
                    Go to your profile
                  </Link>
                ) : null}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy !== "idle"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {busy === "importing"
                ? "Importing the posting..."
                : busy === "generating"
                  ? `${PIPELINE_STEPS[0]}...`
                  : "Import and tailor"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
