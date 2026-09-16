"use client";

import { useState, type FormEvent } from "react";
import type { JobPreferences, RemotePreference } from "@convex/validators";

const REMOTE_OPTIONS: Array<{ value: RemotePreference; label: string }> = [
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
  { value: "any", label: "No preference" },
];

const LIST_FIELDS: Array<{
  name: keyof Pick<
    JobPreferences,
    "targetTitles" | "locations" | "employmentTypes" | "dealBreakers" | "mustHaves"
  >;
  label: string;
  placeholder: string;
}> = [
  {
    name: "targetTitles",
    label: "Target titles",
    placeholder: "Senior Frontend Engineer, Staff Engineer",
  },
  { name: "locations", label: "Locations", placeholder: "Berlin, Lisbon, Remote EU" },
  { name: "employmentTypes", label: "Employment types", placeholder: "Full-time, Contract" },
  { name: "dealBreakers", label: "Deal breakers", placeholder: "On-call rotation, relocation" },
  { name: "mustHaves", label: "Must haves", placeholder: "TypeScript, async team" },
];

export function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function joinList(values: string[]): string {
  return values.join(", ");
}

function isRemotePreference(value: string): value is RemotePreference {
  return REMOTE_OPTIONS.some((option) => option.value === value);
}

/** What the pre-filter and the scorer judge a posting against. */
export default function PreferencesForm({
  initial,
  onSave,
}: {
  initial: JobPreferences;
  onSave: (preferences: JobPreferences) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const remote = String(form.get("remote") ?? "any");
    const salaryMin = Number(form.get("salaryMin"));

    setSaving(true);
    try {
      await onSave({
        targetTitles: splitList(form.get("targetTitles")),
        locations: splitList(form.get("locations")),
        remote: isRemotePreference(remote) ? remote : "any",
        salaryMin: Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
        salaryCurrency: String(form.get("salaryCurrency") ?? "").trim() || undefined,
        employmentTypes: splitList(form.get("employmentTypes")),
        dealBreakers: splitList(form.get("dealBreakers")),
        mustHaves: splitList(form.get("mustHaves")),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">What you are looking for</h2>
      <p className="mt-2 text-sm text-forge-muted">
        Separate list entries with commas. Discovery scores every posting against this.
      </p>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        {LIST_FIELDS.map((field) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            <span className="text-forge-muted">{field.label}</span>
            <input
              name={field.name}
              defaultValue={joinList(initial[field.name])}
              placeholder={field.placeholder}
              className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text placeholder:text-forge-muted"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-forge-muted">Work setup</span>
          <select
            name="remote"
            defaultValue={initial.remote}
            className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text"
          >
            {REMOTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-forge-muted">Salary floor</span>
            <input
              type="number"
              name="salaryMin"
              min={0}
              step={1000}
              defaultValue={initial.salaryMin ?? ""}
              placeholder="120000"
              className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text placeholder:text-forge-muted"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-forge-muted">Currency</span>
            <input
              name="salaryCurrency"
              maxLength={3}
              defaultValue={initial.salaryCurrency ?? ""}
              placeholder="USD"
              className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm uppercase text-forge-text placeholder:text-forge-muted"
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </form>
    </section>
  );
}
