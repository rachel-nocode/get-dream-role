"use client";

import clsx from "clsx";
import type { AnswerConfidence, AnswerDraft } from "@convex/validators";
import CopyButton from "./CopyButton";

const CONFIDENCE_STYLES: Record<AnswerConfidence, string> = {
  high: "border-forge-success/40 bg-forge-success/10 text-forge-success",
  medium: "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
  low: "border-forge-border bg-forge-elevated text-forge-muted",
};

const CONFIDENCE_LABELS: Record<AnswerConfidence, string> = {
  high: "Your own answer",
  medium: "Drafted from your profile",
  low: "Needs you",
};

function ConfidenceBadge({ confidence }: { confidence: AnswerConfidence }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        CONFIDENCE_STYLES[confidence],
      )}
    >
      {CONFIDENCE_LABELS[confidence]}
    </span>
  );
}

/** The screening answers, each labelled with how much it can be trusted. */
export default function AnswersPanel({ answers }: { answers: AnswerDraft[] }) {
  if (answers.length === 0) {
    return (
      <p className="text-sm text-forge-muted">
        This posting did not expose any screening questions.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <div key={answer.question} className="rounded-lg border border-forge-border bg-forge-bg p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold break-words">{answer.question}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {answer.confidence ? <ConfidenceBadge confidence={answer.confidence} /> : null}
                <span className="text-xs text-forge-muted">
                  {answer.required ? "Required" : "Optional"}
                  {answer.sourceKey ? ` · answer bank: ${answer.sourceKey}` : ""}
                </span>
              </div>
            </div>
            <CopyButton value={answer.answer} />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-forge-text">
            {answer.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
