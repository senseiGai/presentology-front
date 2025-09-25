import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { DeleteConfirmationModal } from "@/shared/ui/DeleteConfirmationModal";
import { SlideTypeChangePopup } from "@/shared/ui/SlideTypeChangePopup/SlideTypeChangePopup";
import { useSlideTypeChangePopup } from "@/shared/hooks/useSlideTypeChangePopup";
import { useSlideNavigation } from "@/shared/hooks/useSlideNavigation";
import {
  useChangeSlideTemplate,
  usePickSlideTemplates,
} from "@/shared/api/presentation-generation";
import { toast } from "sonner";

import Image from "next/image";
import SparksIcon from "@/../public/icons/SparksIcon";
import GrayTrashIcon from "@/../public/icons/GrayTrashIcon";
import { PresentationMascot } from "@/shared/ui/PesentationMascot";
import GenerationLoaderIcon from "../../../../public/icons/GenerationLoaderIcon";
interface SlideCanvasProps {
  children?: React.ReactNode;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = () => {
  const [deleteConfirmSlide, setDeleteConfirmSlide] = useState<{
    slideNumber: number;
    slideIndex: number;
  } | null>(null);

  const [currentSlideForTypeChange, setCurrentSlideForTypeChange] = useState<
    number | null
  >(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Record<number, HTMLDivElement>>({});

  const {
    generatedSlides,
    totalSlides,
    isGenerating,
    currentSlide,
    setCurrentSlide,
    deleteSlideByIndex,
    zoomLevel,
    clearTextSelection,
    setScrollToSlideInCanvas,
    setSelectedTextElement,
    setSelectedImageElement,
    setSelectedTableElement,
    setSelectedInfographicsElement,
    clearImageAreaSelection,
  } = usePresentationStore();

  const { scrollToSlide } = useSlideNavigation({
    slideRefs,
    scrollContainerRef,
  });

  // Hooks for API calls
  const changeSlideTemplateMutation = useChangeSlideTemplate();
  const pickTemplatesMutation = usePickSlideTemplates();

  // State for available templates
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);

  // Function to get templates for a slide
  const getTemplatesForSlide = async (
    title: string,
    summary: string
  ): Promise<string[]> => {
    try {
      console.log(`🔍 Getting templates for slide: ${title}`);

      const response = await pickTemplatesMutation.mutateAsync({
        uiSlides: [{ title, summary }],
        volume: "Средний",
        seed: Math.floor(Math.random() * 1000),
      });

      if (
        response.success &&
        response.data?.uiSlides &&
        response.data.uiSlides.length > 0
      ) {
        const protoId = response.data.uiSlides[0].protoId;
        if (protoId) {
          console.log(`✅ Got template for slide: ${protoId}`);
          return [protoId];
        }
      }

      console.warn(`⚠️ No templates found for slide: ${title}`);
      return ["proto_118"]; // fallback
    } catch (error) {
      console.error(`❌ Error getting templates for slide: ${title}`, error);
      return ["proto_118"]; // fallback
    }
  };

  // Function to convert templateIndex and contentType to protoId
  const getProtoId = async (
    contentType: string,
    templateIndex: number,
    slideIndex: number
  ): Promise<string> => {
    console.log(
      `🎨 Getting protoId for contentType: ${contentType}, templateIndex: ${templateIndex}, slideIndex: ${slideIndex}`
    );

    try {
      // Create slide title and summary based on content type
      let slideTitle = `Слайд ${slideIndex + 1}`;
      let slideSummary = "";

      switch (contentType) {
        case "title":
          slideTitle = "Титульный слайд";
          slideSummary = "Заголовок и основная идея презентации";
          break;
        case "infographic":
          slideTitle = "Инфографика";
          slideSummary = "Визуальное представление данных и статистики";
          break;
        case "contacts":
          slideTitle = "Контакты";
          slideSummary = "Контактная информация и способы связи";
          break;
        case "timeline":
          slideTitle = "Таймлайн";
          slideSummary = "Хронологическая последовательность событий";
          break;
        case "divider":
          slideTitle = "Разделитель";
          slideSummary = "Переход между разделами презентации";
          break;
        case "blocks":
          slideTitle = `Контентный слайд (${templateIndex + 1} блок${
            templateIndex > 0 ? "а" : ""
          })`;
          slideSummary = "Основной контент с текстовыми блоками";
          break;
        default:
          slideSummary = "Содержимое слайда";
      }

      // Get templates from API
      const templates = await getTemplatesForSlide(slideTitle, slideSummary);

      // Select template based on templateIndex or use the first available
      const selectedTemplate =
        templates[templateIndex] || templates[0] || "proto_118";

      console.log(
        `✅ Selected template: ${selectedTemplate} for ${contentType}`
      );
      return selectedTemplate;
    } catch (error) {
      console.error(`❌ Error getting protoId for ${contentType}:`, error);

      // Fallback to static templates if API fails
      const fallbackTemplates = {
        title: [
          "proto_101",
          "proto_102",
          "proto_103",
          "proto_104",
          "proto_105",
        ],
        infographic: [
          "proto_118",
          "proto_119",
          "proto_120",
          "proto_121",
          "proto_122",
        ],
        contacts: ["proto_301", "proto_302", "proto_303"],
        timeline: ["proto_401", "proto_402", "proto_403"],
        divider: ["proto_501", "proto_502", "proto_503"],
        blocks: [
          "proto_601",
          "proto_602",
          "proto_603",
          "proto_604",
          "proto_605",
          "proto_606",
          "proto_607",
          "proto_608",
        ],
      };

      const templates = fallbackTemplates[
        contentType as keyof typeof fallbackTemplates
      ] || ["proto_118"];
      const selectedTemplate = templates[templateIndex] || templates[0];

      console.log(`� Fallback template selected: ${selectedTemplate}`);
      return selectedTemplate;
    }
  };

  const { isOpen, openPopup, closePopup, handleConfirm } =
    useSlideTypeChangePopup(
      async (textBlockCount, contentType, templateIndex) => {
        console.log(`Changing slide ${currentSlideForTypeChange} type to:`, {
          textBlockCount,
          contentType,
          templateIndex,
        });

        if (currentSlideForTypeChange === null) {
          console.error("No slide selected for type change");
          toast.error("Не выбран слайд для изменения");
          return;
        }

        try {
          // Since generatedSlides contains slide numbers, we need to create mock slide data
          // In the future, this should come from actual slide data store
          const currentSlideNumber = currentSlideForTypeChange + 1; // Convert index to slide number

          // Get the appropriate template ID
          const protoId = await getProtoId(
            contentType,
            templateIndex,
            currentSlideForTypeChange
          );

          // Get neighbor slides for context
          const neighborLeft =
            currentSlideForTypeChange > 0
              ? {
                  title: `Слайд ${currentSlideNumber - 1}`,
                  summary: "Контекст предыдущего слайда",
                }
              : undefined;

          const neighborRight =
            currentSlideForTypeChange < totalSlides - 1
              ? {
                  title: `Слайд ${currentSlideNumber + 1}`,
                  summary: "Контекст следующего слайда",
                }
              : undefined;

          // Prepare the request data based on your JSON example
          const requestData = {
            protoId,
            deckTitle: "Маркетинговая стратегия 2025", // You might want to get this from store
            slideData: {
              title: `Слайд ${currentSlideNumber}`,
              subtitle: "Финансовые метрики",
              text1: "Выручка +14% к Q/Q",
              text2: {
                t1: "ROMI",
                t2: "2.4",
              },
              table: [
                ["Метрика", "Q2", "Q3"],
                ["CAC", "120", "109"],
              ],
            },
            neighborLeft,
            neighborRight,
            userData: {
              files: [
                {
                  name: "kpi.txt",
                  type: "text/plain",
                  text: "Описание метрик и методологии...",
                },
              ],
            },
            volume: "Средний",
            rewrite: {
              mode: "mixed",
              preserveTarget: 0.6,
              preserveMin: 0.3,
              preserveMax: 0.8,
            },
            globalFonts: {
              _fontScale: 0.95,
              _fontSizes: {
                title: 48,
                subtitle: 28,
                t1: 20,
                t2: 18,
                badge: 14,
              },
            },
          };

          console.log("🚀 Sending change template request:", requestData);
          toast.promise(changeSlideTemplateMutation.mutateAsync(requestData), {
            loading: "Изменяем тип слайда...",
            success: (response) => {
              console.log("✅ Template changed successfully:", response);
              // Here you might want to update the slide in your store
              // updateSlideInStore(currentSlideForTypeChange, response.data);
              return "Тип слайда успешно изменен!";
            },
            error: (error) => {
              console.error("❌ Template change failed:", error);
              return `Ошибка при изменении типа слайда: ${error.message}`;
            },
          });
        } catch (error) {
          console.error("💥 Error in slide type change:", error);
          toast.error("Произошла ошибка при изменении типа слайда");
        }

        closePopup();
        setCurrentSlideForTypeChange(null);
      }
    );

  const findCenterSlide = useCallback(() => {
    if (!scrollContainerRef.current || isGenerating) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    let closestSlide = 1;
    let closestDistance = Infinity;

    // Check all generated slides to find the one closest to center
    generatedSlides.forEach((slideNumber) => {
      const slideElement = slideRefs.current[slideNumber];
      if (slideElement) {
        const slideRect = slideElement.getBoundingClientRect();
        const slideCenter = slideRect.top + slideRect.height / 2;
        const distance = Math.abs(slideCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSlide = slideNumber;
        }
      }
    });

    if (
      closestSlide !== currentSlide &&
      generatedSlides.includes(closestSlide)
    ) {
      setCurrentSlide(closestSlide);
    }
  }, [currentSlide, generatedSlides, isGenerating, setCurrentSlide]);

  // Throttled scroll handler to avoid too many updates
  const handleScroll = useCallback(() => {
    const timeoutId = setTimeout(findCenterSlide, 100);
    return () => clearTimeout(timeoutId);
  }, [findCenterSlide]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(findCenterSlide, 100);
    };

    container.addEventListener("scroll", throttledScroll);
    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [findCenterSlide]);

