"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import type { AnswerBankEntry } from "@convex/validators";

function AnswerRow({
  entry,
  onSave,
}: {
  entry: AnswerBankEntry;
  onSave: (key: string, answer: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const answered = entry.answer.trim().length > 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = String(new FormData(event.currentTarget).get("answer") ?? "");

    setSaving(true);
    try {
      await onSave(entry.key, answer);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-lg border border-forge-border bg-forge-bg p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold">{entry.question}</p>
        <span
          className={clsx(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
            answered
              ? "border-forge-success/40 bg-forge-success/10 text-forge-success"
              : "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
          )}
        >
          {answered ? "Answered" : "Needs your answer"}
        </span>
      </div>
      <textarea
        name="answer"
        defaultValue={entry.answer}
        rows={2}
        aria-label={entry.question}
        placeholder="Your answer, in your own words."
        className="resize-y rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-sm leading-6 text-forge-text placeholder:text-forge-muted"
      />
      <div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save answer"}
        </button>
      </div>
    </form>
  );
}

/**
 * The screening questions every application asks. Answers here are the only
 * ones an application is ever allowed to use; blanks stay blank on purpose.
 */
export default function AnswerBank({
  entries,
  onSave,
}: {
  entries: AnswerBankEntry[];
  onSave: (key: string, answer: string) => Promise<void>;
}) {
  const unanswered = entries.filter((entry) => entry.answer.trim().length === 0).length;

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">Answer bank</h2>
      <p className="mt-2 text-sm text-forge-muted">
        {unanswered === 0
          ? "Every screening question has an answer. Applications reuse these word for word."
          : `${unanswered} question${unanswered === 1 ? "" : "s"} still need your answer. Visa, salary and clearance answers are never guessed for you.`}
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {entries.map((entry) => (
          // Remounts only when this answer changes, so a draft in another
          // row is never thrown away.
          <AnswerRow key={`${entry.id}-${entry.answer}`} entry={entry} onSave={onSave} />
        ))}
      </div>
    </section>
  );
}
