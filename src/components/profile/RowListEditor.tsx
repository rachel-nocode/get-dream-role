"use client";

import { useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

export type RowField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  /** How many of the three grid columns the field takes on a wide screen. */
  span?: 1 | 2 | 3;
};

export type RowValues = Record<string, string>;

type Row = { key: string; values: RowValues };

const spanClasses: Record<1 | 2 | 3, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
};

/**
 * One editable list of flat rows: skills, education, certifications, projects.
 * Values live in the DOM, so the parent remounts this with a fresh `key` when
 * the saved profile changes rather than mirroring server state into React.
 */
export default function RowListEditor({
  title,
  description,
  fields,
  initialRows,
  addLabel,
  emptyLabel,
  onSave,
}: {
  title: string;
  description: string;
  fields: RowField[];
  initialRows: RowValues[];
  addLabel: string;
  emptyLabel: string;
  onSave: (rows: RowValues[]) => Promise<void>;
}) {
  const nextKey = useRef(initialRows.length);
  const [rows, setRows] = useState<Row[]>(() =>
    initialRows.map((values, index) => ({ key: `row-${index}`, values })),
  );
  const [saving, setSaving] = useState(false);

  function addRow() {
    nextKey.current += 1;
    setRows((current) => [...current, { key: `row-${nextKey.current}`, values: {} }]);
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = rows.map((row) => {
      const values: RowValues = { id: row.values.id ?? "" };
      for (const field of fields) {
        values[field.name] = String(form.get(`${row.key}.${field.name}`) ?? "").trim();
      }
      return values;
    });

    setSaving(true);
    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-forge-border bg-forge-surface p-5">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-forge-muted">{description}</p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        {rows.length === 0 ? <p className="text-sm text-forge-muted">{emptyLabel}</p> : null}

        {rows.map((row) => (
          <div
            key={row.key}
            className="grid gap-3 rounded-lg border border-forge-border bg-forge-bg p-4 sm:grid-cols-3"
          >
            {fields.map((field) => (
              <label
                key={field.name}
                className={`flex flex-col gap-1 text-sm ${spanClasses[field.span ?? 1]}`}
              >
                <span className="text-forge-muted">{field.label}</span>
                <input
                  type={field.type ?? "text"}
                  name={`${row.key}.${field.name}`}
                  defaultValue={row.values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  className="h-11 rounded-lg border border-forge-border bg-forge-surface px-3 text-sm text-forge-text placeholder:text-forge-muted"
                />
              </label>
            ))}
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-danger hover:bg-forge-elevated"
              >
                <Trash2 className="h-4 w-4" />
                Remove
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
            {addLabel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save section"}
          </button>
        </div>
      </form>
    </section>
  );
}
