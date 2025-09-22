"use client";

import React, { useEffect, useState, useRef } from "react";
import { PresentationHeader } from "@/features/PresentationHeader";
import { SlidesSidebar } from "@/features/SlidesSidebar";
import { SlideCanvas } from "@/features/SlideCanvas";
import { ToolsPanel } from "@/features/ToolsPanel";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { SlidePreviewContent } from "@/entities/SlidePreviewContent";
import { type ElementOption } from "@/features/ElementSelector";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { useGenerateSlidesForStructureNew } from "@/shared/api/presentation-generation";

import SideBarIcon from "../../../../public/icons/SideBarIcon";
import AlphabetIcon from "../../../../public/icons/AlphabetIcon";
import PictureIcon from "../../../../public/icons/PictureIcon";
import GrayTableIcon from "../../../../public/icons/GrayTableIcon";
import GraphIcon from "../../../../public/icons/GraphIcon";
import { Mascot } from "@/shared/ui/Mascot";

export const PresentationGenerationBlock = () => {
  const {
    currentSlide,
    generatedSlides,
    isGenerating,
    isSidebarCollapsed,
    isToolsPanelCollapsed,
    toggleSidebar,
    setIsGenerating,
  } = usePresentationStore();

  // API хук для генерации презентации
  const generateSlidesMutation = useGenerateSlidesForStructureNew();

  // Состояние для процесса генерации
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Ref для предотвращения повторного запуска генерации
  const hasStartedGeneration = useRef(false);

  // Получение и обработка данных при загрузке компонента
  useEffect(() => {
    // Если генерация уже началась, не запускаем снова
    if (hasStartedGeneration.current) {
      return;
    }

    const startGeneration = async () => {
      try {
        // Помечаем, что генерация началась
        hasStartedGeneration.current = true;
        // Получаем данные из localStorage
        const presentationDataStr = localStorage.getItem(
          "presentationGenerationData"
        );

        if (!presentationDataStr) {
          console.error("No presentation data found in localStorage");
          // Просто показываем пустой редактор вместо редиректа
          setIsGenerating(false);
          return;
        }

        const presentationData = JSON.parse(presentationDataStr);
        console.log(
          "Starting presentation generation with data:",
          presentationData
        );

        setIsGenerating(true);
        setGenerationStatus("Генерация презентации...");
        setGenerationProgress(50);

        // Вызываем API генерации презентации
        const result = await generateSlidesMutation.mutateAsync(
          presentationData
        );

        console.log("Presentation generated successfully:", result);

        // Сохраняем полный результат API в localStorage для редактора
        const generatedPresentation = {
          ...result, // Save the complete API response
          deckTitle: presentationData.deckTitle,
        };

        localStorage.setItem(
          "generatedPresentation",
          JSON.stringify(generatedPresentation)
        );

        // Завершаем процесс генерации - показываем обычный интерфейс
        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating presentation:", error);
        setGenerationStatus("Ошибка при генерации презентации");
        setIsGenerating(false);
      }
    };

    startGeneration();
  }, []);

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

  const handleBack = () => {
    // Убираем редирект, просто логируем
    console.log("Back button clicked - staying on current page");
  };

  const handleDownload = () => {
    console.log("Download presentation");
    // Implement download logic
  };

  const handleShare = () => {
    console.log("Share presentation");
    // Implement share logic
  };

  const handleChangeDesign = () => {
    console.log("Change design");
    // Implement design change
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
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
