"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Copy, Check, Download, Zap } from "lucide-react";

interface OptimizedResumeProps {
  resume: string;
  insights: string[];
}

export default function OptimizedResume({
  resume,
  insights,
}: OptimizedResumeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = resume;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [resume]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([resume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "optimized-resume.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [resume]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* ATS Insights */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-forge-text">
          ATS Insights
        </h2>
        <div className="bg-forge-surface border border-forge-border rounded-xl p-5 flex flex-col gap-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-forge-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-forge-text leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Resume */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-forge-text">
            Optimized Resume
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                copied
                  ? "bg-forge-success/10 text-forge-success border-forge-success/20"
                  : "bg-forge-elevated text-forge-muted border-forge-border hover:text-forge-text hover:border-forge-border-bright"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-forge-elevated text-forge-muted border-forge-border hover:text-forge-text hover:border-forge-border-bright transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download as Text
            </button>
          </div>
        </div>

        <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
          <pre className="whitespace-pre-wrap text-sm text-forge-text leading-relaxed font-body">
            {resume}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
