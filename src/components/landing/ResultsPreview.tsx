"use client";

import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const matchedKeywords = ["React", "Node.js", "PostgreSQL", "REST APIs", "Git"];
const missingKeywords = ["Kubernetes", "Terraform"];

function ScoreRing({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            className="text-forge-elevated"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-forge-text">
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs text-forge-muted tracking-wider uppercase font-display">
        {label}
      </span>
    </div>
  );
}

export default function ResultsPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="font-display text-3xl font-bold text-forge-text"
        >
          See what you get
        </motion.h2>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-forge-muted mt-3 max-w-lg"
        >
          A detailed scoring dashboard, keyword analysis, and AI-generated
          rewrites for every bullet point on your resume.
        </motion.p>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 bg-forge-surface border border-forge-border rounded-xl p-8 md:p-10"
        >
          {/* Score rings */}
          <div className="flex justify-start gap-16 flex-wrap">
            <ScoreRing label="ATS Score" value={87} color="#4ade80" />
            <ScoreRing label="Match Score" value={72} color="#d4873e" />
          </div>

          {/* Before / After */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-forge-border rounded-lg p-5">
              <p className="text-xs text-forge-muted tracking-wider uppercase font-display mb-3">
                Before
              </p>
              <p className="text-sm text-forge-muted leading-relaxed">
                Responsible for managing cloud infrastructure and deploying
                services for the engineering team.
              </p>
            </div>
            <div className="border border-forge-border rounded-lg p-5">
              <p className="text-xs text-forge-accent tracking-wider uppercase font-display mb-3">
                After
              </p>
              <p className="text-sm text-forge-text leading-relaxed">
                Architected and maintained{" "}
                <span className="text-forge-accent">AWS</span> cloud
                infrastructure serving 12 microservices, reducing deployment
                time by <span className="text-forge-accent">40%</span> through{" "}
                <span className="text-forge-accent">CI/CD</span> pipeline
                automation.
              </p>
            </div>
          </div>

          {/* Keyword pills */}
          <div className="mt-8">
            <p className="text-xs text-forge-muted tracking-wider uppercase font-display mb-3">
              Keyword Analysis
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs border border-forge-success/30 text-forge-success bg-forge-success/5 rounded-full px-3 py-1"
                >
                  {kw}
                </span>
              ))}
              {missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs border border-forge-accent/30 text-forge-accent bg-forge-accent-dim rounded-full px-3 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
