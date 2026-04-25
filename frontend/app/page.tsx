"use client";
import { useState } from "react";
import { ChevronLeft, Brain } from "lucide-react";
import { BusinessMetadata, OnboardingStep } from "@/lib/types";
import StepIndicator from "@/components/ui/StepIndicator";
import HomePage from "@/components/layout/HomePage";
import Step1 from "@/components/layout/Step1";
import Step2 from "@/components/layout/Step2";
import Step3 from "@/components/layout/Step3";
import Step4 from "@/components/layout/Step4";

const STEP_LABELS = ["Business", "Operations", "Goals", "Analyse"];

const emptyMetadata: Partial<BusinessMetadata> = {};

export default function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<OnboardingStep>(1);
  const [metadata, setMetadata] = useState<Partial<BusinessMetadata>>(emptyMetadata);

  const updateMetadata = (updates: Partial<BusinessMetadata>) => {
    setMetadata((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    if (step === 1) return !!metadata.businessName && !!metadata.businessType && !!metadata.location;
    if (step === 2) return true; // Step 2 is optional enrichment
    if (step === 3) return !!metadata.goal && !!metadata.currentProblem;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as OnboardingStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
    else setStarted(false);
  };

  const handleReset = () => {
    setStarted(false);
    setStep(1);
    setMetadata(emptyMetadata);
  };

  if (!started) {
    return <HomePage onStart={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink/5 sticky top-0 bg-paper/90 backdrop-blur-sm z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-body text-ink/50 hover:text-ink transition-colors"
        >
          <ChevronLeft size={16} />
          {step === 1 ? "Home" : "Back"}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-ink rounded-md flex items-center justify-center">
            <Brain size={12} className="text-amber-400" />
          </div>
          <span className="font-display font-700 text-sm text-ink">DecideAI</span>
        </div>

        <div className="w-16" /> {/* spacer */}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-8">
        <StepIndicator
          currentStep={step}
          totalSteps={4}
          labels={STEP_LABELS}
        />

        {step === 1 && <Step1 data={metadata} onChange={updateMetadata} />}
        {step === 2 && <Step2 data={metadata} onChange={updateMetadata} />}
        {step === 3 && <Step3 data={metadata} onChange={updateMetadata} />}
        {step === 4 && <Step4 metadata={metadata} onReset={handleReset} />}

        {/* Navigation — hide on step 4 (output handles its own flow) */}
        {step < 4 && (
          <div className="mt-10 flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 border-2 border-ink/10 rounded-xl py-3 font-body text-sm text-ink/60 hover:border-ink/30 hover:text-ink transition-all duration-200"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-2 flex-1 bg-ink text-paper py-3 rounded-xl font-display font-600 text-sm disabled:opacity-30 hover:bg-ink/80 transition-all duration-200"
            >
              {step === 3 ? "Analyse my business →" : "Continue →"}
            </button>
          </div>
        )}

        {/* Step 2 skip option */}
        {step === 2 && (
          <p className="text-center text-xs font-body text-ink/30 mt-3">
            All fields optional — skip anytime
          </p>
        )}
      </main>
    </div>
  );
}
