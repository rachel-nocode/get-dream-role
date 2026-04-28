"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Download, ExternalLink, Files, Save } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import {
  ApplicationStatus,
  StatusPill,
  applicationStatusOptions,
} from "@/components/app/StatusPill";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const tabs = ["summary", "resume", "cover", "questions", "submit"] as const;
type Tab = (typeof tabs)[number];

function tabLabel(tab: Tab) {
  return {
    summary: "Job",
    resume: "Resume",
    cover: "Cover letter",
    questions: "Answers",
    submit: "Submit",
  }[tab];
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-text hover:bg-forge-elevated"
    >
      <Files className="h-4 w-4" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ApplicationDetailClient({
  applicationId,
}: {
  applicationId: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const data = useQuery(api.applications.get, {
    applicationId: applicationId as Id<"applications">,
  });
  const markOpened = useMutation(api.applications.markOpened);
  const updateStatus = useMutation(api.applications.updateStatus);

  function downloadPacket() {
    if (!data?.draft || !data.job) return;

    const content = [
      `${data.job.title} at ${data.job.company}`,
      "",
      "RESUME",
      data.draft.optimizedResume,
      "",
      "COVER LETTER",
      data.draft.coverLetter,
      "",
      "ANSWERS",
      ...data.draft.answerDrafts.map(
        (answer) => `${answer.question}\n${answer.answer}`,
      ),
    ].join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "getdreamrole-application-pack.txt";
    link.click();
    URL.revokeObjectURL(href);
  }

  async function openApplyUrl() {
    if (!data?.job) return;
    await markOpened({ applicationId: applicationId as Id<"applications"> });
    window.open(data.job.applyUrl, "_blank", "noopener,noreferrer");
  }

  if (data === undefined) {
    return (
      <AppShell>
        <p className="text-sm text-forge-muted">Loading application...</p>
      </AppShell>
    );
  }

  if (data === null || !data.job) {
    return (
      <AppShell>
        <div className="rounded-lg border border-forge-border bg-forge-surface p-6">
          <p className="text-sm text-forge-muted">Application not found.</p>
        </div>
      </AppShell>
    );
  }

  const { application, job, draft } = data;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={application.status} />
              <span className="text-sm text-forge-muted">{job.source}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{job.title}</h1>
            <p className="mt-2 text-sm text-forge-muted">
              {job.company} · {job.location || "Remote/unspecified"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {draft ? (
              <button
                type="button"
                onClick={downloadPacket}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            ) : null}
            <button
              type="button"
              onClick={openApplyUrl}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
            >
              <ExternalLink className="h-4 w-4" />
              Open apply form
            </button>
          </div>
        </section>

        {draft ? (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <p className="text-sm text-forge-muted">Match score</p>
              <p className="mt-2 font-display text-3xl font-bold">{draft.matchScore}%</p>
            </div>
            <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <p className="text-sm text-forge-muted">ATS score</p>
              <p className="mt-2 font-display text-3xl font-bold">{draft.atsScore}%</p>
            </div>
            <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
              <p className="text-sm text-forge-muted">Questions</p>
              <p className="mt-2 font-display text-3xl font-bold">{job.questions.length}</p>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-forge-border bg-forge-surface">
          <div className="flex gap-2 overflow-x-auto border-b border-forge-border p-2">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-10 rounded-lg px-4 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-forge-accent text-forge-bg"
                    : "text-forge-muted hover:bg-forge-elevated hover:text-forge-text"
                }`}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "summary" ? (
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <h2 className="font-display text-xl font-semibold">Draft summary</h2>
                  <p className="mt-3 text-sm leading-6 text-forge-muted">
                    {draft?.summary ?? "Generate a draft from the import page to fill this in."}
                  </p>
                  {draft ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {draft.presentKeywords.slice(0, 10).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-forge-success/30 bg-forge-success/10 px-3 py-1 text-xs text-forge-success"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Job description</h2>
                  <pre className="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg border border-forge-border bg-forge-bg p-4 text-sm leading-6 text-forge-muted">
                    {job.description}
                  </pre>
                </div>
              </div>
            ) : null}

            {activeTab === "resume" ? (
              draft ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold">Tailored resume</h2>
                    <CopyButton value={draft.optimizedResume} />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg border border-forge-border bg-forge-bg p-4 text-sm leading-6 text-forge-text">
                    {draft.optimizedResume}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-forge-muted">No resume draft yet.</p>
              )
            ) : null}

            {activeTab === "cover" ? (
              draft ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold">Cover letter</h2>
                    <CopyButton value={draft.coverLetter} />
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg border border-forge-border bg-forge-bg p-4 text-sm leading-6 text-forge-text">
                    {draft.coverLetter}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-forge-muted">No cover letter draft yet.</p>
              )
            ) : null}

            {activeTab === "questions" ? (
              draft?.answerDrafts.length ? (
                <div className="space-y-4">
                  {draft.answerDrafts.map((answer) => (
                    <div key={answer.question} className="rounded-lg border border-forge-border bg-forge-bg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{answer.question}</p>
                          <p className="mt-1 text-xs text-forge-muted">
                            {answer.required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <CopyButton value={answer.answer} />
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-forge-text">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-forge-muted">
                  No custom questions were exposed for this posting.
                </p>
              )
            ) : null}

            {activeTab === "submit" ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <h2 className="font-display text-xl font-semibold">Assisted submit</h2>
                  <p className="mt-3 text-sm leading-6 text-forge-muted">
                    Copy the pieces you want, open the native ATS form, then mark the application when it is done.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {draft ? <CopyButton value={draft.optimizedResume} /> : null}
                    {draft ? <CopyButton value={draft.coverLetter} /> : null}
                    <button
                      type="button"
                      onClick={openApplyUrl}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-forge-accent px-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open form
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-forge-border bg-forge-bg p-4">
                  <label className="block text-sm font-semibold text-forge-muted" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    value={application.status}
                    onChange={(event) =>
                      updateStatus({
                        applicationId: application._id,
                        status: event.target.value as ApplicationStatus,
                      })
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text outline-none focus:border-forge-accent"
                  >
                    {applicationStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus({
                        applicationId: application._id,
                        status: "submitted",
                      })
                    }
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 text-sm font-semibold text-forge-success hover:bg-forge-success/15"
                  >
                    <Save className="h-4 w-4" />
                    Mark submitted
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
