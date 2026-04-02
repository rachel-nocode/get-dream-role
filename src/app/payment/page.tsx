"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const features = [
  "Unlimited resume analyses",
  "All 6 ATS platform targets (Greenhouse, Lever, Workday, Taleo, iCIMS, Generic)",
  "AI-powered scoring + keyword analysis",
  "Section-by-section feedback",
  "Bullet point rewrites with Groq AI",
  "Full optimized resume export",
  "Copy & download results",
];

export default function PaymentPage() {
  const router = useRouter();
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const paid = localStorage.getItem("gdrPaid");
    if (paid === "true") {
      setAlreadyPaid(true);
    }
  }, []);

  const handleGetAccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: "/optimize" }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Back link */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Top section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-12"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-forge-accent">
          One-Time Access
        </p>
        <h1 className="font-display text-4xl font-bold text-forge-text mb-4 leading-tight">
          Everything you need to get hired.
        </h1>
        <p className="text-forge-muted text-base leading-relaxed max-w-lg">
          One payment unlocks the full GetDreamRole engine. No subscription, no
          upsells.
        </p>
      </motion.div>

      {/* Pricing card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-sm"
      >
        {/* Already paid state */}
        {mounted && alreadyPaid ? (
          <div className="rounded-xl border border-forge-success/30 bg-forge-surface p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forge-success/10 border border-forge-success/30">
                <CheckCircle className="h-7 w-7 text-forge-success" />
              </div>
            </div>
            <p className="font-display text-lg font-semibold text-forge-text mb-1">
              You&apos;re already unlocked
            </p>
            <p className="text-sm text-forge-muted mb-6">
              Full access to GetDreamRole is active on this device.
            </p>
            <button
              type="button"
              onClick={() => router.push("/optimize")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover transition-colors"
            >
              Go to Optimizer
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-forge-border bg-forge-surface p-8">
            {/* Price */}
            <div className="mb-1">
              <span className="font-display text-6xl font-bold text-forge-text">
                $9.99
              </span>
            </div>
            <p className="text-sm text-forge-muted mb-6">One-time payment</p>

            {/* Divider */}
            <div className="border-t border-forge-border mb-6" />

            {/* Feature list */}
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-forge-success" />
                  <span className="text-sm text-forge-text leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-forge-danger/30 bg-forge-danger/5 px-3 py-2.5 text-xs text-forge-danger">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={handleGetAccess}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forge-accent py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:bg-forge-border disabled:text-forge-muted disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  Get Instant Access →
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-forge-muted">
              Secure payment via Stripe. Instant access after payment.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