  // Register scroll function in store for use by sidebar
  useEffect(() => {
    setScrollToSlideInCanvas(scrollToSlide);
    return () => setScrollToSlideInCanvas(undefined);
  }, [scrollToSlide, setScrollToSlideInCanvas]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear text selection if clicking on the canvas background
    if (e.target === e.currentTarget) {
      clearTextSelection();

      // Close all panels by clearing selections
      setSelectedTextElement(null);
      setSelectedImageElement(null);
      setSelectedTableElement(null);
      setSelectedInfographicsElement(null);
      clearImageAreaSelection();
    }
  };

  // Во время генерации показываем только градиентный фон
  if (isGenerating) {
    return (
      <div className="relative bg-[#BBA2FE66] flex-1 min-h-screen">
        <div className="relative w-[759px] h-[427px] overflow-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/assets/presentation/presentation_gen.png"
            width={759}
            height={427}
            alt="Presentation"
            className="absolute w-full h-full select-none"
          />
          <div className="relative">
            <GenerationLoaderIcon className="animate-spin absolute top-[47px] left-[90px]" />
          </div>
          <div className="relative">
            <PresentationMascot className="!absolute w-[429px] !h-[475px] bottom-[-585px] left-[380px] transform -translate-x-1/2 " />
          </div>
        </div>
      </div>
    );
  }

