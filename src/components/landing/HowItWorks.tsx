"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Select ATS Target",
    description:
      "Choose the hiring platform the company uses so the engine can calibrate its optimization strategy.",
  },
  {
    num: "02",
    title: "Paste Job Description",
    description:
      "Provide the target role requirements. The system extracts keywords, qualifications, and ranking signals.",
  },
  {
    num: "03",
    title: "Upload Resume",
    description:
      "Drop your PDF and let the engine parse, score, and rewrite your resume for maximum compatibility.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          variants={fadeIn}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="font-display text-3xl font-bold text-forge-text"
        >
          Three steps to a stronger resume
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-forge-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i + 1}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="relative flex flex-col items-start md:items-center text-left md:text-center px-0 md:px-8"
            >
              <div className="relative z-10 w-12 h-12 rounded-full border-2 border-forge-accent bg-forge-bg flex items-center justify-center font-display text-sm font-bold text-forge-accent">
                {step.num}
              </div>
              <h3 className="font-display text-lg font-semibold text-forge-text mt-5">
                {step.title}
              </h3>
              <p className="text-forge-muted text-sm mt-2 max-w-xs leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
