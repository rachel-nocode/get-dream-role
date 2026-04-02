"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import clsx from "clsx";

interface PaymentGateProps {
  onSuccess: () => void;
  returnPath?: string;
}

const features = [
  "Unlimited resume analyses",
  "All 6 ATS platform targets",
  "AI rewrites powered by Groq",
  "Section-by-section feedback",
  "Full optimized resume export",
];

export default function PaymentGate({
  onSuccess,
  returnPath,
}: PaymentGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: returnPath || "/optimize" }),
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

  const handleDismiss = () => {
    // Let the parent decide — call onSuccess with demo mode flag via localStorage
    localStorage.setItem("gdrPaid", "demo");
    onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-xl border border-forge-accent/40 bg-forge-surface p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-forge-accent" />
        <span className="font-display text-base font-semibold text-forge-text">
          Unlock Your Analysis
        </span>
      </div>

      <p className="text-sm text-forge-muted mb-5">
        One-time payment. Everything included.
      </p>

      {/* Price */}
      <div className="mb-5">
        <span className="font-display text-4xl font-bold text-forge-text">
          $9.99
        </span>
        <span className="ml-2 text-sm text-forge-muted">/one-time</span>
      </div>

      {/* Divider */}
      <div className="border-t border-forge-border mb-5" />

      {/* Feature list */}
      <ul className="space-y-2.5 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-forge-success" />
            <span className="text-sm text-forge-text">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-forge-danger/30 bg-forge-danger/5 px-3 py-2.5 text-xs text-forge-danger">
          {error}
        </div>
      )}

      {/* CTA buttons */}
      <button
        type="button"
        onClick={handleUnlock}
        disabled={isLoading}
        className={clsx(
          "w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors",
          isLoading
            ? "bg-forge-border text-forge-muted cursor-not-allowed"
            : "bg-forge-accent text-forge-bg hover:bg-forge-accent-hover",
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to Stripe…
          </>
        ) : (
          "Unlock for $9.99 →"
        )}
      </button>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-forge-muted">
          Secure payment via Stripe. No subscription.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-forge-muted underline underline-offset-2 hover:text-forge-text transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </motion.div>
  );
}
