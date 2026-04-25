"use client";
import { Check } from "lucide-react";
import clsx from "clsx";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto mb-10">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-700 transition-all duration-300",
                  isDone && "bg-ink text-paper",
                  isActive &&
                    "bg-amber-500 text-ink ring-4 ring-amber-500/20",
                  !isDone && !isActive && "bg-white border border-ink/20 text-ink/40"
                )}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : step}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-body whitespace-nowrap transition-colors duration-300",
                  isActive ? "text-ink font-500" : "text-ink/40"
                )}
              >
                {labels[i]}
              </span>
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div className="flex-1 h-px mx-2 mb-4 transition-all duration-500"
                style={{ background: isDone ? "#0A0A0F" : "#d1cdc5" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
