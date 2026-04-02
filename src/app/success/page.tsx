"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react";

const unlockItems = [
  "Unlimited resume analyses",
  "All ATS platform targets",
  "AI-powered bullet rewrites with Groq",
  "Section-by-section feedback",
];

type Status = "loading" | "success" | "error";

function SuccessPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const demo = searchParams.get("demo");

    const verify = async () => {
      try {
        let url = "/api/verify-payment";
        if (demo === "true") {
          url += "?demo=true";
        } else if (sessionId) {
          url += `?session_id=${encodeURIComponent(sessionId)}`;
        } else {
          setStatus("error");
          return;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.paid) {
          localStorage.setItem("gdrPaid", "true");
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams]);

  const returnUrl = searchParams.get("return") || "/optimize";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-forge-accent" />
          <p className="text-sm text-forge-muted">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-16 w-16 text-forge-danger" />
          </div>
          <h1 className="font-display text-2xl font-bold text-forge-text mb-3">
            Payment not confirmed
          </h1>
          <p className="text-forge-muted text-sm mb-8">
            We couldn&apos;t verify your payment. If you completed checkout, please
            wait a moment and try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/payment"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-forge-border px-6 py-3 text-sm font-medium text-forge-muted hover:text-forge-text hover:border-forge-border-bright transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-lg w-full mx-auto"
      >
        {/* Checkmark */}
        <div className="mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35, ease: "backOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-forge-accent/10 border border-forge-accent/30"
          >
            <CheckCircle className="h-10 w-10 text-forge-accent" />
          </motion.div>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-forge-text mb-3">
            You&apos;re all set.
          </h1>
          <p className="text-forge-muted text-base leading-relaxed">
            Your resume optimization engine is ready. Let&apos;s build something
            that gets you hired.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <button
            onClick={() => router.push(returnUrl)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-forge-accent px-6 py-3 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover transition-colors"
          >
            Continue to Optimizer
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-forge-border px-6 py-3 text-sm font-medium text-forge-muted hover:text-forge-text hover:border-forge-border-bright transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* What you unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
        >
          <p className="text-xs font-medium text-forge-muted uppercase tracking-widest mb-4">
            What you unlocked
          </p>
          <ul className="space-y-3">
            {unlockItems.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-forge-accent" />
                <span className="text-sm text-forge-text">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forge-accent" />
      </div>
    }>
      <SuccessPageInner />
    </Suspense>
  );
}
