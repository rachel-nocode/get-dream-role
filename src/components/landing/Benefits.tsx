"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Crosshair, Shield } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save hours of manual optimization",
    description:
      "Stop rewriting your resume from scratch for every application. Get targeted improvements in under a minute.",
  },
  {
    icon: TrendingUp,
    title: "Increase keyword match rates",
    description:
      "Surface the exact terms hiring systems scan for and weave them into your experience naturally.",
  },
  {
    icon: Crosshair,
    title: "Platform-specific targeting",
    description:
      "Greenhouse, Lever, Workday — each parses differently. GetDreamRole adapts to the system reading your resume.",
  },
  {
    icon: Shield,
    title: "Keep your real experience intact",
    description:
      "Rewrites enhance language and keyword density without fabricating skills or inflating your background.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Benefits() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          variants={fadeIn}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="font-display text-3xl font-bold text-forge-text"
        >
          Why job seekers use GetDreamRole
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                custom={i + 1}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="py-6 border-b border-forge-border flex gap-5"
              >
                <Icon className="w-5 h-5 text-forge-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-base font-semibold text-forge-text">
                    {b.title}
                  </h3>
                  <p className="text-forge-muted text-sm mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
