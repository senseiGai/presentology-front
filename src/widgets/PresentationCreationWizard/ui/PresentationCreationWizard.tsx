"use client";

import React, { useState } from "react";
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
import SquareCheckIcon from "../../../../public/icons/SquareCheckIcon";

export const PresentationCreationWizard: React.FC = () => {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    presentationData,
    updatePresentationData,
  } = usePresentationCreationStore();

  // Local state for template selection
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  // Add responsive breakpoints
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const middleWidth = windowWidth > 1600;
  const topWidth = windowWidth > 1800;

  // Define templates
  const templates = [
    {
      title: "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ",
      subtitle: "Подзаголовок\nв две строки",
      layout: "two-column",
    },
    {
      title: "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ",
      subtitle: "Подзаголовок\nв две строки",
      layout: "four-column",
    },
  ];

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

  const handleTemplateSelect = (templateId: string) => {
    updatePresentationData({ selectedTemplate: templateId });
  };

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
      <div className="bg-white w-full h-[832px] flex">
        {/* Logo */}
        <div className="absolute top-6 left-10 z-20">
          <LogoIllustration />
        </div>

        {/* Progress Indicator */}
        <div
          className="absolute top-6 z-20"
          style={{
            left: "calc(33.333% + 1.833px)",
            transform: "translateX(-50%)",
          }}
        >
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            isCompleted={isCompleted}
          />
        </div>

        <div className="flex-1 relative">
          <div className="absolute bg-[#F4F4F4] h-[686px] rounded-[24px] top-[122px] w-full">
            <div className="absolute font-medium text-[#0B0911] text-[24px] top-[48px] left-1/2 transform -translate-x-1/2">
              Выберите шаблон
            </div>

            <div className="absolute left-1/2 top-[124px] transform -translate-x-1/2">
              <div
                onClick={() => {
                  setSelectedTemplateIndex(0);
                  handleTemplateSelect(templates[0].layout);
                }}
                className={`cursor-pointer ${
                  selectedTemplateIndex === 0
                    ? "bg-[#BBA2FE] p-2 rounded-[24px]"
                    : "p-0"
                } w-[413px] h-[239px] flex items-center justify-center`}
              >
                <div className="relative w-[397px] h-[223px] rounded-[16px] overflow-hidden">
                  <Image
                    src="/assets/presentation/presentation01.png"
                    width={397}
                    height={223}
                    alt="Presentation"
                    className="w-full h-full object-cover"
                  />
                  {selectedTemplateIndex === 0 && (
                    <div className="absolute top-2 right-2 ">
                      <SquareCheckIcon />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Template 2 */}
            <div className="absolute left-1/2 top-[387px] transform -translate-x-1/2">
              <div
                onClick={() => {
                  setSelectedTemplateIndex(1);
                  handleTemplateSelect(templates[1].layout);
                }}
                className={`cursor-pointer ${
                  selectedTemplateIndex === 1
                    ? "bg-[#BBA2FE] p-2 rounded-[24px]"
                    : "p-0"
                } w-[413px] h-[239px] flex items-center justify-center`}
              >
                <div className="relative w-[397px] h-[223px] rounded-[16px] overflow-hidden">
                  <Image
                    src="/assets/presentation/presentation01.png"
                    width={397}
                    height={223}
                    alt="Presentation"
                    className="w-full h-full object-cover"
                  />
                  {selectedTemplateIndex === 1 && (
                    <div className="absolute top-2 right-2 ">
                      <SquareCheckIcon />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[436px] max-h-[832px] bg-white relative flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <StyleStep onBack={handleBack} />
          </div>

          {/* Bottom Action Buttons */}
          <div className="bg-white h-[100px] border-t border-[#f0f0f0] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-center h-full px-10">
              <div className="flex gap-2 w-[356px] h-[52px]">
                <button
                  onClick={handleBack}
                  className="bg-white border border-[#C0C0C1] rounded-lg px-6 py-2 h-[52px] flex items-center justify-center"
                >
                  <span className="font-normal text-[#0B0911] text-[18px]">
                    Назад
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (isCompleted) {
                      // Navigate to presentation generation page
                      router.push("/presentation-generation");
                    }
                  }}
                  disabled={!isCompleted}
                  className={`flex-1 rounded-lg px-6 py-2 h-[52px] flex items-center justify-center ${
                    isCompleted
                      ? "bg-[#BBA2FE] hover:bg-[#A78BFA] cursor-pointer"
                      : "bg-[#DDD1FF] text-white cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`font-normal text-[18px] ${
                      isCompleted ? "text-white" : "text-white"
                    }`}
                  >
                    Создать презентацию
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
            {topWidth ? (
              <Image
                src="/assets/brief_mask_top.png"
                width={1329}
                height={686}
                alt="Presentation"
                className="absolute w-full h-full select-none"
              />
            ) : middleWidth ? (
              <Image
                src="/assets/brief_mask_middle.png"
                width={1129}
                height={686}
                alt="Presentation"
                className="absolute w-full h-full select-none"
              />
            ) : (
              <Image
                src="/assets/brief_mask_bg.png"
                width={809}
                height={686}
                alt="Presentation"
                className="absolute w-full h-full select-none"
              />
            )}
            <div className="relative">
              <PresentationMascot
                className={`!absolute ${
                  topWidth
                    ? "w-[429px] !h-[475px] bottom-[-780px] left-[830px]"
                    : middleWidth
                    ? "w-[429px] !h-[475px] bottom-[-780px] left-[730px]"
                    : "w-[429px] !h-[475px] bottom-[-780px] left-[630px]"
                } transform -translate-x-1/2 rotate-[-30deg]`}
              />
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
