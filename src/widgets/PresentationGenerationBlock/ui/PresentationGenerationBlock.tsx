"use client";

import React, { useState, useEffect } from "react";
import { PresentationHeader } from "@/features/PresentationHeader";
import { SlidesSidebar } from "@/features/SlidesSidebar";
import { SlideCanvas } from "@/features/SlideCanvas";
import { ToolsPanel } from "@/features/ToolsPanel";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { SlidePreviewContent } from "@/entities/SlidePreviewContent";
import { type ElementOption } from "@/features/ElementSelector";

import SideBarIcon from "../../../../public/icons/SideBarIcon";
import AlphabetIcon from "../../../../public/icons/AlphabetIcon";
import PictureIcon from "../../../../public/icons/PictureIcon";
import GrayTableIcon from "../../../../public/icons/GrayTableIcon";
import GraphIcon from "../../../../public/icons/GraphIcon";
import Image from "next/image";

export const PresentationGenerationBlock = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides] = useState(15);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [generatedSlides, setGeneratedSlides] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolsPanelCollapsed, setIsToolsPanelCollapsed] = useState(false);

  // Simulation of slide generation process
  useEffect(() => {
    if (isGenerating && generatedSlides.length < totalSlides) {
      const timer = setTimeout(() => {
        const nextSlide = generatedSlides.length + 1;
        setGeneratedSlides((prev) => [...prev, nextSlide]);
        // Автоматически переключаемся на только что сгенерированный слайд
        setCurrentSlide(nextSlide);
      }, 2000); // Generate each slide every 2 seconds

      return () => clearTimeout(timer);
    } else if (generatedSlides.length === totalSlides) {
      if (isGenerating) {
        // Показываем уведомление о завершении
        setTimeout(() => {
          setShowFeedback(true);
        }, 1000);
      }
      setIsGenerating(false);
    }
  }, [generatedSlides, totalSlides, isGenerating]);

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
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsToolsPanelCollapsed(!isToolsPanelCollapsed);
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
      <div className="flex-1 flex flex-col">
        <PresentationHeader
          onBack={handleBack}
          onDownload={handleDownload}
          onChangeDesign={handleChangeDesign}
          onShare={handleShare}
        />

        <div className="flex-1 flex relative min-h-0">
          {/* Floating toggle button when sidebar is collapsed */}
          {isSidebarCollapsed && (
            <button
              onClick={handleToggleSidebar}
              className="w-[32px] h-[32px] absolute flex items-center justify-center cursor-pointer rounded-[8px] bg-[#BBA2FE] ease-in-out duration-300 transition-colors ml-4 mt-4"
            >
              <SideBarIcon color="white" />
            </button>
          )}

          <SlidesSidebar
            totalSlides={totalSlides}
            currentSlide={currentSlide}
            generatedSlides={generatedSlides}
            isGenerating={isGenerating}
            isCollapsed={isSidebarCollapsed}
            onSlideClick={setCurrentSlide}
            onToggleCollapse={handleToggleSidebar}
            renderSlideContent={renderSlideContent}
          />
          <SlideCanvas
            currentSlide={currentSlide}
            generatedSlides={generatedSlides}
            isGenerating={isGenerating}
          >
            {isGenerating ? (
              <Image
                src="/assets/presentation/pesentation_generation.png"
                width={759}
                height={427}
                alt="Presentation"
              />
            ) : (
              renderMainSlideContent()
            )}
          </SlideCanvas>

          {!isToolsPanelCollapsed && (
            <ToolsPanel
              isGenerating={isGenerating}
              generatedSlides={generatedSlides}
              totalSlides={totalSlides}
              elementOptions={elementOptions}
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
              onFeedbackClick={() => setShowFeedback(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
