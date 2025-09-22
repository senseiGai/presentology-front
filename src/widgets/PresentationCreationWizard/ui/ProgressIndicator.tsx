import React from "react";
import { PresentationCreationStep } from "../model/types";

interface ProgressIndicatorProps {
  steps: Array<{
    key: PresentationCreationStep;
    label: string;
    icon: React.ReactNode;
  }>;
  currentStep: PresentationCreationStep;
  isCompleted?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  isCompleted = false,
}) => {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);
  const totalSteps = steps.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress Bar */}

      {/* Steps */}
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isStepCompleted = index < currentIndex || isCompleted;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-3 w-[83px]">
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                    isStepCompleted
                      ? "bg-[#4ade80]"
                      : isActive
                      ? "bg-[#bba2fe]"
                      : "bg-[#f4f4f4]"
                  }`}
                >
                  {isActive && !isCompleted && (
                    <div className="absolute w-[52px] h-[52px] rounded-full bg-[#bba2fe] opacity-40 -z-10" />
                  )}

                  <div className="w-6 h-6 flex items-center justify-center text-lg relative z-10">
                    {step.icon}
                  </div>
                </div>

                <div
                  className={`text-[18px] font-semibold leading-[1.2] tracking-[-0.36px] text-center whitespace-nowrap ${
                    isActive ? "text-[#0b0911]" : "text-[#bebec0]"
                  }`}
                >
                  {step.label}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex flex-col items-center h-[74px] w-[120px] pt-5">
                  <div className="w-full h-1 bg-[#f4f4f4] rounded-lg relative">
                    {isStepCompleted && (
                      <div
                        className={`absolute left-0 top-0 h-full w-[120px] rounded-lg ${
                          isCompleted ? "bg-[#4ade80]" : "bg-[#4ade80]"
                        }`}
                      />
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
