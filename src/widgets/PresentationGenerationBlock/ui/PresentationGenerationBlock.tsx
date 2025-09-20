"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PresentationHeader } from "@/features/PresentationHeader";
import { SlidesSidebar } from "@/features/SlidesSidebar";
import { SlideCanvas } from "@/features/SlideCanvas";
import { ToolsPanel } from "@/features/ToolsPanel";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { SlidePreviewContent } from "@/entities/SlidePreviewContent";
import { type ElementOption } from "@/features/ElementSelector";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { useSlideGeneration } from "@/shared/hooks/useSlideGeneration";

import SideBarIcon from "../../../../public/icons/SideBarIcon";
import AlphabetIcon from "../../../../public/icons/AlphabetIcon";
import PictureIcon from "../../../../public/icons/PictureIcon";
import GrayTableIcon from "../../../../public/icons/GrayTableIcon";
import GraphIcon from "../../../../public/icons/GraphIcon";
import Image from "next/image";
import { Mascot } from "@/shared/ui/Mascot";

export const PresentationGenerationBlock = () => {
  const searchParams = useSearchParams();
  const {
    currentSlide,
    generatedSlides,
    isGenerating,
    isSidebarCollapsed,
    isToolsPanelCollapsed,
    toggleSidebar,
  } = usePresentationStore();

  // Custom hook for slide generation logic
  useSlideGeneration();

  // Debug: log search params and localStorage
  useEffect(() => {
    console.log("Search params:", searchParams.toString());
    console.log("ID from URL:", searchParams.get("id"));

    // Check localStorage for presentation data
    const structureData = localStorage.getItem("presentationStructure");
    const briefData = localStorage.getItem("presentationBrief");

    console.log("Structure data from localStorage:", structureData);
    console.log("Brief data from localStorage:", briefData);
  }, [searchParams]);

  const elementOptions: ElementOption[] = [
    {
      id: "text",
      label: "Текст",
      icon: <AlphabetIcon />,
    },
    {
      id: "image",
      label: "Изображение",
      icon: <PictureIcon />,
    },
    {
      id: "table",
      label: "Таблица",
      icon: <GrayTableIcon />,
    },
    {
      id: "chart",
      label: "Инфографика",
      icon: <GraphIcon />,
    },
  ];

  const handleDownload = () => {
    console.log("Download presentation");
    // Implement download logic
  };

  const handleShare = () => {
    console.log("Share presentation");
    // Implement share logic
  };

  const handleBack = () => {
    console.log("Navigate back");
    // Implement navigation back
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleChangeDesign = () => {
    console.log("Change design");
    // Implement design change
  };

  const renderSlideContent = (slideNumber: number) => {
    return (
      <SlidePreviewContent
        slideNumber={slideNumber}
        isGenerated={generatedSlides.includes(slideNumber)}
        isCurrentlyGenerating={
          isGenerating && slideNumber === generatedSlides.length + 1
        }
      />
    );
  };

  const renderMainSlideContent = () => {
    const slideType = getSlideType(currentSlide);
    const isCurrentSlideGenerating =
      isGenerating && currentSlide === generatedSlides.length + 1;

    return (
      <SlideContent
        slideNumber={currentSlide}
        slideType={slideType}
        isGenerating={isCurrentSlideGenerating}
      />
    );
  };

  return (
    <div className="h-screen bg-[#F8F9FA] flex overflow-hidden">
      <div className="flex-1 flex-col">
        <PresentationHeader
          onBack={handleBack}
          onDownload={handleDownload}
          onChangeDesign={handleChangeDesign}
          onShare={handleShare}
          isGenerating={isGenerating}
        />

        <div className="flex-1 flex relative min-h-0">
          {isSidebarCollapsed && (
            <button
              onClick={handleToggleSidebar}
              className="w-[32px] h-[32px] absolute flex items-center justify-center cursor-pointer rounded-[8px] bg-[#BBA2FE] ease-in-out duration-300 transition-colors ml-4 mt-4"
            >
              <SideBarIcon color="white" />
            </button>
          )}

          <SlidesSidebar renderSlideContent={renderSlideContent} />
          <SlideCanvas />

          {!isToolsPanelCollapsed && (
            <ToolsPanel elementOptions={elementOptions} />
          )}
        </div>
      </div>
    </div>
  );
};
