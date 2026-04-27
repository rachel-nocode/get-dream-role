"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Decorative line */}
        <div className="w-16 h-px bg-forge-accent mb-12" />

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-forge-text leading-tight">
            Run the ATS check before you apply.
          </h2>
          <p className="text-forge-muted text-lg mt-4 leading-relaxed">
            Your first analysis is free. Upgrade once for unlimited resume optimizations.
          </p>
          <Link
            href="/optimize"
            className="inline-block mt-8 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
          >
            Get My Free ATS Score &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
