"use client";

import { ExternalLink, Save } from "lucide-react";
import {
  ApplicationStatus,
  applicationStatusOptions,
} from "@/components/app/StatusPill";
import CopyButton from "./CopyButton";

/** Copy what you need, open the real form, then record what happened. */
export default function SubmitPanel({
  status,
  resumeText,
  coverLetter,
  onStatusChange,
  onOpenApply,
}: {
  status: ApplicationStatus;
  resumeText?: string;
  coverLetter?: string;
  onStatusChange: (status: ApplicationStatus) => void;
  onOpenApply: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div>
        <h2 className="font-display text-xl font-semibold">Assisted submit</h2>
        <p className="mt-3 text-sm leading-6 text-forge-muted">
          GetDreamRole never submits for you. Copy the pieces you want, open the employer&apos;s own
          form, then record what you sent.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {resumeText ? <CopyButton value={resumeText} label="Copy resume" /> : null}
          {coverLetter ? <CopyButton value={coverLetter} label="Copy letter" /> : null}
          <button
            type="button"
            onClick={onOpenApply}
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
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ApplicationStatus)}
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
          onClick={() => onStatusChange("submitted")}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 text-sm font-semibold text-forge-success hover:bg-forge-success/15"
        >
          <Save className="h-4 w-4" />
          Mark submitted
        </button>
      </div>
    </div>
  );
}