  const renderSlide = (slideNumber: number) => {
    const isGenerated = generatedSlides.includes(slideNumber);
    const slideType = getSlideType(slideNumber);

    console.log(
      `🎬 SlideCanvas: rendering slide ${slideNumber}, isGenerated: ${isGenerated}, generatedSlides:`,
      generatedSlides
    );

    // Показываем SlideContent для всех слайдов (как сгенерированных, так и плейсхолдеров)
    return (
      <div>
        <SlideContent slideNumber={slideNumber} slideType={slideType} />
      </div>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 bg-[#BBA2FE66] overflow-y-auto"
      style={{ height: "calc(100vh - 80px)" }}
      onClick={handleCanvasClick}
    >
      <div
        className="flex flex-col items-center mt-[116px] mb-[32px]"
        style={{
          gap: `${32 * (zoomLevel / 100)}px`, // Scale gap with zoom level to maintain visual density
        }}
      >
        {Array.from({ length: totalSlides }, (_, index) => {
          const slideNumber = index + 1;
          const isGenerated = generatedSlides.includes(slideNumber);
          const scale = zoomLevel / 100;

          return (
            <React.Fragment key={`slide-${slideNumber}-${totalSlides}`}>
              <div
                ref={(el) => {
                  if (el) {
                    slideRefs.current[slideNumber] = el;
                  }
                }}
                className="flex flex-col items-center"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                }}
              >
                {/* Show buttons for all slides but only enable delete for generated ones */}
                <div className="flex mr-auto gap-2 mb-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isGenerated) {
                        setCurrentSlideForTypeChange(slideNumber);
                        openPopup();
                      }
                    }}
                    className={`flex items-center justify-center gap-2 w-[250px] h-[40px] bg-white rounded-[8px] border border-[#E5E7EB] transition-colors ${
                      isGenerated
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isGenerated}
                  >
                    <SparksIcon className="w-5 h-5" />
                    <span className="text-[#0B0911] text-[18px] font-normal">
                      Изменить тип слайда
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isGenerated) {
                        console.log(
                          `[DEBUG] Deleting slide ${slideNumber} from position ${
                            index + 1
                          }`
                        );
                        console.log(
                          `[DEBUG] generatedSlides:`,
                          generatedSlides
                        );
                        console.log(`[DEBUG] slideNumber:`, slideNumber);
                        console.log(`[DEBUG] array index:`, index);
                        console.log(
                          `[DEBUG] slideIndex to pass:`,
                          slideNumber - 1
                        );
                        setDeleteConfirmSlide({
                          slideNumber,
                          slideIndex: slideNumber - 1, // Use slideNumber - 1 as the actual index
                        });
                      }
                    }}
                    className={`flex items-center justify-center w-[40px] h-[40px] bg-white rounded-[8px] border border-[#E5E7EB] transition-colors ${
                      isGenerated
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isGenerated}
                  >
                    <GrayTrashIcon className="w-4 h-5" />
                  </button>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove manual slide selection since it's now handled by scroll
                    // if (isGenerated) setCurrentSlide(slideNumber);
                  }}
                  className="cursor-default"
                >
                  {renderSlide(slideNumber)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteConfirmSlide !== null}
        slideNumber={deleteConfirmSlide?.slideNumber || 0}
        onConfirm={() => {
          if (deleteConfirmSlide) {
            console.log(
              `[DEBUG] Confirming delete for slide: ${deleteConfirmSlide.slideNumber} at index: ${deleteConfirmSlide.slideIndex}`
            );
            console.log(
              `[DEBUG] Current generatedSlides before delete:`,
              generatedSlides
            );
            console.log(`[DEBUG] Current totalSlides:`, totalSlides);
            deleteSlideByIndex(deleteConfirmSlide.slideIndex);
            setDeleteConfirmSlide(null);
          }
        }}
        onCancel={() => setDeleteConfirmSlide(null)}
      />

      <SlideTypeChangePopup
        isOpen={isOpen}
        onClose={() => {
          closePopup();
          setCurrentSlideForTypeChange(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
