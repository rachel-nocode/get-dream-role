"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { Download, ExternalLink } from "lucide-react";
import AnswersPanel from "@/components/applications/AnswersPanel";
import CopyButton from "@/components/applications/CopyButton";
import GenerateBar from "@/components/applications/GenerateBar";
import ResumeDiff from "@/components/applications/ResumeDiff";
import ReviewPanel, { type ClaimResolution } from "@/components/applications/ReviewPanel";
import SubmitPanel from "@/components/applications/SubmitPanel";
import AppShell from "@/components/app/AppShell";
import { ApplicationStatus, StatusPill } from "@/components/app/StatusPill";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PROVIDERS, findModel, formatUsd } from "@convex/ai/providers";
import { NEEDS_ANSWER, buildFactRegistry, factTextById } from "@convex/ai/tailor";

const TAB_LABELS = {
  review: "Review",
  summary: "Job",
  resume: "Resume",
  cover: "Cover letter",
  questions: "Answers",
  submit: "Submit",
} as const;

type Tab = keyof typeof TAB_LABELS;

const TABS = Object.keys(TAB_LABELS) as Tab[];

type Draft = Doc<"applicationDrafts">;

/** Claims and questions the user still has to settle before approval. */
function openItemCount(draft: Draft): number {
  const pending = (draft.flaggedClaims ?? []).filter((claim) => claim.status === "pending").length;
  const unanswered = (draft.needsHuman ?? []).filter(
    (entry) =>
      draft.answerDrafts.find((answer) => answer.question === entry.question)?.answer.trim() ===
      NEEDS_ANSWER,
  ).length;

  return pending + unanswered;
}

