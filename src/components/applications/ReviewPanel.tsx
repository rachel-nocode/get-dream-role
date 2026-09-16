"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import { NEEDS_ANSWER } from "@convex/ai/tailor";
import type { FlaggedClaim, GapEntry, NeedsHumanEntry } from "@convex/validators";

export type ClaimResolution = "confirmed" | "rejected";

function ClaimRow({
  claim,
  busy,
  onResolve,
}: {
  claim: FlaggedClaim;
  busy: boolean;
  onResolve: (status: ClaimResolution) => Promise<void>;
}) {
  return (
    <li className="rounded-lg border border-forge-border bg-forge-bg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold break-words">{claim.text}</p>
          <p className="mt-1 text-sm leading-6 text-forge-muted">{claim.reason}</p>
        </div>

        {claim.status === "pending" ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onResolve("confirmed")}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-forge-success/40 bg-forge-success/10 px-3 text-sm font-semibold text-forge-success hover:bg-forge-success/15 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              True
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onResolve("rejected")}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-forge-danger/40 bg-forge-danger/10 px-3 text-sm font-semibold text-forge-danger hover:bg-forge-danger/15 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Not mine
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wide text-forge-muted">
            {claim.status === "confirmed" ? "Confirmed by you" : "Rejected"}
          </span>
        )}
      </div>
    </li>
  );
}

function GapRow({ gap }: { gap: GapEntry }) {
  return (
    <li className="rounded-lg border border-forge-border bg-forge-bg p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            gap.severity === "required"
              ? "border-forge-danger/40 bg-forge-danger/10 text-forge-danger"
              : "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
          )}
        >
          {gap.severity === "required" ? "Required" : "Preferred"}
        </span>
        <p className="font-semibold">{gap.requirement}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-forge-muted">
        The posting asks for this. Your profile does not show it. {gap.suggestion}
      </p>
    </li>
  );
}

function NeedsHumanRow({
  entry,
  answer,
  busy,
  onAnswer,
  onRedraft,
}: {
  entry: NeedsHumanEntry;
  answer: Doc<"applicationDrafts">["answerDrafts"][number] | undefined;
  busy: boolean;
  onAnswer: (sourceKey: string, value: string) => Promise<void>;
  onRedraft: () => Promise<void>;
}) {
  const sourceKey = answer?.sourceKey;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceKey) return;
    const value = String(new FormData(event.currentTarget).get("answer") ?? "").trim();
    if (value.length === 0) return;
    await onAnswer(sourceKey, value);
  }

  return (
    <li className="rounded-lg border border-forge-border bg-forge-bg p-4">
      <p className="font-semibold">{entry.question}</p>
      <p className="mt-1 text-sm text-forge-muted">{entry.reason}</p>

      {sourceKey ? (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            name="answer"
            defaultValue=""
            aria-label={entry.question}
            placeholder="Your answer, in your own words."
            className="h-11 w-full rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text outline-none focus:border-forge-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save and redraft"}
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onRedraft}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:opacity-60"
        >
          {busy ? "Working..." : "Draft this answer again"}
        </button>
      )}
    </li>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
        {icon}
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-3">{children}</ul>
    </section>
  );
}

/**
 * Everything standing between a draft and the user's approval: claims the
 * verifier could not tie to the profile, gaps the posting leaves open, the
 * questions only they can answer, and whatever the checks reported.
 */
export default function ReviewPanel({
  draft,
  onResolveClaim,
  onAnswer,
  onRedraft,
  onApprove,
}: {
  draft: Doc<"applicationDrafts">;
  onResolveClaim: (claimId: string, status: ClaimResolution) => Promise<void>;
  onAnswer: (question: string, sourceKey: string, value: string) => Promise<void>;
  onRedraft: (question: string) => Promise<void>;
  onApprove: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const claims = draft.flaggedClaims ?? [];
  const gaps = draft.gaps ?? [];
  const issues = draft.verifierReport?.issues ?? [];
  const answerFor = (question: string) =>
    draft.answerDrafts.find((entry) => entry.question === question);
  const openQuestions = (draft.needsHuman ?? []).filter(
    (entry) => answerFor(entry.question)?.answer.trim() === NEEDS_ANSWER,
  );
  const pending = claims.filter((claim) => claim.status === "pending");

  const blockers = [
    pending.length > 0
      ? `${pending.length} flagged claim${pending.length === 1 ? "" : "s"} to settle`
      : "",
    openQuestions.length > 0
      ? `${openQuestions.length} question${openQuestions.length === 1 ? "" : "s"} only you can answer`
      : "",
  ].filter((entry) => entry.length > 0);

  async function run(key: string, task: () => Promise<void>) {
    setBusy(key);
    try {
      await task();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={`Claims to confirm (${pending.length})`}
        icon={<ShieldAlert className="h-5 w-5 text-forge-warning" />}
      >
        {claims.length === 0 ? (
          <li className="text-sm text-forge-muted">
            Nothing was added that your profile does not already say.
          </li>
        ) : (
          claims.map((claim) => (
            <ClaimRow
              key={claim.id}
              claim={claim}
              busy={busy === claim.id}
              onResolve={(status) => run(claim.id, () => onResolveClaim(claim.id, status))}
            />
          ))
        )}
      </Section>

      <Section
        title={`Gaps (${gaps.length})`}
        icon={<AlertTriangle className="h-5 w-5 text-forge-muted" />}
      >
        {gaps.length === 0 ? (
          <li className="text-sm text-forge-muted">
            Your profile covers everything the posting asks for.
          </li>
        ) : (
          gaps.map((gap) => <GapRow key={gap.requirement} gap={gap} />)
        )}
      </Section>

      {openQuestions.length > 0 ? (
        <Section
          title={`Your answers (${openQuestions.length})`}
          icon={<AlertTriangle className="h-5 w-5 text-forge-warning" />}
        >
          {openQuestions.map((entry) => (
            // Remounts once the answer is saved so the field clears itself.
            <NeedsHumanRow
              key={`${entry.question}-${answerFor(entry.question)?.answer ?? ""}`}
              entry={entry}
              answer={answerFor(entry.question)}
              busy={busy === entry.question}
              onAnswer={(sourceKey, value) =>
                run(entry.question, () => onAnswer(entry.question, sourceKey, value))
              }
              onRedraft={() => run(entry.question, () => onRedraft(entry.question))}
            />
          ))}
        </Section>
      ) : null}

      {issues.length > 0 ? (
        <Section
          title={`Verifier notes (${issues.length})`}
          icon={<ShieldAlert className="h-5 w-5 text-forge-muted" />}
        >
          {issues.map((issue) => (
            <li key={issue} className="text-sm leading-6 text-forge-muted">
              {issue}
            </li>
          ))}
        </Section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-forge-border pt-5">
        <button
          type="button"
          disabled={blockers.length > 0 || busy !== null || draft.approvedAt !== undefined}
          title={blockers.length > 0 ? `Left to do: ${blockers.join(", ")}` : undefined}
          onClick={() => run("approve", onApprove)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          {draft.approvedAt === undefined ? "Approve this application" : "Approved"}
        </button>
        <p className="text-sm text-forge-muted">
          {draft.approvedAt !== undefined
            ? `Approved ${new Date(draft.approvedAt).toLocaleDateString()}.`
            : blockers.length > 0
              ? `Left to do: ${blockers.join(", ")}.`
              : "Everything checks out against your profile."}
        </p>
      </div>
    </div>
  );
}
