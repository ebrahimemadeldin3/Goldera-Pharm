"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ForecastStepId = 1 | 2 | 3 | 4;

export interface StepItem {
  id: ForecastStepId;
  label: string;
  description: string;
}

const STEPS: StepItem[] = [
  { id: 1, label: "Setup", description: "Period & Year" },
  { id: 2, label: "Products", description: "Select catalog" },
  { id: 3, label: "Allocation", description: "Assign to doctors" },
  { id: 4, label: "Review", description: "Summary & Submit" },
];

interface ForecastStepperProps {
  currentStep: ForecastStepId;
  onStepClick?: (step: ForecastStepId) => void;
  maxAccessibleStep?: ForecastStepId;
}

export function ForecastStepper({
  currentStep,
  onStepClick,
  maxAccessibleStep = 4,
}: ForecastStepperProps) {
  return (
    <div className="w-full">
      {/* Mobile Stepper Header (< 768px) */}
      <div className="flex items-center justify-between rounded-[12px] border border-[#E5E8EF] bg-white p-3.5 md:hidden">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#168557]">
            Step {currentStep} of 4
          </span>
          <p className="text-sm font-bold text-[#182033]">
            {STEPS.find((s) => s.id === currentStep)?.label}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={cn(
                "h-2 rounded-full transition-all",
                step.id === currentStep
                  ? "w-6 bg-[#168557]"
                  : step.id < currentStep
                  ? "w-2 bg-[#168557]"
                  : "w-2 bg-[#E5E8EF]"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop Light Workflow Line Stepper (>= 768px) */}
      <nav aria-label="Forecast creation steps" className="hidden md:block">
        <ol className="flex items-center justify-between rounded-[14px] border border-[#E5E8EF] bg-white p-4">
          {STEPS.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isClickable =
              onStepClick &&
              step.id <= (maxAccessibleStep || currentStep) &&
              step.id !== currentStep;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center flex-1",
                  index < STEPS.length - 1 && "relative"
                )}
              >
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center gap-2.5 outline-none transition-all group",
                    isClickable ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  {/* Small Circle Badge */}
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                      isCurrent
                        ? "bg-[#168557] text-white shadow-xs ring-4 ring-[#E9F8F1]"
                        : isCompleted
                        ? "bg-[#168557] text-white"
                        : "bg-[#F4F6FA] text-[#667085] border border-[#E5E8EF]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3.5 stroke-[3]" />
                    ) : (
                      step.id
                    )}
                  </span>

                  {/* Step Label */}
                  <div className="text-left">
                    <p
                      className={cn(
                        "text-xs font-bold leading-none transition-colors",
                        isCurrent || isCompleted
                          ? "text-[#182033]"
                          : "text-[#667085]"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] font-medium text-[#667085] mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>

                {/* Connecting Line between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 transition-colors",
                      step.id < currentStep ? "bg-[#168557]" : "bg-[#E5E8EF]"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
