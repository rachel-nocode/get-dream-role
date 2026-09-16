"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { formatUsd } from "@convex/ai/providers";

/** The steps the pipeline runs, in order, for the progress line. */
export const PIPELINE_STEPS = [
  "Reading the posting",
  "Matching your facts to it",
  "Rewriting your bullets",
  "Writing the cover letter",
  "Drafting the screening answers",
  "Checking every claim",
] as const;

/** Rough seconds per step: the progress line is an estimate, not a trace. */
const STEP_MS = 7_000;

export type Estimate = {
  label: string;
  costUsd: number | null;
  usingHouseKey: boolean;
} | null;

function estimateLine(estimate: Estimate): string {
  if (estimate === null) return "Checking which model you are on...";
  const cost = estimate.costUsd === null ? "An unknown amount" : `≈ ${formatUsd(estimate.costUsd)}`;
  return `${cost} on ${estimate.label}${estimate.usingHouseKey ? ", the shared trial key" : ""}`;
}

/**
 * Prices the run before it starts, then names the step it is probably on.
 * The whole pipeline is one round trip, so the step is timed, not reported.
 */
export default function GenerateBar({
  estimate,
  hasDraft,
  disabled,
  onGenerate,
}: {
  estimate: Estimate;
  hasDraft: boolean;
  disabled?: boolean;
  onGenerate: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [step, setStep] = useState<number | null>(null);

  async function run() {
    setConfirming(false);
    setStep(0);
    const timer = window.setInterval(() => {
      setStep((current) =>
        current === null ? null : Math.min(current + 1, PIPELINE_STEPS.length - 1),
      );
    }, STEP_MS);

    try {
      await onGenerate();
    } finally {
      window.clearInterval(timer);
      setStep(null);
    }
  }

  if (step !== null) {
    return (
      <p className="text-sm text-forge-muted" aria-live="polite">
        Step {step + 1} of {PIPELINE_STEPS.length}: {PIPELINE_STEPS[step]}...
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-forge-muted">{estimateLine(estimate)} — generate?</span>
        <button
          type="button"
          onClick={run}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex h-10 items-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setConfirming(true)}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Sparkles className="h-4 w-4" />
      {hasDraft ? "Regenerate" : "Generate apply kit"}
    </button>
  );
}
