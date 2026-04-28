"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { api } from "@convex/_generated/api";

export default function JobImportClient() {
  const router = useRouter();
  const profile = useQuery(api.profiles.getDefaultProfile);
  const upsertProfile = useMutation(api.profiles.upsertDefaultProfile);
  const importFromUrl = useAction(api.jobs.importFromUrl);
  const generateForJob = useAction(api.drafts.generateForJob);
  const [url, setUrl] = useState("");
  const [resumeSource, setResumeSource] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"idle" | "importing" | "generating">("idle");

  useEffect(() => {
    if (profile?.resumeText && !resumeSource) {
      setResumeSource(profile.resumeText);
    }
  }, [profile?.resumeText, resumeSource]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy("importing");

    try {
      const cleanResume = resumeSource.trim();
      if (!cleanResume) {
        throw new Error("Paste resume text first so we have something to tailor.");
      }

      await upsertProfile({ resumeText: cleanResume });
      const imported = await importFromUrl({ url });
      setBusy("generating");
      const generated = await generateForJob({
        jobImportId: imported.jobImportId,
        resumeSource: cleanResume,
      });

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
          <h1 className="mt-3 font-display text-4xl font-bold">Import a Greenhouse or Lever job</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-forge-muted">
            Paste the job URL, add your resume source, and GetDreamRole will create a reviewable packet.
          </p>
        </section>

        <form onSubmit={submit} className="rounded-lg border border-forge-border bg-forge-surface p-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-forge-muted" htmlFor="job-url">
                Job URL
              </label>
              <input
                id="job-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://boards.greenhouse.io/company/jobs/123456"
                className="mt-2 h-12 w-full rounded-lg border border-forge-border bg-forge-bg px-4 text-sm text-forge-text outline-none focus:border-forge-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forge-muted" htmlFor="resume-source">
                Resume source
              </label>
              <textarea
                id="resume-source"
                value={resumeSource}
                onChange={(event) => setResumeSource(event.target.value)}
                rows={14}
                placeholder="Paste your current resume text here."
                className="mt-2 w-full resize-y rounded-lg border border-forge-border bg-forge-bg px-4 py-3 text-sm leading-6 text-forge-text outline-none focus:border-forge-accent"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy !== "idle"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {busy === "importing"
                ? "Importing..."
                : busy === "generating"
                  ? "Generating..."
                  : "Generate application pack"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
