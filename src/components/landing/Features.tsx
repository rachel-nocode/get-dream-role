"use client";

import { motion } from "framer-motion";
import { Target, FileSearch, Upload, Sparkles } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const atsGrid = [
  "Greenhouse", "Lever", "Workday",
  "iCIMS", "Taleo", "BrassRing",
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="font-display text-3xl font-bold text-forge-text">
            What GetDreamRole Does
          </h2>
          <p className="text-forge-muted mt-3 max-w-lg">
            A complete pipeline from resume upload to optimized output,
            calibrated to the hiring platform that will read it first.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — large card */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-forge-surface border border-forge-border rounded-xl p-8 flex flex-col gap-6"
          >
            <div className="w-10 h-10 rounded-lg bg-forge-accent-dim flex items-center justify-center">
              <Target className="w-5 h-5 text-forge-accent" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-forge-text">
                ATS Platform Targeting
              </h3>
              <p className="text-forge-muted mt-2 leading-relaxed">
                Different applicant tracking systems parse resumes differently.
                Select the specific platform the company uses and receive
                optimizations tuned to its parsing engine, keyword weighting,
                and formatting preferences.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {atsGrid.map((name) => (
                <div
                  key={name}
                  className="bg-forge-elevated border border-forge-border rounded-lg px-3 py-2 text-xs text-forge-muted text-center"
                >
                  {name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — three stacked cards */}
          <div className="flex flex-col gap-6">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-forge-surface border border-forge-border rounded-xl p-6 flex gap-5"
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-forge-accent-dim flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-forge-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-forge-text">
                  Job Description Matching
                </h3>
                <p className="text-forge-muted mt-1 text-sm leading-relaxed">
                  Extracts required skills, qualifications, and keywords from
                  the job posting, then aligns your resume language to match
                  what the system is scanning for.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-forge-surface border border-forge-border rounded-xl p-6 flex gap-5"
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-forge-accent-dim flex items-center justify-center">
                <Upload className="w-5 h-5 text-forge-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-forge-text">
                  Resume Parsing &amp; Scoring
                </h3>
                <p className="text-forge-muted mt-1 text-sm leading-relaxed">
                  Upload your PDF and get an instant ATS compatibility score
                  with a detailed breakdown of what is working and what needs
                  improvement.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-forge-surface border border-forge-border rounded-xl p-6 flex gap-5"
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-forge-accent-dim flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-forge-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-forge-text">
                  AI-Powered Rewrites
                </h3>
                <p className="text-forge-muted mt-1 text-sm leading-relaxed">
                  Groq-powered language model rewrites your bullet points for
                  impact, specificity, and keyword density without fabricating
                  experience.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
