"use client";

import { useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ExperienceEntry } from "@convex/validators";

type Row = { key: string; entry: ExperienceEntry };

const BLANK: ExperienceEntry = {
  id: "",
  company: "",
  title: "",
  startDate: "",
  bullets: [],
};

function readField(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function readBullets(form: FormData, key: string, existing: ExperienceEntry["bullets"]) {
  return String(form.get(key) ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .map((text, index) => ({ id: existing[index]?.id ?? "", text }));
}

/**
 * Roles and their bullets. Bullets are one per line: the registry keeps an id
 * per bullet, and lines that keep their position keep their id.
 */
export default function ExperienceEditor({
  initialEntries,
  onSave,
}: {
  initialEntries: ExperienceEntry[];
  onSave: (entries: ExperienceEntry[]) => Promise<void>;
}) {
  const nextKey = useRef(initialEntries.length);
  const [rows, setRows] = useState<Row[]>(() =>
    initialEntries.map((entry, index) => ({ key: `exp-${index}`, entry })),
  );
  const [saving, setSaving] = useState(false);

  function addRow() {
    nextKey.current += 1;
    setRows((current) => [...current, { key: `exp-${nextKey.current}`, entry: BLANK }]);
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entries = rows.map((row) => ({
      id: row.entry.id,
      company: readField(form, `${row.key}.company`),
      title: readField(form, `${row.key}.title`),
      location: readField(form, `${row.key}.location`),
      startDate: readField(form, `${row.key}.startDate`),
      endDate: readField(form, `${row.key}.endDate`),
      bullets: readBullets(form, `${row.key}.bullets`, row.entry.bullets),
    }));

    setSaving(true);
    try {
      await onSave(entries);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">Experience</h2>
      <p className="mt-2 text-sm text-forge-muted">
        One entry per role, one bullet per line. Dates stay exactly as your resume writes them.
      </p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        {rows.length === 0 ? (
          <p className="text-sm text-forge-muted">
            No roles yet. Parse your resume above or add one by hand.
          </p>
        ) : null}

        {rows.map((row) => (
          <div
            key={row.key}
            className="grid gap-3 rounded-lg border border-forge-border bg-forge-bg p-4 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-forge-muted">Company</span>
              <input
                name={`${row.key}.company`}
                defaultValue={row.entry.company}
                placeholder="Acme"
                className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-forge-muted">Title</span>
              <input
                name={`${row.key}.title`}
                defaultValue={row.entry.title}
                placeholder="Senior Frontend Engineer"
                className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-forge-muted">Location</span>
              <input
                name={`${row.key}.location`}
                defaultValue={row.entry.location ?? ""}
                placeholder="Berlin, Germany"
                className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-forge-muted">Start</span>
                <input
                  name={`${row.key}.startDate`}
                  defaultValue={row.entry.startDate}
                  placeholder="Jan 2023"
                  className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-forge-muted">End</span>
                <input
                  name={`${row.key}.endDate`}
                  defaultValue={row.entry.endDate ?? ""}
                  placeholder="Present"
                  className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-forge-muted">Bullets (one per line)</span>
              <textarea
                name={`${row.key}.bullets`}
                defaultValue={row.entry.bullets.map((bullet) => bullet.text).join("\n")}
                rows={5}
                className="resize-y rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-sm leading-6 text-forge-text placeholder:text-forge-muted"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-danger hover:bg-forge-elevated"
              >
                <Trash2 className="h-4 w-4" />
                Remove role
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated"
          >
            <Plus className="h-4 w-4" />
            Add role
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save experience"}
          </button>
        </div>
      </form>
    </section>
  );
}
