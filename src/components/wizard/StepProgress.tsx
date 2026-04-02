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
    <div className="flex items-center justify-center gap-0 py-8">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isClickable =
          step.number < currentStep ||
          (step.number <= currentStep && canNavigate(step.number));

        return (
          <div key={step.number} className="flex items-center">
            {/* Step */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={clsx(
                "flex flex-col items-center gap-2",
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
                  "text-xs font-medium whitespace-nowrap",
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
                  "mx-4 mb-6 h-px w-16 sm:w-24",
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
