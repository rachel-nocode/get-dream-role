"use client";

import { motion } from "framer-motion";
import {
  Target,
  FileSearch,
  Upload,
  Sparkles,
  ShieldCheck,
  Hand,
  type LucideIcon,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const atsGrid = [
  "Greenhouse", "Lever", "Workday",
  "iCIMS", "Taleo", "BrassRing",
];

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const pipelineFeatures: Feature[] = [
  {
    icon: FileSearch,
    title: "Job Description Matching",
    description:
      "Extracts required skills, qualifications, and keywords from the job posting, then maps each one to a fact already in your profile, or shows it as a gap.",
  },
  {
    icon: Upload,
    title: "Resume Parsing & Scoring",
    description:
      "Upload your PDF and get an instant ATS compatibility score with a detailed breakdown of what is working and what needs improvement.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Rewrites",
    description:
      "Your own bullets, rewritten in the posting's language, on the model you choose and the key you bring.",
  },
];

const trustFeatures: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Never fabricates",
    description:
      "A deterministic verifier runs after every draft. Every rewritten bullet has to cite a fact from your profile, and any tool, number or credential the text adds comes back as a flagged claim you confirm or reject. The draft cannot be approved until you have.",
  },
  {
    icon: Hand,
    title: "You stay in control",
    description:
      "No bots, no logins we hold, no form submitted from our servers. You open the employer's own page and click submit. Daily and per-company caps keep the volume human, because volume is exactly what gets candidates flagged.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="bg-forge-surface border border-forge-border rounded-xl p-6 flex gap-5"
    >
      <div className="w-10 h-10 shrink-0 rounded-lg bg-forge-accent-dim flex items-center justify-center">
        <Icon className="w-5 h-5 text-forge-accent" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-forge-text">
          {feature.title}
        </h3>
        <p className="text-forge-muted mt-1 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

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
            A complete loop from the boards you watch to the offer, calibrated to
            the hiring platform that will read your application first.
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

          {/* Right — stacked cards */}
          <div className="flex flex-col gap-6">
            {pipelineFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {trustFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
