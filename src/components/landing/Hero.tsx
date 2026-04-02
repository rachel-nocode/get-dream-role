"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const keywordPills = ["React", "TypeScript", "CI/CD"];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] rounded-full bg-forge-accent/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
        {/* Left — 60% */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-forge-accent text-xs tracking-[0.2em] uppercase"
          >
            Algorithmic Resume Engineering
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-5xl md:text-7xl font-bold leading-tight text-forge-text"
          >
            Your resume.
            <br />
            Engineered to pass.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-forge-muted text-lg max-w-xl leading-relaxed"
          >
            Platform-aware optimization for ATS compatibility and recruiter
            readability. Upload your resume, paste the job description, and
            bypass the filters.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4 pt-2"
          >
            <Link
              href="/optimize"
              className="bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Optimize My Resume &rarr;
            </Link>
            <a
              href="#how-it-works"
              className="border border-forge-border hover:border-forge-border-bright text-forge-text px-6 py-3 rounded-lg transition-colors"
            >
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* Right — 40% */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <div className="bg-forge-surface border border-forge-border rounded-xl p-6 flex flex-col gap-5">
            <p className="text-forge-muted text-xs tracking-[0.15em] uppercase font-display">
              Analysis Output
            </p>

            {/* Score */}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-display font-bold text-forge-success">
                87
              </span>
              <span className="text-lg text-forge-muted">/100</span>
            </div>

            {/* Progress bar */}
            <div>
              <p className="text-xs text-forge-muted tracking-wider uppercase mb-2 font-display">
                ATS Compatibility
              </p>
              <div className="w-full h-1.5 bg-forge-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-forge-accent rounded-full"
                  style={{ width: "87%" }}
                />
              </div>
            </div>

            {/* Keyword pills */}
            <div className="flex flex-wrap gap-2">
              {keywordPills.map((kw) => (
                <span
                  key={kw}
                  className="text-xs text-forge-text border border-forge-border rounded-full px-3 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>

            {/* Before/After */}
            <div className="border-t border-forge-border pt-4 flex flex-col gap-1">
              <p className="text-sm text-forge-muted">
                <span className="text-forge-muted/60">Before:</span> Worked on
                projects
              </p>
              <p className="text-sm text-forge-text">
                <span className="text-forge-accent">After:</span> Led
                cross-functional development of 3 customer-facing products
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
