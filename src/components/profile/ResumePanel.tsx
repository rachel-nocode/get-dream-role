"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";

/**
 * The raw resume text and the one AI step on this page. The cost of the run
 * is shown before the button, never after.
 */
export default function ResumePanel({
  defaultText,
  costLine,
  prefilledFromOldProfile,
  onParse,
}: {
  defaultText: string;
  costLine: string;
  prefilledFromOldProfile: boolean;
  onParse: (resumeText: string) => Promise<void>;
}) {
  const [parsing, setParsing] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resumeText = String(new FormData(event.currentTarget).get("resumeText") ?? "");

    setParsing(true);
    try {
      await onParse(resumeText);
    } finally {
      setParsing(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">Resume text</h2>
      <p className="mt-2 text-sm text-forge-muted">
        Paste your resume once. Parsing turns it into facts you can check and edit; nothing is
        added that your resume does not already say.
      </p>
      {prefilledFromOldProfile ? (
        <p className="mt-2 text-sm text-forge-accent">
          Prefilled from the resume you saved earlier. Parse it to build your profile.
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <textarea
          name="resumeText"
          defaultValue={defaultText}
          rows={14}
          aria-label="Resume text"
          placeholder="Paste your current resume text here."
          className="w-full resize-y rounded-lg border border-forge-border bg-forge-bg px-4 py-3 text-sm leading-6 text-forge-text placeholder:text-forge-muted"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={parsing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {parsing ? "Parsing..." : "Parse with AI"}
          </button>
          <p className="text-sm text-forge-muted">{costLine}</p>
        </div>
      </form>
    </section>
  );
}
