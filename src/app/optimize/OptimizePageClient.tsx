"use client";

import { useCallback, useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Zap } from "lucide-react";
import clsx from "clsx";

import { useWizardState, clearWizardStorage } from "@/hooks/useWizardState";
import { ATS_OPTIONS, ATSTarget } from "@/lib/types";
import StepProgress from "@/components/wizard/StepProgress";
import StepATS from "@/components/wizard/StepATS";
import StepJobDescription from "@/components/wizard/StepJobDescription";
import StepUpload from "@/components/wizard/StepUpload";
import PaymentGate from "@/components/payment/PaymentGate";
import { api } from "../../../convex/_generated/api";

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

function OptimizePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [hasLocalPaidAccess, setHasLocalPaidAccess] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const entitlements = useQuery(
    api.entitlements.getForCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const urlParamApplied = useRef(false);

  const {
    state,
    hydrated,
    isAnalyzing,
    error,
    setError,
    setIsAnalyzing,
    setAtsTarget,
    setJobTitle,
    setJobDescription,
    setResumeFile,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
  } = useWizardState();

  const direction = 1;

  useEffect(() => {
    if (hydrated && !urlParamApplied.current) {
      urlParamApplied.current = true;
      if (state.atsTarget === null) {
        const atsParam = searchParams.get("ats") as ATSTarget | null;
        if (atsParam && ATS_OPTIONS.some((option) => option.id === atsParam)) {
          setAtsTarget(atsParam);
        }
      }
    }
  }, [hydrated, searchParams, setAtsTarget, state.atsTarget]);

  useEffect(() => {
    try {
      if (localStorage.getItem("gdrPaid") === "true") {
        setHasLocalPaidAccess(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const hasFreeUsed = useCallback(() => {
    try {
      return localStorage.getItem("gdrFreeUsed") === "true";
    } catch {
      return false;
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!canProceed(3)) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          atsTarget: state.atsTarget,
          jobTitle: state.jobTitle,
          jobDescription: state.jobDescription,
          resumeText: state.resumeText,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Analysis failed. Please try again.");
      }

      const result = await response.json();
      sessionStorage.setItem("gdrResult", JSON.stringify(result));
      try {
        localStorage.setItem("gdrFreeUsed", "true");
      } catch {
        // ignore storage errors
      }
      clearWizardStorage();
      router.push("/results");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setIsAnalyzing(false);
    }
  }, [canProceed, router, setError, setIsAnalyzing, state]);

  const hasPaidAccess =
    hasLocalPaidAccess ||
    entitlements?.some(
      (entitlement) =>
        entitlement.kind === "optimizer_lifetime" && entitlement.status === "active",
    ) === true;

  const handleAnalyze = useCallback(() => {
    if (!canProceed(3)) return;
    if (hasPaidAccess || !hasFreeUsed()) {
      runAnalysis();
      return;
    }
    setShowPaymentGate(true);
  }, [canProceed, hasFreeUsed, hasPaidAccess, runAnalysis]);

  const handleContinue = useCallback(() => {
    if (state.step === 3) {
      handleAnalyze();
    } else {
      nextStep();
    }
  }, [handleAnalyze, nextStep, state.step]);

  const canNavigateToStep = useCallback(
    (step: number): boolean => {
      for (let index = 1; index < step; index += 1) {
        if (!canProceed(index)) return false;
      }
      return true;
    },
    [canProceed],
  );

  const handleStepClick = useCallback(
    (step: number) => {
      if (step < state.step || canNavigateToStep(step)) {
        goToStep(step);
        setShowPaymentGate(false);
      }
    },
    [canNavigateToStep, goToStep, state.step],
  );

  return (
    <>
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forge-bg/90"
          >
            <Loader2 className="mb-6 h-12 w-12 animate-spin text-forge-accent" />
            <p className="font-display text-xl font-bold text-forge-text">
              Building your optimized resume...
            </p>
            <p className="mt-2 text-sm text-forge-muted">
              Analyzing keywords, scoring sections, and generating improvements
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-forge-muted transition-colors hover:text-forge-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <h1 className="font-display text-3xl font-bold text-forge-text">
          Optimize Your Resume
        </h1>

        <StepProgress
          currentStep={state.step}
          onStepClick={handleStepClick}
          canNavigate={canNavigateToStep}
        />

        <div className="relative min-h-[420px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {state.step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <StepATS
                  selectedTarget={state.atsTarget}
                  onSelect={setAtsTarget}
                />
              </motion.div>
            )}

            {state.step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <StepJobDescription
                  jobTitle={state.jobTitle}
                  jobDescription={state.jobDescription}
                  onJobTitleChange={setJobTitle}
                  onJobDescriptionChange={setJobDescription}
                />
              </motion.div>
            )}

            {state.step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <StepUpload
                  resumeFileName={state.resumeFileName}
                  resumeText={state.resumeText}
                  onFileSelect={setResumeFile}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-forge-danger/30 bg-forge-danger/5 px-4 py-3 text-sm text-forge-danger">
            {error}
          </div>
        )}

        <AnimatePresence>
          {showPaymentGate && state.step === 3 && (
            <PaymentGate
              returnPath="/optimize"
              onSuccess={() => {
                setShowPaymentGate(false);
                runAnalysis();
              }}
            />
          )}
        </AnimatePresence>

        {!showPaymentGate && (
          <div className="mt-8 flex items-center justify-between border-t border-forge-border pt-6">
            <div>
              {state.step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 rounded-xl border border-forge-border px-5 py-2.5 text-sm font-medium text-forge-muted transition-colors hover:border-forge-border-bright hover:text-forge-text disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canProceed(state.step) || isAnalyzing}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors",
                canProceed(state.step) && !isAnalyzing
                  ? "bg-forge-accent text-forge-bg hover:bg-forge-accent-hover"
                  : "cursor-not-allowed bg-forge-border text-forge-muted",
              )}
            >
              {state.step === 3 ? (
                <>
                  Analyze Resume
                  <Zap className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function OptimizePageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-forge-accent" />
        </div>
      }
    >
      <OptimizePageInner />
    </Suspense>
  );
}
