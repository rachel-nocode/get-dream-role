"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

const STEPS = [
  { number: 1, label: "Target ATS" },
  { number: 2, label: "Job Details" },
  { number: 3, label: "Upload Resume" },
];

interface StepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigate: (step: number) => boolean;
}

export default function StepProgress({
  currentStep,
  onStepClick,
  canNavigate,
}: StepProgressProps) {
  return (
    <div className="flex w-full items-start justify-center overflow-hidden py-8">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isClickable =
          step.number < currentStep ||
          (step.number <= currentStep && canNavigate(step.number));

        return (
          <div key={step.number} className="flex min-w-0 flex-1 items-start justify-center sm:flex-none">
            {/* Step */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={clsx(
                "flex min-w-0 flex-col items-center gap-2 text-center",
                isClickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              {/* Circle */}
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "border-forge-accent bg-forge-accent text-forge-bg",
                  isActive &&
                    "border-forge-accent bg-forge-accent/10 text-forge-accent",
                  !isCompleted &&
                    !isActive &&
                    "border-forge-border text-forge-muted",
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  "max-w-20 text-[11px] font-medium leading-tight sm:max-w-none sm:text-xs",
                  isActive && "text-forge-accent",
                  isCompleted && "text-forge-text",
                  !isActive && !isCompleted && "text-forge-muted",
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={clsx(
                  "mx-1 mt-5 h-px min-w-6 flex-1 sm:mx-4 sm:w-24 sm:flex-none",
                  currentStep > step.number
                    ? "bg-forge-accent"
                    : "bg-forge-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
