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
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import {
  useGenerateSlidesForStructureNew,
  getMultipleTemplates,
} from "@/shared/api/presentation-generation";

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
    setSlideTemplates,
    setTotalSlides,
  } = usePresentationStore();

  // Получаем данные из PresentationFlowStore для правильного подсчета слайдов
  const { uiSlides } = usePresentationFlowStore();

  // API хук для генерации презентации
  const generateSlidesMutation = useGenerateSlidesForStructureNew();

  // Состояние для процесса генерации
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Ref для предотвращения повторного запуска генерации
  const hasStartedGeneration = useRef(false);

  // Устанавливаем правильное количество слайдов при изменении uiSlides
  useEffect(() => {
    if (uiSlides && uiSlides.length > 0) {
      console.log("Setting total slides from store:", uiSlides.length);
      setTotalSlides(uiSlides.length);
    }
  }, [uiSlides, setTotalSlides]);

  // Получение и обработка данных при загрузке компонента
  useEffect(() => {
    console.log("🔄 PresentationGenerationBlock useEffect called");
    // Если генерация уже началась, не запускаем снова
    if (hasStartedGeneration.current) {
      console.log("⏭️ Generation already started, skipping");
      return;
    }

    // Сначала пытаемся установить количество слайдов даже до начала генерации
    const presentationDataStr = localStorage.getItem(
      "presentationGenerationData"
    );
    if (presentationDataStr) {
      try {
        const presentationData = JSON.parse(presentationDataStr);
        // Приоритет данным из store, затем из localStorage, затем fallback
        const slidesCount =
          uiSlides?.length || presentationData.uiSlides?.length || 3;
        console.log("Early setting total slides to:", slidesCount);
        setTotalSlides(slidesCount);
      } catch (error) {
        console.error(
          "Error parsing presentation data for slides count:",
          error
        );
      }
    }

    const startGeneration = async () => {
      console.log("🚀 startGeneration function called");
      try {
        // Помечаем, что генерация началась
        hasStartedGeneration.current = true;
        console.log("✅ Generation marked as started");

        // Сначала проверяем, есть ли уже готовая презентация с templateIds в localStorage
        const existingPresentationStr = localStorage.getItem(
          "generatedPresentation"
        );
        if (existingPresentationStr) {
          const existingPresentation = JSON.parse(existingPresentationStr);
          console.log(
            "Found existing presentation in localStorage:",
            existingPresentation
          );

          // Проверяем, есть ли templateIds в существующих данных
          const existingTemplateIds =
            existingPresentation?.data?.templateIds ||
            existingPresentation?.templateIds;
          if (existingTemplateIds && existingTemplateIds.length > 0) {
            console.log("Found existing templateIds:", existingTemplateIds);

            // Устанавливаем количество слайдов на основе templateIds
            console.log("Setting total slides to:", existingTemplateIds.length);
            setTotalSlides(existingTemplateIds.length);

            setGenerationStatus("Загрузка шаблонов из сохраненных данных...");
            setGenerationProgress(50);

            try {
              const templates = await getMultipleTemplates(existingTemplateIds);
              console.log(
                "Templates loaded from existing data:",
                Object.keys(templates)
              );

              // Создаем маппинг между templateIds и номерами слайдов
              const slideTemplateMapping: Record<string, string> = {};
              existingTemplateIds.forEach(
                (templateId: string, index: number) => {
                  const slideNumber = index + 1;
                  const slideKey = `slide_${slideNumber}`;
                  if (templates[templateId]) {
                    slideTemplateMapping[slideKey] = templates[templateId];
                  }
                }
              );

              console.log(
                "Slide template mapping from existing data:",
                Object.keys(slideTemplateMapping)
              );
              setSlideTemplates(slideTemplateMapping);
              setGenerationProgress(100);
              setIsGenerating(false);
              return; // Выходим, так как у нас уже есть все данные
            } catch (templateError) {
              console.error(
                "Error loading templates from existing data:",
                templateError
              );
              // Продолжаем с обычной генерацией
            }
          }
        }

        // Если нет готовых данных с templateIds, продолжаем обычную генерацию
        // Получаем данные из localStorage
        console.log("📦 Checking localStorage for presentation data...");
        const presentationDataStr = localStorage.getItem(
          "presentationGenerationData"
        );
        console.log(
          "📦 localStorage data:",
          presentationDataStr ? "Found" : "Not found"
        );

        if (!presentationDataStr) {
          console.error("❌ No presentation data found in localStorage");
          // Просто показываем пустой редактор вместо редиректа
          setIsGenerating(false);
          return;
        }

        const presentationData = JSON.parse(presentationDataStr);

        // Устанавливаем количество слайдов на основе структуры
        // Приоритет данным из store, затем из localStorage, затем fallback
        const slidesCount =
          uiSlides?.length || presentationData.uiSlides?.length || 3;
        console.log("Setting total slides to:", slidesCount);
        setTotalSlides(slidesCount);
        console.log(
          "Starting presentation generation with data:",
          presentationData
        );

        setIsGenerating(true);
        setGenerationStatus("Генерация презентации...");
        setGenerationProgress(50);

        try {
          // Вызываем API генерации презентации
          console.log("🚀 Calling generateSlidesMutation with data:", {
            ...presentationData,
            uiSlides: presentationData.uiSlides?.length || 0,
          });
          console.log("📊 Full presentation data:", presentationData);

          const result = await generateSlidesMutation.mutateAsync(
            presentationData
          );

          console.log("✅ Presentation generated successfully:", result);

          // Получаем templateIds из результата
          const templateIds =
            (result as any).data?.templateIds || result.templateIds || [];
          console.log("Template IDs from API:", templateIds);
          console.log("templateIds.length:", templateIds.length);

          // Загружаем HTML шаблоны, если есть templateIds
          if (templateIds.length > 0) {
            console.log("Starting template loading process...");
            setGenerationStatus("Загрузка шаблонов...");
            setGenerationProgress(75);

            try {
              console.log("Calling getMultipleTemplates with:", templateIds);
              const templates = await getMultipleTemplates(templateIds);
              console.log(
                "Templates loaded successfully:",
                Object.keys(templates)
              );
              console.log("Template data:", templates);

              // Создаем маппинг между templateIds и номерами слайдов
              // templateIds[0] -> slide 1, templateIds[1] -> slide 2, etc.
              const slideTemplateMapping: Record<string, string> = {};
              templateIds.forEach((templateId: string, index: number) => {
                const slideNumber = index + 1;
                const slideKey = `slide_${slideNumber}`;
                if (templates[templateId]) {
                  slideTemplateMapping[slideKey] = templates[templateId];
                  console.log(`Mapped ${templateId} -> ${slideKey}`);
                }
              });

              console.log(
                "Final slide template mapping:",
                Object.keys(slideTemplateMapping)
              );
              setSlideTemplates(slideTemplateMapping);
            } catch (templateError) {
              console.error("Error loading templates:", templateError);
              // Продолжаем даже если шаблоны не загрузились
            }
          } else {
            console.log("No templateIds found in response");
          }

          // Сохраняем полный результат API в localStorage для редактора
          const generatedPresentation = {
            ...result, // Save the complete API response
            deckTitle: presentationData.deckTitle,
          };

          localStorage.setItem(
            "generatedPresentation",
            JSON.stringify(generatedPresentation)
          );

          setGenerationProgress(100);
          // Завершаем процесс генерации - показываем обычный интерфейс
          setIsGenerating(false);
        } catch (generationError) {
          console.error("❌ Error during slide generation:", generationError);
          setGenerationStatus("Ошибка при генерации слайдов");
          setIsGenerating(false);
        }
      } catch (error) {
        console.error("Error generating presentation:", error);
        setGenerationStatus("Ошибка при генерации презентации");
        setIsGenerating(false);
      }
    };

    console.log("🎯 About to call startGeneration");
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
