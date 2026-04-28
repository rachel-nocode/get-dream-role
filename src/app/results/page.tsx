"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import ScoreCards from "@/components/results/ScoreCards";
import KeywordAnalysis from "@/components/results/KeywordAnalysis";
import SectionFeedback from "@/components/results/SectionFeedback";
import BulletRewrites from "@/components/results/BulletRewrites";
import OptimizedResume from "@/components/results/OptimizedResume";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

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
        </div>

        {/* Score Cards */}
        <ScoreCards
          atsScore={result.atsScore}
          matchScore={result.matchScore}
          targetName={result.targetName}
        />

        {/* Keyword Analysis */}
        <KeywordAnalysis
          presentKeywords={result.presentKeywords}
          missingKeywords={result.missingKeywords}
          suggestedKeywords={result.suggestedKeywords}
        />

        {/* Section Feedback */}
        <SectionFeedback sections={result.sectionFeedback} />

        {/* Bullet Rewrites */}
        <BulletRewrites rewrites={result.bulletRewrites} />

        {/* Optimized Resume & Insights */}
        <OptimizedResume
          resume={result.optimizedResume}
          insights={result.atsInsights}
        />
      </div>
    </motion.div>
  );
}