function costLine(draft: Draft): string | null {
  if (!draft.provider || !draft.model) return null;

  const model = findModel(draft.provider, draft.model);
  const tokens = (draft.inputTokens ?? 0) + (draft.outputTokens ?? 0);

  return `Generated with ${PROVIDERS[draft.provider].label} ${model?.label ?? draft.model} · ${tokens.toLocaleString(
    "en-US",
  )} tokens · ${formatUsd(draft.costUsd ?? 0)}`;
}

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <p className="text-sm text-forge-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function ApplicationDetailClient({ applicationId }: { applicationId: string }) {
  const [chosenTab, setChosenTab] = useState<Tab | null>(null);
  const [error, setError] = useState("");

  const data = useQuery(api.applications.get, {
    applicationId: applicationId as Id<"applications">,
  });
  const profile = useQuery(api.careerProfile.get);
  const estimate = useQuery(
    api.drafts.estimate,
    data?.job ? { jobImportId: data.job._id } : "skip",
  );

  const generateApplyKit = useAction(api.ai.draftActions.generateApplyKit);
  const regenerateAnswer = useAction(api.ai.draftActions.regenerateAnswer);
  const resolveClaim = useMutation(api.drafts.resolveClaim);
  const approve = useMutation(api.drafts.approve);
  const updateAnswer = useMutation(api.careerProfile.updateAnswer);
  const markOpened = useMutation(api.applications.markOpened);
  const updateStatus = useMutation(api.applications.updateStatus);

  async function guard(task: () => Promise<unknown>) {
    setError("");
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
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
  const openItems = draft ? openItemCount(draft) : 0;
  const tabs = TABS.filter((tab) => tab !== "review" || draft !== null);
  const activeTab = chosenTab ?? (draft && openItems > 0 ? "review" : "summary");
  const factText = profile ? factTextById(buildFactRegistry(profile)) : {};
  const profileConfirmed = profile?.confirmedAt !== undefined;

  function downloadPacket() {
    if (!draft) return;

    const content = [
      `${job.title} at ${job.company}`,
      "",
      "RESUME",
      draft.optimizedResume,
      "",
      "COVER LETTER",
      draft.coverLetter,
      "",
      "ANSWERS",
      ...draft.answerDrafts.map((answer) => `${answer.question}\n${answer.answer}`),
    ].join("\n\n");

    const href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = "getdreamrole-application-pack.txt";
    link.click();
    URL.revokeObjectURL(href);
  }

  async function openApplyUrl() {
    await markOpened({ applicationId: applicationId as Id<"applications"> });
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
  }

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
            {draft && costLine(draft) ? (
              <p className="mt-2 text-xs text-forge-muted">{costLine(draft)}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <GenerateBar
              estimate={estimate ?? null}
              hasDraft={draft !== null}
              onGenerate={() => guard(() => generateApplyKit({ jobImportId: job._id }))}
            />
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
              onClick={() => guard(openApplyUrl)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
            >
              <ExternalLink className="h-4 w-4" />
              Open apply form
            </button>
          </div>
        </section>

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

        {draft ? (
          <section className="grid gap-4 md:grid-cols-3">
            <ScoreCard label="Requirements covered" value={`${draft.matchScore}%`} />
            <ScoreCard label="ATS readiness" value={`${draft.atsScore}%`} />
            <ScoreCard label="Left to review" value={String(openItems)} />
          </section>
        ) : (
          <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <h2 className="font-display text-2xl font-semibold">No apply kit yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-forge-muted">
              Generating reads this posting, matches each requirement to a fact in your profile,
              then rewrites your own bullets around the ones that match.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-forge-muted">
              Nothing is invented: anything the draft adds that your profile does not support comes
              back to you as a claim to confirm or reject.
            </p>
            {profileConfirmed ? null : (
              <p className="mt-3 text-sm text-forge-muted">
                Your master profile is not confirmed yet.{" "}
                <Link href="/profile" className="text-forge-accent hover:text-forge-accent-hover">
                  Confirm it first
                </Link>
                .
              </p>
            )}
          </section>
        )}

        <section className="rounded-lg border border-forge-border bg-forge-surface">
          <div className="flex gap-2 overflow-x-auto border-b border-forge-border p-2">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setChosenTab(tab)}
                className={`h-10 shrink-0 rounded-lg px-4 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-forge-accent text-forge-bg"
                    : "text-forge-muted hover:bg-forge-elevated hover:text-forge-text"
                }`}
              >
                {TAB_LABELS[tab]}
                {tab === "review" && openItems > 0 ? ` (${openItems})` : ""}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "review" && draft ? (
              <ReviewPanel
                draft={draft}
                onResolveClaim={(claimId: string, status: ClaimResolution) =>
                  guard(() => resolveClaim({ draftId: draft._id, claimId, status }))
                }
                onAnswer={(question: string, sourceKey: string, value: string) =>
                  guard(async () => {
                    await updateAnswer({ key: sourceKey, answer: value });
                    await regenerateAnswer({ draftId: draft._id, question });
                  })
                }
                onRedraft={(question: string) =>
                  guard(() => regenerateAnswer({ draftId: draft._id, question }))
                }
                onApprove={() => guard(() => approve({ draftId: draft._id }))}
              />
            ) : null}

            {activeTab === "summary" ? (
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <h2 className="font-display text-xl font-semibold">Tailored summary</h2>
                  <p className="mt-3 text-sm leading-6 text-forge-muted">
                    {draft?.summary || "Generate the apply kit to fill this in."}
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
                <ResumeDiff
                  changeLog={draft.changeLog ?? []}
                  factText={factText}
                  resumeText={draft.optimizedResume}
                />
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
              <AnswersPanel answers={draft?.answerDrafts ?? []} />
            ) : null}

            {activeTab === "submit" ? (
              <SubmitPanel
                status={application.status}
                resumeText={draft?.optimizedResume}
                coverLetter={draft?.coverLetter}
                onOpenApply={() => guard(openApplyUrl)}
                onStatusChange={(status: ApplicationStatus) =>
                  guard(() => updateStatus({ applicationId: application._id, status }))
                }
              />
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
