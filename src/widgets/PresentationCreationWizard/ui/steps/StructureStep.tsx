import React, { useState, useEffect } from "react";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import {
  useSelectStructureNew,
  useCreateTitleAndSlidesNew,
} from "@/shared/api/presentation-generation";
import DotsSixIcon from "../../../../../public/icons/DotsSixIcon";
import GrayTrashIcon from "../../../../../public/icons/GrayTrashIcon";
import PlusIcon from "../../../../../public/icons/PlusIcon";
import CreationLoaderIcon from "../../../../../public/icons/CreationLoaderIcon";

interface StructureStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface SlideItem {
  id: number;
  title: string;
  description: string;
}

export const StructureStep: React.FC<StructureStepProps> = ({
  onNext,
  onBack,
}) => {
  const { presentationData, updatePresentationData, setAddSlideModalOpen } =
    usePresentationCreationStore();

  // Новое store для workflow
  const {
    brief,
    slideCountMode,
    slideCount,
    extractedFiles,
    deckTitle,
    uiSlides,
    setSlideCountMode,
    setUiSlides,
    setDeckTitle,
  } = usePresentationFlowStore();

  // API хуки
  const selectStructureMutation = useSelectStructureNew();
  const createTitleAndSlidesMutation = useCreateTitleAndSlidesNew();

  const [isLoading, setIsLoading] = useState(true);
  const [hasGeneratedStructure, setHasGeneratedStructure] = useState(false);
  const [visibleSlidesCount, setVisibleSlidesCount] = useState(0);

  // Используем данные из store
  const slides = uiSlides || [];
  const presentationTitle = deckTitle || "Название презентации";

  useEffect(() => {
    // Add custom CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Автоматический вызов API для выбора структуры при загрузке компонента
  useEffect(() => {
    const autoGenerateStructure = async () => {
      if (!brief || hasGeneratedStructure) {
        return;
      }

      try {
        setIsLoading(true);
        setHasGeneratedStructure(true);

        // Шаг 1: Выбор структуры
        const structureRequest = {
          mode: slideCountMode || "auto",
          userData: {
            topic: brief.topic,
            goal: brief.goal,
            audience: brief.audience,
            keyIdea: brief.keyIdea,
            expectedAction: brief.expectedAction,
            tones: brief.tones,
            files: extractedFiles || [],
          },
          ...(slideCountMode === "fixed" && slideCount
            ? { slideCount: slideCount }
            : {}),
        };

        const structureResult = await selectStructureMutation.mutateAsync(
          structureRequest
        );

        // Парсим структуру и создаем слайды из chosenStructure
        // API возвращает обертку {success, data, statusCode}, поэтому берем из data
        const chosenStructure =
          structureResult.chosenStructure ||
          (structureResult as any).data?.chosenStructure;

        if (chosenStructure) {
          const structureLines = chosenStructure
            .split("\n")
            .filter((line: string) => line.trim())
            .filter((line: string) => /^\d+\./.test(line.trim())); // Только строки, начинающиеся с номера

          const structureSlides = structureLines.map(
            (line: string, index: number) => {
              const title = line.replace(/^\d+\.\s*/, "").trim(); // Убираем номер
              return {
                title: title || "Заголовок",
                summary: "Содержимое будет сгенерировано",
              };
            }
          );

          setUiSlides(structureSlides);

          // Принудительное обновление visibleSlidesCount для анимации
          setTimeout(() => {
            setVisibleSlidesCount(structureSlides.length);
          }, 100);
        }
      } catch (error) {
        console.error(
          "StructureStep: Error during automatic structure generation:",
          error
        );
        setHasGeneratedStructure(false); // Сбрасываем флаг при ошибке
      } finally {
        setIsLoading(false);
      }
    };

    autoGenerateStructure();
  }, [
    brief,
    slideCountMode,
    extractedFiles,
    slideCount,
    hasGeneratedStructure,
  ]);

  useEffect(() => {
    // Показываем все слайды сразу после их загрузки
    setVisibleSlidesCount(slides.length);
  }, [slides.length]);

  const handleTextVolumeChange = (volume: "minimal" | "medium" | "large") => {
    updatePresentationData({ textVolume: volume });
  };

  const handleImageSourceChange = (source: "flux" | "internet" | "mixed") => {
    updatePresentationData({ imageSource: source });
  };

  const handleRemoveSlide = (slideIndex: number) => {
    setUiSlides(slides.filter((_, index) => index !== slideIndex));
  };

  return (
    <div className="w-full  bg-white">
      <div className="flex">
        <div className="flex-1 px-10 py-6">
          {/* Loading text and slides appearing one by one */}
          {isLoading && (
            <>
              <div className="flex items-center justify-center gap-4 pt-[138px]">
                <CreationLoaderIcon className="animate-spin" />
                <span className="text-[24px] font-medium text-[#BBA2FE] leading-[1.3] tracking-[-0.48px]">
                  Наберитесь терпения, ИИ генерирует слайды...
                </span>
              </div>

              {/* Slides appearing during loading */}
              <div className="space-y-3 max-w-[772px] pt-8">
                {slides.slice(0, visibleSlidesCount).map((slide, index) => (
                  <div
                    key={index}
                    className="bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full opacity-0"
                    style={{
                      animation: `fadeInSlide 0.5s ease-in-out ${
                        index * 0.4
                      }s forwards`,
                    }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                          {index + 1}
                        </span>
                        <DotsSixIcon width={32} height={32} />
                      </div>
                      <div className="flex flex-col gap-1 w-[113px]">
                        <h3 className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                          {slide.title}
                        </h3>
                        <p className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px]">
                          {slide.summary}
                        </p>
                      </div>
                    </div>
                    <button className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <GrayTrashIcon width={18} height={20} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Header - only shown when not loading */}
          {!isLoading && (
            <>
              <div className="flex items-center justify-between mb-6 pt-[138px]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
                      {presentationTitle}
                    </h2>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center p-2 ">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.207 3.586 9.414.793A1 1 0 0 0 8 .793L.293 8.5A1 1 0 0 0 0 9.207v2.794a1 1 0 0 0 1 1h2.793a1 1 0 0 0 .707-.294L12.207 5a1 1 0 0 0 0-1.414m-8.414 8.415H1V9.207l5.5-5.5L9.293 6.5zM10 5.793 7.207 3l1.5-1.5L11.5 4.293z"
                          fill="#8F8F92"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                    {slides.length} слайдов
                  </p>
                </div>

                <button
                  onClick={() => setAddSlideModalOpen(true)}
                  className="bg-[#BBA2FE] h-[52px] px-6 pr-4 rounded-[8px] flex items-center gap-2 text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors"
                >
                  Добавить слайд
                  <div className="w-8 h-8 flex items-center justify-center">
                    <PlusIcon fill="white" width={24} height={24} />
                  </div>
                </button>
              </div>

              <div className="space-y-3 w-full max-h-[600px] pb-10 overflow-auto">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full ${
                      index === 1 ? "bg-[#E9E9E9]" : ""
                    } ${
                      index === 3
                        ? "bg-[#E9E9E9] shadow-[0px_0px_10px_0px_rgba(169,169,169,0.4)]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                          {index + 1}
                        </span>
                        <DotsSixIcon width={32} height={32} />
                      </div>
                      <div className="flex flex-col gap-1 w-[113px]">
                        <h3 className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                          {slide.title}
                        </h3>
                        <p className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px]">
                          {slide.summary}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlide(index)}
                      className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <GrayTrashIcon width={18} height={20} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div
          className={`w-[436px] bg-white border-l border-[#E9E9E9] flex flex-col ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          <div className="p-10 flex-1">
            <div className="mb-6">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
                Объем текста
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("minimal")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "minimal"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Минимальный
                  </button>
                  <button
                    onClick={() => handleTextVolumeChange("medium")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "medium"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Средний
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("large")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "large"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Большой
                  </button>
                </div>
              </div>
            </div>

            {/* Image Source */}
            <div className="mb-8">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
                Источник изображений
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageSourceChange("flux")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "flux"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    FLUX
                    <br />
                    (ИИ генерация)
                  </button>
                  <button
                    onClick={() => handleImageSourceChange("internet")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "internet"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Поиск
                    <br />в интернете
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageSourceChange("mixed")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "mixed"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Смешанный
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`w-full h-[110px] bg-white rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-center gap-2 mt-6 px-10">
              <button
                onClick={onBack}
                disabled={isLoading}
                className={`w-[174px] h-[52px] bg-white border border-[#C0C0C1] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-50 transition-colors ${
                  isLoading ? "cursor-not-allowed" : ""
                }`}
              >
                Назад
              </button>
              <button
                onClick={onNext}
                disabled={isLoading}
                className={`flex-1 h-[52px] bg-[#BBA2FE] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Далее
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
