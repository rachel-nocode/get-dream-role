"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Profile",
    description:
      "Paste your resume once. It becomes a registry of facts with ids, plus your answers to the screening questions every form asks.",
  },
  {
    num: "02",
    title: "Discover",
    description:
      "Name the company boards and remote feeds you watch. A daily scan pulls new postings, dedupes them, and scores the fit.",
  },
  {
    num: "03",
    title: "Tailor & review",
    description:
      "Each posting gets a resume, a cover letter and screening answers built only from facts you already have. Anything new comes back to you to confirm.",
  },
  {
    num: "04",
    title: "Apply & track",
    description:
      "Copy the answers, open the employer's own form, and click submit yourself. The tracker follows it to the offer, ghosting or no.",
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
          Four steps from posting to offer
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px border-t border-dashed border-forge-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i + 1}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="relative flex flex-col items-start lg:items-center text-left lg:text-center px-0 lg:px-6"
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
