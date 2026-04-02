"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { BulletRewrite } from "@/lib/types";

interface BulletRewritesProps {
  rewrites: BulletRewrite[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function BulletRewrites({ rewrites }: BulletRewritesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-semibold text-forge-text">
          Bullet Rewrites
        </h2>
        <p className="text-forge-muted text-sm">
          Side-by-side improvements for each bullet point
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rewrites.map((rewrite, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-forge-surface border border-forge-border rounded-xl p-5 flex flex-col gap-4"
          >
            {/* Number badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-forge-elevated border border-forge-border text-xs font-medium text-forge-muted tabular-nums">
                {i + 1}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-forge-muted" />
              <span className="text-xs text-forge-muted">Rewrite</span>
            </div>

            {/* Before / After columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide uppercase text-forge-muted">
                  Before
                </span>
                <p
                  className={clsx(
                    "text-sm leading-relaxed text-forge-danger/80 line-through decoration-forge-danger/30"
                  )}
                >
                  {rewrite.original}
                </p>
              </div>

              {/* After */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide uppercase text-forge-accent">
                  After
                </span>
                <p className="text-sm leading-relaxed text-forge-text">
                  {rewrite.rewritten}
                </p>
              </div>
            </div>

            {/* Improvement explanation */}
            <div className="border-t border-forge-border pt-3">
              <p className="text-sm text-forge-muted italic">
                <span className="not-italic font-medium text-forge-accent">
                  Why:
                </span>{" "}
                {rewrite.improvement}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
