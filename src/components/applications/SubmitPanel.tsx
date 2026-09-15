"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  Download,
  ExternalLink,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import {
  STATUS_LABELS,
  hasApplied,
  isManualStatus,
  type ManualStatus,
  type PipelineStatus,
} from "@convex/lib/status";
import { applicationStatusOptions } from "@/components/app/StatusPill";
import {
  downloadTextFile,
  fileNameFor,
  resumeToMarkdown,
} from "@/lib/resumeExport";
import AnswersPanel from "./AnswersPanel";
import CopyButton from "./CopyButton";

export const SAFETY_NOTE =
  "GetDreamRole never submits for you. Applying from your own browser keeps you off the fraud filters that flag bots.";

const SNOOZE_DAYS = 3;

const CHECKLIST = [
  { id: "claims", label: "I reviewed every flagged claim" },
  { id: "questions", label: "I answered every needs-human question" },
  { id: "self", label: "I am submitting this myself in my browser" },
] as const;

type CheckId = (typeof CHECKLIST)[number]["id"];
type Checklist = Record<CheckId, boolean>;

const EMPTY_CHECKLIST: Checklist = { claims: false, questions: false, self: false };

export type FollowupEmail = { subject: string; body: string };

export type Tracking = {
  nextActionAt: number | null;
  nextActionLabel: string | null;
  followupCount: number;
  notes: string;
};

export type SubmitBudget = {
  submittedToday: number;
  dailyCap: number;
  remaining: number;
};

function answersAsText(answers: Doc<"applicationDrafts">["answerDrafts"]): string {
  return answers.map((answer) => `${answer.question}\n${answer.answer}`).join("\n\n");
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Heading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {hint ? <p className="mt-1 text-sm leading-6 text-forge-muted">{hint}</p> : null}
    </div>
  );
}

function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-text hover:bg-forge-elevated"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}

function Downloads({ company, draft }: { company: string; draft: Doc<"applicationDrafts"> }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading
        title="Downloads"
        hint="Plain text and Markdown, so nothing you paste carries hidden formatting."
      />
      <div className="flex flex-wrap gap-2">
        <DownloadButton
          label="Resume .txt"
          onClick={() =>
            downloadTextFile(
              fileNameFor(company, "resume", "txt"),
              draft.optimizedResume,
              "text/plain",
            )
          }
        />
        <DownloadButton
          label="Resume .md"
          onClick={() =>
            downloadTextFile(
              fileNameFor(company, "resume", "md"),
              resumeToMarkdown(draft.optimizedResume),
              "text/markdown",
            )
          }
        />
        <DownloadButton
          label="Cover letter .txt"
          onClick={() =>
            downloadTextFile(
              fileNameFor(company, "cover-letter", "txt"),
              draft.coverLetter,
              "text/plain",
            )
          }
        />
      </div>
    </section>
  );
}

function Questions({ draft }: { draft: Doc<"applicationDrafts"> }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Heading
          title="Screening questions"
          hint="Each answer says where it came from. Copy them into the employer's form."
        />
        {draft.answerDrafts.length > 0 ? (
          <CopyButton value={answersAsText(draft.answerDrafts)} label="Copy all answers" />
        ) : null}
      </div>
      <AnswersPanel answers={draft.answerDrafts} />
    </section>
  );
}

