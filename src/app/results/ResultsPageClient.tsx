"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, FileText, Plus } from "lucide-react";
import clsx from "clsx";
import type { AnalysisResult } from "@/lib/types";
import ScoreCards from "@/components/results/ScoreCards";
import KeywordAnalysis from "@/components/results/KeywordAnalysis";
import SectionFeedback from "@/components/results/SectionFeedback";
import BulletRewrites from "@/components/results/BulletRewrites";
import OptimizedResume from "@/components/results/OptimizedResume";
import JobMatches from "@/components/results/JobMatches";

type ResultsTab = "resume" | "jobs";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultsTab>("resume");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("gdrResult");
      if (stored) {
        const parsed = JSON.parse(stored) as AnalysisResult;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(parsed);
      }
    } catch {
      // Invalid data in sessionStorage
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forge-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-forge-muted text-lg">
            No analysis results found
          </p>
          <p className="text-forge-muted text-sm">
            Run an analysis first to see your results here.
          </p>
          <Link
            href="/optimize"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forge-accent text-forge-bg text-sm font-medium rounded-lg hover:bg-forge-accent-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Optimizer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              href="/optimize"
              className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Optimizer
            </Link>
            <Link
              href="/optimize"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-forge-accent text-forge-bg text-sm font-medium rounded-lg hover:bg-forge-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-forge-text">
              Analysis Results
            </h1>
            <p className="text-forge-muted text-sm md:text-base leading-relaxed max-w-3xl">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-forge-border bg-forge-surface p-1 md:w-fit">
            {[
              { id: "resume" as const, label: "Resume", icon: FileText },
              { id: "jobs" as const, label: "Jobs", icon: BriefcaseBusiness },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
                    activeTab === tab.id
                      ? "bg-forge-accent text-forge-bg"
                      : "text-forge-muted hover:bg-forge-elevated hover:text-forge-text",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "resume" ? (
          <>
            <ScoreCards
              atsScore={result.atsScore}
              matchScore={result.matchScore}
              targetName={result.targetName}
            />

            <KeywordAnalysis
              presentKeywords={result.presentKeywords}
              missingKeywords={result.missingKeywords}
              suggestedKeywords={result.suggestedKeywords}
            />

            <SectionFeedback sections={result.sectionFeedback} />

            <BulletRewrites rewrites={result.bulletRewrites} />

            <OptimizedResume
              resume={result.optimizedResume}
              insights={result.atsInsights}
            />
          </>
        ) : (
          <JobMatches result={result} />
        )}
      </div>
    </motion.div>
  );
}
