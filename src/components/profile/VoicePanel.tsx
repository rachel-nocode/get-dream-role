"use client";

import { useState, type FormEvent } from "react";

/** The candidate's own summary and a note about how they write. */
export default function VoicePanel({
  summary,
  writingStyle,
  onSave,
}: {
  summary: string;
  writingStyle: string;
  onSave: (values: { summary: string; writingStyle: string }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSaving(true);
    try {
      await onSave({
        summary: String(form.get("summary") ?? ""),
        writingStyle: String(form.get("writingStyle") ?? ""),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">Summary and voice</h2>
      <p className="mt-2 text-sm text-forge-muted">
        Your summary is used as written. The voice note tells later drafts how you sound, so they
        stop sounding like everyone else.
      </p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-forge-muted">Professional summary</span>
          <textarea
            name="summary"
            defaultValue={summary}
            rows={3}
            placeholder="Two or three lines about what you do."
            className="resize-y rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm leading-6 text-forge-text placeholder:text-forge-muted"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-forge-muted">How you write</span>
          <textarea
            name="writingStyle"
            defaultValue={writingStyle}
            rows={3}
            placeholder="Plain and direct. Short sentences. No buzzwords, no exclamation marks."
            className="resize-y rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm leading-6 text-forge-text placeholder:text-forge-muted"
          />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save summary"}
          </button>
        </div>
      </form>
    </section>
  );
}