/** Three things to be true before an application leaves the building. */
function PreSubmitChecklist({ onChange }: { onChange: (id: CheckId, value: boolean) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-forge-muted">Before you submit</legend>
      {CHECKLIST.map((item) => (
        <label key={item.id} className="flex items-start gap-3 text-sm text-forge-text">
          <input
            type="checkbox"
            name={item.id}
            onChange={(event) => onChange(item.id, event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-forge-accent"
          />
          {item.label}
        </label>
      ))}
    </fieldset>
  );
}

function NotesBox({
  notes,
  onAddNote,
}: {
  notes: string;
  onAddNote: (text: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = String(new FormData(event.currentTarget).get("note") ?? "").trim();
    if (text.length === 0) return;

    setError("");
    setSaving(true);
    try {
      await onAddNote(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-forge-muted" htmlFor="application-note">
        Notes
      </label>
      <textarea
        id="application-note"
        name="note"
        key={notes}
        defaultValue={notes}
        rows={3}
        placeholder="Who you spoke to, what they asked, what you promised to send."
        className="w-full rounded-lg border border-forge-border bg-forge-bg p-3 text-sm leading-6 text-forge-text outline-none focus:border-forge-accent"
      />
      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Saving..." : "Save note"}
      </button>
      {error ? <p className="text-sm text-forge-danger">{error}</p> : null}
    </form>
  );
}

function FollowupSection({
  tracking,
  latestFollowup,
  onDraftFollowup,
  onSnooze,
  onAddNote,
}: {
  tracking: Tracking;
  latestFollowup: FollowupEmail | null;
  onDraftFollowup: () => Promise<void>;
  onSnooze: (days: number) => Promise<void>;
  onAddNote: (text: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<"draft" | "snooze" | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "draft" | "snooze", task: () => Promise<void>) {
    setError("");
    setBusy(kind);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-forge-border bg-forge-bg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Heading
          title="Follow up"
          hint={
            tracking.nextActionAt === null
              ? "Nothing scheduled. Two follow-ups is the polite maximum."
              : `${tracking.nextActionLabel ?? "Follow up"} on ${formatDate(tracking.nextActionAt)}.`
          }
        />
        <span className="text-xs text-forge-muted">
          {tracking.followupCount} of 2 drafted
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("draft", onDraftFollowup)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          {busy === "draft" ? "Drafting..." : "Draft follow-up email"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("snooze", () => onSnooze(SNOOZE_DAYS))}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:opacity-60"
        >
          <CalendarClock className="h-4 w-4" />
          Snooze {SNOOZE_DAYS} days
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-3 py-2 text-sm text-forge-danger">
          {error}
        </p>
      ) : null}

      {latestFollowup ? (
        <div className="rounded-lg border border-forge-border bg-forge-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="font-semibold break-words">{latestFollowup.subject}</p>
            <div className="flex gap-2">
              <CopyButton value={latestFollowup.subject} label="Copy subject" />
              <CopyButton value={latestFollowup.body} label="Copy body" />
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-forge-text">
            {latestFollowup.body}
          </p>
        </div>
      ) : null}

      <NotesBox notes={tracking.notes} onAddNote={onAddNote} />
    </section>
  );
}

function MarkSubmitted({
  draft,
  budget,
  onMarkSubmitted,
}: {
  draft: Doc<"applicationDrafts"> | null;
  budget: SubmitBudget | null;
  onMarkSubmitted: () => Promise<void>;
}) {
  const [checks, setChecks] = useState<Checklist>(EMPTY_CHECKLIST);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const approved = draft?.approvedAt !== undefined;
  const allChecked = CHECKLIST.every((item) => checks[item.id]);
  const ready = approved && allChecked && !saving;

  async function submit() {
    setError("");
    setSaving(true);
    try {
      await onMarkSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-forge-border bg-forge-bg p-4">
      <PreSubmitChecklist
        onChange={(id, value) => setChecks((current) => ({ ...current, [id]: value }))}
      />

      <button
        type="button"
        disabled={!ready}
        onClick={submit}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 text-sm font-semibold text-forge-success hover:bg-forge-success/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Recording..." : "Mark submitted"}
      </button>

      <p className="text-xs text-forge-muted">
        {budget === null
          ? "Checking today's budget..."
          : `${budget.remaining} of ${budget.dailyCap} left today.`}
        {approved ? "" : " Approve the draft in Review first."}
      </p>

      {error ? (
        <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-3 py-2 text-sm text-forge-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Moves that do not need a cap check, for when the employer replies. */
function StatusControl({
  status,
  onStatusChange,
}: {
  status: PipelineStatus;
  onStatusChange: (status: ManualStatus) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border border-forge-border bg-forge-bg p-4">
      <label className="block text-sm font-semibold text-forge-muted" htmlFor="status">
        Stage
      </label>
      <select
        id="status"
        value={isManualStatus(status) ? status : ""}
        onChange={(event) => onStatusChange(event.target.value as ManualStatus)}
        className="mt-2 h-11 w-full rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text outline-none focus:border-forge-accent"
      >
        {isManualStatus(status) ? null : (
          <option value="">{STATUS_LABELS[status]}</option>
        )}
        {applicationStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Everything needed to fill in the employer's own form once, by hand: the
 * answers, the files, the checklist, and what happens after you send it.
 */
export default function SubmitPanel({
  status,
  company,
  draft,
  tracking,
  budget,
  latestFollowup,
  onOpenApply,
  onMarkSubmitted,
  onDraftFollowup,
  onSnooze,
  onAddNote,
  onStatusChange,
}: {
  status: PipelineStatus;
  company: string;
  draft: Doc<"applicationDrafts"> | null;
  tracking: Tracking;
  budget: SubmitBudget | null;
  latestFollowup: FollowupEmail | null;
  onOpenApply: () => Promise<void>;
  onMarkSubmitted: () => Promise<void>;
  onDraftFollowup: () => Promise<void>;
  onSnooze: (days: number) => Promise<void>;
  onAddNote: (text: string) => Promise<void>;
  onStatusChange: (status: ManualStatus) => Promise<void>;
}) {
  const submitted = hasApplied(status);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-lg border border-forge-accent/30 bg-forge-accent-dim p-4">
        <p className="flex items-start gap-2 text-sm leading-6 text-forge-text">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forge-accent" />
          {SAFETY_NOTE}
        </p>
        <button
          type="button"
          onClick={onOpenApply}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover sm:w-auto"
        >
          <ExternalLink className="h-4 w-4" />
          Open apply form
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          {draft === null ? (
            <p className="text-sm text-forge-muted">
              Generate the apply kit first: there is nothing to copy across yet.
            </p>
          ) : (
            <>
              <Questions draft={draft} />
              <Downloads company={company} draft={draft} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {submitted ? null : (
            <MarkSubmitted draft={draft} budget={budget} onMarkSubmitted={onMarkSubmitted} />
          )}
          <StatusControl status={status} onStatusChange={onStatusChange} />
        </div>
      </div>

      {submitted ? (
        <FollowupSection
          tracking={tracking}
          latestFollowup={latestFollowup}
          onDraftFollowup={onDraftFollowup}
          onSnooze={onSnooze}
          onAddNote={onAddNote}
        />
      ) : null}
    </div>
  );
}
