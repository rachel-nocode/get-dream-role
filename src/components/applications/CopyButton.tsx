"use client";

import { useState } from "react";
import { Files } from "lucide-react";

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-forge-border px-3 text-sm text-forge-text hover:bg-forge-elevated"
    >
      <Files className="h-4 w-4" />
      {copied ? "Copied" : (label ?? "Copy")}
    </button>
  );
}
