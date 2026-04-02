"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Shield, Target } from "lucide-react";

interface ScoreCardsProps {
  atsScore: number;
  matchScore: number;
  targetName: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-forge-success";
  if (score >= 60) return "text-forge-warning";
  return "text-forge-danger";
}

function scoreStroke(score: number): string {
  if (score >= 80) return "stroke-forge-success";
  if (score >= 60) return "stroke-forge-warning";
  return "stroke-forge-danger";
}

function scoreBadgeBg(score: number): string {
  if (score >= 80) return "bg-forge-success/10 text-forge-success border-forge-success/20";
  if (score >= 60) return "bg-forge-warning/10 text-forge-warning border-forge-warning/20";
  return "bg-forge-danger/10 text-forge-danger border-forge-danger/20";
}

function useAnimatedCount(target: number, duration: number = 1200): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

function ScoreRing({
  score,
  size,
  strokeWidth,
}: {
  score: number;
  size: number;
  strokeWidth: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-forge-border"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={scoreStroke(score)}
        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </svg>
  );
}

export default function ScoreCards({
  atsScore,
  matchScore,
  targetName,
}: ScoreCardsProps) {
  const animatedAts = useAnimatedCount(atsScore);
  const animatedMatch = useAnimatedCount(matchScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-[3fr_1px_2fr] gap-0 bg-forge-surface border border-forge-border rounded-xl overflow-hidden"
    >
      {/* ATS Compatibility Score — Hero */}
      <div className="p-6 md:p-8 flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <ScoreRing score={atsScore} size={140} strokeWidth={6} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={clsx(
                "font-display text-4xl font-bold tabular-nums",
                scoreColor(atsScore)
              )}
            >
              {animatedAts}
            </span>
            <span className="text-forge-muted text-xs mt-0.5">/ 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-forge-muted" />
            <span className="font-display text-lg font-semibold text-forge-text">
              ATS Compatibility
            </span>
          </div>
          <p className="text-forge-muted text-sm leading-relaxed">
            How well your resume parses and ranks within the applicant tracking
            system. Higher scores mean better visibility to recruiters.
          </p>
          <span
            className={clsx(
              "inline-flex items-center self-start px-3 py-1 text-xs font-medium rounded-full border",
              scoreBadgeBg(atsScore)
            )}
          >
            {atsScore >= 80 ? "Strong" : atsScore >= 60 ? "Moderate" : "Needs Work"}
          </span>
        </div>
      </div>

      {/* Vertical Divider (desktop only) */}
      <div className="hidden md:block bg-forge-border" />

      {/* Horizontal Divider (mobile only) */}
      <div className="block md:hidden h-px bg-forge-border" />

      {/* Job Match Score — Secondary */}
      <div className="p-6 md:p-8 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <ScoreRing score={matchScore} size={110} strokeWidth={5} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={clsx(
                "font-display text-3xl font-bold tabular-nums",
                scoreColor(matchScore)
              )}
            >
              {animatedMatch}
            </span>
            <span className="text-forge-muted text-[10px] mt-0.5">/ 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-forge-muted" />
            <span className="font-display text-base font-semibold text-forge-text">
              Job Match
            </span>
          </div>
          <p className="text-forge-muted text-sm leading-relaxed">
            Keyword alignment between your resume and the job description.
          </p>
          <span
            className={clsx(
              "inline-flex items-center self-start px-2.5 py-0.5 text-xs font-medium rounded-full border",
              "bg-forge-accent-dim text-forge-accent border-forge-accent/20"
            )}
          >
            {targetName}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
