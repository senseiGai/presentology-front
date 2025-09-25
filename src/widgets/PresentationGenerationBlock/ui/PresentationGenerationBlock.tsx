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
import {
  useMixedImageGeneration,
  useFluxImageGeneration,
} from "@/shared/api/images";

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

  // API хуки для генерации изображений
  const fluxImageMutation = useFluxImageGeneration();
  const mixedImageMutation = useMixedImageGeneration();

  // Состояние для процесса генерации
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Ref для предотвращения повторного запуска генерации
  const hasStartedGeneration = useRef(false);

  // Функция для замены изображений из Unsplash на наши сгенерированные
  const replaceUnsplashImagesWithGenerated = async (
    result: any,
    imageSource: string
  ) => {
    console.log("🖼️ Checking if images need replacement...");
    console.log("🔍 Image source:", imageSource);
    console.log("🔍 Result data:", result?.data);

    if (!result?.data?.slides) {
      console.log("❌ No slides found in result");
      return result;
    }

    // Проверяем, нужно ли генерировать изображения
    // Только если явно указано "Из интернета", то оставляем Unsplash изображения
    // Во всех остальных случаях заменяем на наши сгенерированные
    if (imageSource === "Из интернета" || imageSource === "internet") {
      console.log("🔄 Image source is 'Из интернета', keeping Unsplash images");
      return result;
    }

    console.log(
      "🚀 Image source requires generated images, proceeding with replacement..."
    );

    const slides = result.data.slides;
    let hasUnsplashImages = false;

    // Проверяем, есть ли изображения из Unsplash
    for (let slide of slides) {
      console.log("🔍 Checking slide:", slide.title);
      if (slide._images && slide._images.length > 0) {
        console.log("🔍 Slide images:", slide._images);
        for (let imageUrl of slide._images) {
          console.log("🔍 Checking image URL:", imageUrl);
          if (
            imageUrl.includes("images.unsplash.com") ||
            imageUrl.includes("unsplash.com")
          ) {
            console.log("✅ Found Unsplash image:", imageUrl);
            hasUnsplashImages = true;
            break;
          }
        }
      }
      if (hasUnsplashImages) break;
    }

    console.log("🔍 Has Unsplash images:", hasUnsplashImages);

    if (!hasUnsplashImages) {
      console.log("✅ No Unsplash images found, no replacement needed");
      return result;
    }

    console.log("🔄 Found Unsplash images, generating replacements...");
    setGenerationStatus("Генерация собственных изображений...");

    try {
      // Клонируем результат для изменения
      const updatedResult = JSON.parse(JSON.stringify(result));

      // Обрабатываем каждый слайд
      for (let i = 0; i < updatedResult.data.slides.length; i++) {
        const slide = updatedResult.data.slides[i];

        if (slide._images && slide._images.length > 0) {
          const newImages = [];

          for (let imageUrl of slide._images) {
            console.log(`🔍 Processing image URL: ${imageUrl}`);
            if (
              imageUrl.includes("images.unsplash.com") ||
              imageUrl.includes("unsplash.com")
            ) {
              console.log(
                `🔄 Replacing Unsplash image for slide ${i + 1}: ${imageUrl}`
              );

              try {
                // Создаем промпт на основе контента слайда
                const slidePrompt = createImagePromptFromSlide(
                  slide,
                  result.data.deck?.title || ""
                );
                console.log(
                  `🖼️ Generated prompt for slide ${i + 1}: ${slidePrompt}`
                );

                let generatedImageUrl;

                console.log(
                  `🚀 Starting image generation with source: ${imageSource}`
                );

                if (imageSource === "Flux") {
                  // Генерируем с помощью Flux
                  console.log("🎨 Using Flux API for image generation");
                  const fluxResult = await fluxImageMutation.mutateAsync({
                    prompt: slidePrompt,
                    count: 1,
                    size: "1024x1024",
                  });
                  console.log("🎨 Flux API result:", fluxResult);
                  generatedImageUrl = fluxResult.data?.urls?.[0];
                } else {
                  // Для всех остальных случаев (включая "Смешанный", "investors", etc.) используем Mixed API
                  console.log("🎭 Using Mixed API for image generation");
                  const mixedResult = await mixedImageMutation.mutateAsync({
                    model: "flux",
                    count: 1,
                    prompts: [slidePrompt],
                    fluxSize: "1024x1024",
                  });
                  console.log("🎭 Mixed API result:", mixedResult);
                  generatedImageUrl = mixedResult.data?.images?.[0];
                }

                if (generatedImageUrl) {
                  console.log(
                    `✅ Generated new image for slide ${i + 1}:`,
                    generatedImageUrl
                  );
                  newImages.push(generatedImageUrl);
                } else {
                  console.warn(
                    `⚠️ Failed to generate image for slide ${
                      i + 1
                    }, keeping original`
                  );
                  newImages.push(imageUrl);
                }
              } catch (imageError) {
                console.error(
                  `❌ Error generating image for slide ${i + 1}:`,
                  imageError
                );
                newImages.push(imageUrl); // Fallback к оригинальному изображению
              }
            } else {
              // Это уже наше изображение или TTapi изображение
              newImages.push(imageUrl);
            }
          }

          slide._images = newImages;
        }
      }

      console.log("✅ Image replacement completed");
      return updatedResult;
    } catch (error) {
      console.error("❌ Error during image replacement:", error);
      return result; // Возвращаем оригинальный результат в случае ошибки
    }
  };

  // Функция для создания промпта изображения на основе слайда
  const createImagePromptFromSlide = (
    slide: any,
    deckTitle: string
  ): string => {
    const slideTitle = slide.title || "";
    const slideSubtitle = slide.subtitle || "";

    console.log("🔍 Creating prompt from slide:", {
      slideTitle,
      slideSubtitle,
      deckTitle,
    });

    // Базовый промпт на основе заголовка слайда
    let prompt = `Professional business illustration about "${slideTitle}"`;

    if (slideSubtitle) {
      prompt += `, ${slideSubtitle}`;
    }

    if (deckTitle) {
      prompt += `, in context of "${deckTitle}"`;
    }

    // Добавляем стандартные стилистические указания
    prompt +=
      ", clean modern design, professional, high quality, business style, minimal background, corporate, digital art";

    console.log("✅ Generated prompt:", prompt);
    return prompt;
  };

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
        // Приоритет данным из localStorage, так как это актуальные данные для генерации
        const slidesCount =
          presentationData.uiSlides?.length || uiSlides?.length || 3;
        console.log(
          "🔢 Early setting total slides to:",
          slidesCount,
          "from localStorage data"
        );
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
          presentationData.uiSlides?.length || uiSlides?.length || 3;
        console.log("📊 Slides count from data:", {
          "presentationData.uiSlides.length": presentationData.uiSlides?.length,
          "uiSlides.length": uiSlides?.length,
          "final slidesCount": slidesCount,
        });
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

          // Заменяем изображения из Unsplash на наши сгенерированные (если нужно)
          let finalResult = result;
          try {
            finalResult = await replaceUnsplashImagesWithGenerated(
              result,
              presentationData.imageSource || "Смешанный"
            );
            console.log("✅ Image replacement completed");
          } catch (imageReplacementError) {
            console.error(
              "❌ Error during image replacement:",
              imageReplacementError
            );
            // Продолжаем с оригинальным результатом
          }

          // Получаем templateIds из результата
          const templateIds =
            (finalResult as any).data?.templateIds ||
            finalResult.templateIds ||
            [];
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
            ...finalResult, // Save the complete API response with replaced images
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
