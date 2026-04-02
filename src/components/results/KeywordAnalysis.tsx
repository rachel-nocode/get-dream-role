"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface KeywordAnalysisProps {
  presentKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
}

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function KeywordGroup({
  label,
  icon,
  count,
  keywords,
  pillClass,
  startIndex,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  keywords: string[];
  pillClass: string;
  startIndex: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-forge-text">{label}</span>
        <span className="text-xs text-forge-muted">({count})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, i) => (
          <motion.span
            key={keyword}
            custom={startIndex + i}
            variants={pillVariants}
            initial="hidden"
            animate="visible"
            className={clsx(
              "px-3 py-1 text-sm rounded-full border",
              pillClass
            )}
          >
            {keyword}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function KeywordAnalysis({
  presentKeywords,
  missingKeywords,
  suggestedKeywords,
}: KeywordAnalysisProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col gap-6"
    >
      <h2 className="font-display text-xl font-semibold text-forge-text">
        Keyword Analysis
      </h2>

      <div className="bg-forge-surface border border-forge-border rounded-xl p-6 flex flex-col gap-6">
        <KeywordGroup
          label="Matched"
          icon={<CheckCircle2 className="w-4 h-4 text-forge-success" />}
          count={presentKeywords.length}
          keywords={presentKeywords}
          pillClass="bg-forge-success/10 text-forge-success border-forge-success/20"
          startIndex={0}
        />

        <div className="h-px bg-forge-border" />

        <KeywordGroup
          label="Missing"
          icon={<AlertCircle className="w-4 h-4 text-forge-accent" />}
          count={missingKeywords.length}
          keywords={missingKeywords}
          pillClass="bg-forge-accent/10 text-forge-accent border-forge-accent/20"
          startIndex={presentKeywords.length}
        />

        <div className="h-px bg-forge-border" />

        <KeywordGroup
          label="Recommended"
          icon={<Lightbulb className="w-4 h-4 text-forge-muted" />}
          count={suggestedKeywords.length}
          keywords={suggestedKeywords}
          pillClass="bg-forge-elevated text-forge-muted border-forge-border"
          startIndex={presentKeywords.length + missingKeywords.length}
        />
      </div>
    </motion.div>
  );
}
