"use client";

import clsx from "clsx";
import type { DiscoveredJobStatus } from "@convex/validators";

export type QueueTab = Extract<
  DiscoveredJobStatus,
  "new" | "scored" | "saved" | "dismissed"
>;

export const QUEUE_TABS: Array<{ value: QueueTab; label: string }> = [
  { value: "new", label: "New" },
  { value: "scored", label: "Scored" },
  { value: "saved", label: "Saved" },
  { value: "dismissed", label: "Dismissed" },
];

export default function QueueTabs({
  active,
  counts,
  onSelect,
}: {
  active: QueueTab;
  counts: Record<QueueTab, number>;
  onSelect: (tab: QueueTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUEUE_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onSelect(tab.value)}
          className={clsx(
            "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
            active === tab.value
              ? "border-forge-accent/40 bg-forge-accent-dim text-forge-accent"
              : "border-forge-border text-forge-muted hover:bg-forge-elevated hover:text-forge-text",
          )}
        >
          {tab.label}
          <span className="text-xs font-normal">{counts[tab.value]}</span>
        </button>
      ))}
    </div>
  );
}
