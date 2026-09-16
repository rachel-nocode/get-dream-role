"use client";

import { useState } from "react";
import { ExternalLink, KeyRound, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { ProviderInfo } from "@convex/ai/providers";

export type SavedKey = {
  last4: string;
  label?: string;
  lastValidatedAt?: number;
};

type Action = "save" | "test" | "remove";

export default function ProviderKeyCard({
  provider,
  saved,
  isActive,
  onSave,
  onTest,
  onRemove,
}: {
  provider: ProviderInfo;
  saved?: SavedKey;
  isActive: boolean;
  onSave: (apiKey: string, label: string) => Promise<string>;
  onTest: () => Promise<string>;
  onRemove: () => Promise<string>;
}) {
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState<Action | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function run(action: Action, task: () => Promise<string>) {
    setPending(action);
    setNotice("");
    setError("");
    try {
      const message = await task();
      setNotice(message);
      if (action === "save") {
        setApiKey("");
        setLabel("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-lg border bg-forge-surface p-5",
        isActive ? "border-forge-accent/40" : "border-forge-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{provider.label}</h3>
          <p className="mt-1 text-sm text-forge-muted">
            {saved
              ? `Key ending ${saved.last4}${saved.label ? ` · ${saved.label}` : ""} · ${
                  saved.lastValidatedAt
                    ? `checked ${new Date(saved.lastValidatedAt).toLocaleDateString()}`
                    : "not checked yet"
                }`
              : "No key saved"}
          </p>
        </div>
        <span
          className={clsx(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
            saved
              ? "border-forge-success/40 bg-forge-success/10 text-forge-success"
              : "border-forge-border bg-forge-elevated text-forge-muted",
          )}
        >
          {saved ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder={
            provider.keyPrefixHint ? `${provider.keyPrefixHint}...` : "Paste your API key"
          }
          aria-label={`${provider.label} API key`}
          className="h-11 flex-1 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text placeholder:text-forge-muted"
        />
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label (optional)"
          aria-label={`${provider.label} key label`}
          className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text placeholder:text-forge-muted sm:w-40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending !== null || apiKey.trim().length === 0}
          onClick={() => run("save", () => onSave(apiKey.trim(), label.trim()))}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {pending === "save" ? "Checking..." : saved ? "Replace key" : "Save key"}
        </button>
        <button
          type="button"
          disabled={pending !== null || !saved}
          onClick={() => run("test", onTest)}
          className="inline-flex h-10 items-center rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "test" ? "Testing..." : "Test"}
        </button>
        <button
          type="button"
          disabled={pending !== null || !saved}
          onClick={() => run("remove", onRemove)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-forge-border px-4 text-sm font-semibold text-forge-danger hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
        <a
          href={provider.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-1 px-1 text-sm text-forge-accent hover:text-forge-accent-hover"
        >
          Get a key
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {notice ? <p className="text-sm text-forge-success">{notice}</p> : null}
      {error ? <p className="text-sm text-forge-danger">{error}</p> : null}

      <p className="text-xs text-forge-muted">
        Stored encrypted; only decrypted inside the backend call that uses it.
      </p>
    </div>
  );
}
