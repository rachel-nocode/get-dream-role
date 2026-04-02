"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { SectionFeedback as SectionFeedbackType } from "@/lib/types";

interface SectionFeedbackProps {
  sections: SectionFeedbackType[];
}

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-forge-success/10 text-forge-success border-forge-success/20";
  if (score >= 60) return "bg-forge-warning/10 text-forge-warning border-forge-warning/20";
  return "bg-forge-danger/10 text-forge-danger border-forge-danger/20";
}

function SectionItem({
  section,
  defaultOpen,
}: {
  section: SectionFeedbackType;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-forge-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          "w-full flex items-center justify-between px-5 py-4 text-left transition-colors",
          open ? "bg-forge-elevated" : "bg-forge-surface hover:bg-forge-elevated"
        )}
      >
        <span className="font-display text-sm font-semibold text-forge-text">
          {section.section}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "px-2.5 py-0.5 text-xs font-medium rounded-full border tabular-nums",
              scoreBadgeClass(section.score)
            )}
          >
            {section.score}/100
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-forge-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-forge-surface border-t border-forge-border flex flex-col gap-4">
              <p className="text-forge-muted text-sm leading-relaxed">
                {section.feedback}
              </p>

              {section.suggestions.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {section.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-forge-accent flex-shrink-0" />
                      <span className="text-forge-text">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SectionFeedback({ sections }: SectionFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-4"
    >
      <h2 className="font-display text-xl font-semibold text-forge-text">
        Section Analysis
      </h2>

      <div className="flex flex-col gap-3">
        {sections.map((section, i) => (
          <SectionItem key={section.section} section={section} defaultOpen={i === 0} />
        ))}
      </div>
    </motion.div>
  );
}
