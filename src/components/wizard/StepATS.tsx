"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { ATSTarget, ATS_OPTIONS } from "@/lib/types";

interface StepATSProps {
  selectedTarget: ATSTarget | null;
  onSelect: (target: ATSTarget) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function StepATS({ selectedTarget, onSelect }: StepATSProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-forge-text">
        Select Target ATS
      </h2>
      <p className="mt-2 text-sm text-forge-muted">
        Choose the hiring platform you&apos;re optimizing for. Each system
        parses resumes differently.
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ATS_OPTIONS.map((option) => {
          const isSelected = selectedTarget === option.id;

          return (
            <motion.button
              key={option.id}
              variants={item}
              type="button"
              onClick={() => onSelect(option.id)}
              className={clsx(
                "relative rounded-xl border p-5 text-left transition-colors",
                isSelected
                  ? "border-forge-accent bg-forge-accent-dim"
                  : "border-forge-border bg-forge-surface hover:border-forge-border-bright",
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-forge-accent" />
              )}

              <h3 className="font-display text-lg font-semibold text-forge-text">
                {option.name}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-forge-muted">
                {option.engine}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                {option.description}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
