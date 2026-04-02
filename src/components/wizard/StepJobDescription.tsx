"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface StepJobDescriptionProps {
  jobTitle: string;
  jobDescription: string;
  onJobTitleChange: (t: string) => void;
  onJobDescriptionChange: (jd: string) => void;
}

export default function StepJobDescription({
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
}: StepJobDescriptionProps) {
  const charCount = jobDescription.length;
  const isTooShort = charCount > 0 && charCount <= 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-2xl font-bold text-forge-text">
        Paste Job Description
      </h2>
      <p className="mt-2 text-sm text-forge-muted">
        Paste the full job posting. The more detail, the better the keyword
        analysis.
      </p>

      <div className="mt-8 space-y-5">
        {/* Job title field */}
        <div>
          <label
            htmlFor="job-title"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-forge-muted"
          >
            Target Job Title (Optional)
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-xl border border-forge-border bg-forge-surface px-4 py-3 text-sm text-forge-text placeholder:text-forge-muted/50 transition-colors focus:border-forge-accent focus:outline-none focus:ring-1 focus:ring-forge-accent/20"
          />
        </div>

        {/* Job description textarea */}
        <div>
          <label
            htmlFor="job-description"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-forge-muted"
          >
            Job Description
          </label>
          <div className="relative">
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={14}
              className={clsx(
                "w-full resize-y rounded-xl border bg-forge-surface px-4 py-3 text-sm leading-relaxed text-forge-text placeholder:text-forge-muted/50 transition-colors focus:outline-none focus:ring-1",
                isTooShort
                  ? "border-forge-warning focus:border-forge-warning focus:ring-forge-warning/20"
                  : "border-forge-border focus:border-forge-accent focus:ring-forge-accent/20",
              )}
              style={{ minHeight: "300px" }}
            />

            {/* Character count */}
            <span
              className={clsx(
                "absolute right-3 bottom-3 text-xs",
                isTooShort ? "text-forge-warning" : "text-forge-muted/60",
              )}
            >
              {charCount.toLocaleString()} chars
            </span>
          </div>

          {/* Validation hint */}
          {isTooShort && (
            <p className="mt-2 text-xs text-forge-warning">
              Please paste at least 20 characters for meaningful analysis.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
