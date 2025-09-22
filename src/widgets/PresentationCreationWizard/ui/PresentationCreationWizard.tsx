"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PresentationCreationStep } from "../model/types";
import { DescriptionStep } from "./steps/DescriptionStep";
import { StructureStep } from "./steps/StructureStep";
import { StyleStep } from "./steps/StyleStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { usePresentationCreationStore } from "../model/usePresentationCreationStore";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";
import Image from "next/image";

import HandWritingIcon from "../../../../public/icons/HandWritingIcon";
import StructureIcon from "../../../../public/icons/StructureIcon";
import PaintIcon from "../../../../public/icons/PainIcon";

import LogoIllustration from "../../../../public/icons/LogoIllustration";
import { PresentationMascot } from "@/shared/ui/PesentationMascot";

export const PresentationCreationWizard: React.FC = () => {
  const router = useRouter();
  const { currentStep, setCurrentStep, presentationData } =
    usePresentationCreationStore();

  // Add responsive breakpoints
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const steps: {
    key: PresentationCreationStep;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "description", label: "Описание", icon: <HandWritingIcon /> },
    { key: "structure", label: "Структура", icon: <StructureIcon /> },
    { key: "style", label: "Стиль", icon: <PaintIcon /> },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  // Check if all steps are completed based on required fields for each step
  const isDescriptionComplete =
    !!presentationData.topic &&
    !!presentationData.goal &&
    !!presentationData.audience;
  const isStructureComplete =
    presentationData.slideCount > 0 &&
    !!presentationData.textVolume &&
    !!presentationData.imageSource;
  const isStyleComplete =
    !!presentationData.selectedTemplate || !!presentationData.selectedStyle;

  const isCompleted =
    isDescriptionComplete && isStructureComplete && isStyleComplete;

  const handleBack = () => {
    if (currentStep === "description") {
      router.push("/home");
    } else {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        setCurrentStep(steps[prevIndex].key);
      }
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "description":
        return <DescriptionStep onNext={handleNext} onBack={handleBack} />;
      case "structure":
        return <StructureStep onNext={handleNext} onBack={handleBack} />;
      case "style":
        return <StyleStep onBack={handleBack} />;
      default:
        return null;
    }
  };

  if (currentStep === "style") {
    return (
      <div className="bg-white w-full h-screen overflow-hidden">
        {/* Logo - responsive positioning */}
        <div
          className={`absolute top-6 z-20 ${isMobile ? "left-4" : "left-10"}`}
        >
          <LogoIllustration />
        </div>
        <div
          className="absolute top-6 z-20"
          style={{
            left: isMobile ? "50%" : "calc(33.333% + 1.833px)",
            transform: "translateX(-50%)",
          }}
        >
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            isCompleted={isCompleted}
          />
        </div>
        <div className="w-full h-full">{renderCurrentStep()}</div>
      </div>
    );
  }

  if (currentStep === "structure") {
    return (
      <div className="bg-white w-full h-screen overflow-hidden">
        {/* Logo - responsive positioning */}
        <div
          className={`absolute top-6 z-20 ${isMobile ? "left-4" : "left-10"}`}
        >
          <LogoIllustration />
        </div>
        <div
          className="absolute top-6 z-20"
          style={{
            left: isMobile ? "50%" : "calc(33.333% + 1.833px)",
            transform: "translateX(-50%)",
          }}
        >
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            isCompleted={isCompleted}
          />
        </div>

        {/* Structure Step Content */}
        <div className="w-full h-full">{renderCurrentStep()}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white relative overflow-hidden ${
        isMobile ? "flex-col" : "flex"
      }`}
    >
      {/* Logo - responsive positioning */}
      <div className={`absolute top-6 z-20 ${isMobile ? "left-4" : "left-0"}`}>
        <LogoIllustration />
      </div>

      <div
        className="absolute top-6 z-20"
        style={{
          left: isMobile ? "50%" : "calc(33.333% + 1.833px)",
          transform: "translateX(-50%)",
        }}
      >
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          isCompleted={isCompleted}
        />
      </div>

      {/* Background Image - hide on mobile for better UX */}
      {!isMobile && (
        <div className="relative flex-1">
          <div className="relative w-full h-[686px] overflow-hidden left-1/2 transform -translate-x-1/2 top-[122px]">
            <Image
              src="/assets/brief_mask_bg.png"
              width={809}
              height={686}
              alt="Presentation"
              className="absolute w-full h-full select-none"
            />
            <div className="relative">
              <PresentationMascot className="!absolute w-[429px] !h-[475px] bottom-[-780px] left-[630px] transform -translate-x-1/2 rotate-[-30deg]" />
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-white relative overflow-hidden ${
          isMobile
            ? "w-full pt-20"
            : isTablet
            ? "w-96 max-h-[832px]"
            : "w-[436px] max-h-[832px]"
        }`}
      >
        {renderCurrentStep()}
      </div>
    </div>
  );
};
