import React, { useState, useEffect, useRef } from "react";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import {
  useSelectStructureNew,
  useCreateTitleAndSlidesNew,
  useAddSlideToStructureNew,
} from "@/shared/api/presentation-generation";
import DotsSixIcon from "../../../../../public/icons/DotsSixIcon";
import GrayTrashIcon from "../../../../../public/icons/GrayTrashIcon";
import PlusIcon from "../../../../../public/icons/PlusIcon";
import CreationLoaderIcon from "../../../../../public/icons/CreationLoaderIcon";
import { AddSlideButton } from "../../../../shared/ui/AddSlideButton";

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
    textVolume,
    imageSource,
    setSlideCountMode,
    setUiSlides,
    setDeckTitle,
    setTextVolume,
    setImageSource,
  } = usePresentationFlowStore();

  // API хуки
  const selectStructureMutation = useSelectStructureNew();
  const createTitleAndSlidesMutation = useCreateTitleAndSlidesNew();
  const addSlideMutation = useAddSlideToStructureNew();

  const [isLoading, setIsLoading] = useState(true);
  const [hasGeneratedStructure, setHasGeneratedStructure] = useState(false);
  const [visibleSlidesCount, setVisibleSlidesCount] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Состояние для добавления нового слайда
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [newSlidePrompt, setNewSlidePrompt] = useState("");
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  // Ref для предотвращения повторных вызовов API
  const hasCalledApi = useRef(false);

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
      // Если нет брифа, уже вызывали API, или уже есть сгенерированные слайды - не генерируем
      if (!brief || hasCalledApi.current || (uiSlides && uiSlides.length > 0)) {
        if (uiSlides && uiSlides.length > 0) {
          console.log(
            "StructureStep: Slides already exist, skipping generation"
          );
          setIsLoading(false);
          setHasGeneratedStructure(true);
        }
        return;
      }

      console.log("StructureStep: Starting structure generation");
      hasCalledApi.current = true;

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
            ? { slideCount: slideCount.toString() }
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

        const structureText =
          structureResult.structureText ||
          (structureResult as any).data?.structureText;

        // Извлекаем название презентации из structureText
        if (structureText) {
          const titleMatch = structureText.match(/^(.+?)\s*\(/);
          if (titleMatch) {
            const presentationTitle = titleMatch[1].trim();
            setDeckTitle(presentationTitle);
          }
        }

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

          // Шаг 2: Генерация названия и детальных слайдов (title+summary)
          try {
            const titleAndSlidesRequest = {
              userData: {
                topic: brief.topic,
                goal: brief.goal,
                audience: brief.audience,
                keyIdea: brief.keyIdea,
                expectedAction: brief.expectedAction,
                tones: brief.tones,
                files: extractedFiles || [],
              },
              chosenStructure: chosenStructure,
            };

            const titleAndSlidesResult =
              await createTitleAndSlidesMutation.mutateAsync(
                titleAndSlidesRequest
              );

            // API возвращает обертку {success, data, statusCode}, поэтому берем из data
            const titleData =
              titleAndSlidesResult.title ||
              (titleAndSlidesResult as any).data?.title;
            const slidesData =
              titleAndSlidesResult.slides ||
              (titleAndSlidesResult as any).data?.slides;

            // Обновляем название презентации
            if (titleData) {
              setDeckTitle(titleData);
            }

            // Обновляем слайды с детальными данными
            if (slidesData && slidesData.length > 0) {
              setUiSlides(slidesData);

              // Обновляем visibleSlidesCount для новых слайдов
              setTimeout(() => {
                setVisibleSlidesCount(slidesData.length);
              }, 200);
            }
          } catch (titleError) {
            console.error(
              "StructureStep: Error generating title and slides:",
              titleError
            );
            // Оставляем структурные слайды в случае ошибки
          }
        }
      } catch (error) {
        console.error(
          "StructureStep: Error during automatic structure generation:",
          error
        );
        hasCalledApi.current = false; // Сбрасываем флаг при ошибке, чтобы можно было повторить
        setHasGeneratedStructure(false);
      } finally {
        setIsLoading(false);
      }
    };

    autoGenerateStructure();
  }, [brief]); // Только brief в зависимостях

  useEffect(() => {
    // Показываем все слайды сразу после их загрузки
    setVisibleSlidesCount(slides.length);
  }, [slides.length]);

  const handleTextVolumeChange = (volume: "minimal" | "medium" | "large") => {
    const mappedVolume =
      volume === "minimal"
        ? "Минимальный"
        : volume === "medium"
        ? "Средний"
        : "Большой";
    setTextVolume(mappedVolume);
  };

  const handleImageSourceChange = (source: "flux" | "internet" | "mixed") => {
    const mappedSource =
      source === "flux"
        ? "Flux"
        : source === "internet"
        ? "Из интернета"
        : "Смешанный";
    setImageSource(mappedSource);
  };

  const handleRemoveSlide = (slideIndex: number) => {
    setUiSlides(slides.filter((_, index) => index !== slideIndex));
  };

  const handleEditTitle = () => {
    setTempTitle(presentationTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setDeckTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTempTitle("");
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelTitle();
    }
  };

  // Функция для добавления нового слайда
  const handleAddSlide = async () => {
    if (!newSlidePrompt.trim() || !brief || !slides.length || isAddingSlide) {
      return;
    }

    try {
      setIsAddingSlide(true);

      // Подготавливаем данные для API
      const addSlideRequest = {
        newSlidePrompt: newSlidePrompt.trim(),
        brief: {
          topic: brief.topic,
          goal: brief.goal,
          audience: brief.audience,
          expectedAction: brief.expectedAction,
          tones: brief.tones || [],
        },
        slides: slides.map((slide) => ({
          title: slide.title,
          summary: slide.summary,
        })),
      };

      // Вызываем API
      const newSlide = await addSlideMutation.mutateAsync(addSlideRequest);

      // Добавляем новый слайд в конец списка
      const updatedSlides = [
        ...slides,
        {
          title: newSlide.title,
          summary: newSlide.summary,
        },
      ];

      setUiSlides(updatedSlides);

      // Закрываем модальное окно и очищаем форму
      setIsAddSlideModalOpen(false);
      setNewSlidePrompt("");

      // Обновляем количество видимых слайдов
      setTimeout(() => {
        setVisibleSlidesCount(updatedSlides.length);
      }, 200);
    } catch (error) {
      console.error("Error adding slide:", error);
    } finally {
      setIsAddingSlide(false);
    }
  };

  // Функция для перегенерации структуры
  const handleRegenerateStructure = async () => {
    if (!brief || isLoading) {
      return;
    }

    try {
      // Очищаем текущие слайды и состояние
      setUiSlides([]);
      setDeckTitle("");

      // Сбрасываем флаги для повторной генерации
      hasCalledApi.current = false;
      setHasGeneratedStructure(false);
      setIsLoading(true);

      console.log("StructureStep: Regenerating structure");

      // Запускаем генерацию заново
      hasCalledApi.current = true;

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
          ? { slideCount: slideCount.toString() }
          : {}),
      };

      const structureResult = await selectStructureMutation.mutateAsync(
        structureRequest
      );

      // Обрабатываем результат так же, как в основной функции
      const chosenStructure =
        structureResult.chosenStructure ||
        (structureResult as any).data?.chosenStructure;

      const structureText =
        structureResult.structureText ||
        (structureResult as any).data?.structureText;

      if (structureText) {
        const titleMatch = structureText.match(/^(.+?)\s*\(/);
        if (titleMatch) {
          const presentationTitle = titleMatch[1].trim();
          setDeckTitle(presentationTitle);
        }
      }

      if (chosenStructure) {
        const structureLines = chosenStructure
          .split("\n")
          .filter((line: string) => line.trim())
          .filter((line: string) => /^\d+\./.test(line.trim()));

        const structureSlides = structureLines.map((line: string) => {
          const title = line.replace(/^\d+\.\s*/, "").trim();
          return {
            title: title || "Заголовок",
            summary: "Содержимое будет сгенерировано",
          };
        });

        setUiSlides(structureSlides);

        // Шаг 2: Генерация названия и детальных слайдов
        try {
          const titleAndSlidesRequest = {
            userData: {
              topic: brief.topic,
              goal: brief.goal,
              audience: brief.audience,
              keyIdea: brief.keyIdea,
              expectedAction: brief.expectedAction,
              tones: brief.tones,
              files: extractedFiles || [],
            },
            chosenStructure: chosenStructure,
          };

          const titleAndSlidesResult =
            await createTitleAndSlidesMutation.mutateAsync(
              titleAndSlidesRequest
            );

          const titleData =
            titleAndSlidesResult.title ||
            (titleAndSlidesResult as any).data?.title;
          const slidesData =
            titleAndSlidesResult.slides ||
            (titleAndSlidesResult as any).data?.slides;

          if (titleData) {
            setDeckTitle(titleData);
          }

          if (slidesData && slidesData.length > 0) {
            setUiSlides(slidesData);
          }
        } catch (titleError) {
          console.error("Error generating title and slides:", titleError);
        }
      }

      setHasGeneratedStructure(true);
    } catch (error) {
      console.error("Error regenerating structure:", error);
      hasCalledApi.current = false;
      setHasGeneratedStructure(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];

    // Remove dragged slide
    newSlides.splice(draggedIndex, 1);

    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSlides.splice(insertIndex, 0, draggedSlide);

    setUiSlides(newSlides);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full opacity-0 cursor-move transition-all duration-200 ${
                      draggedIndex === index ? "opacity-50 scale-95" : ""
                    } ${
                      dragOverIndex === index
                        ? "border-2 border-[#BBA2FE] border-dashed"
                        : ""
                    }`}
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
                        <div className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors">
                          <DotsSixIcon width={32} height={32} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                        <h3 className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                          {slide.title}
                        </h3>
                        <p className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px]">
                          {slide.summary}
                        </p>
                      </div>
                    </div>
                    <button className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
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
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleSaveTitle}
                          autoFocus
                          className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] bg-transparent border-b-2 border-[#BBA2FE] outline-none min-w-[300px]"
                        />
                        <button
                          onClick={handleSaveTitle}
                          className="w-6 h-6 rounded flex items-center justify-center text-green-600 hover:bg-green-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelTitle}
                          className="w-6 h-6 rounded flex items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
                          {presentationTitle}
                        </h2>
                        <button
                          onClick={handleEditTitle}
                          className="w-8 h-8 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100 transition-colors"
                        >
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
                      </>
                    )}
                  </div>
                  <p className="text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                    {slides.length} слайдов
                  </p>
                </div>

                <div className="flex gap-3">
                  <AddSlideButton
                    onClick={() => setIsAddSlideModalOpen(true)}
                    isLoading={isAddingSlide}
                    variant="default"
                  />
                </div>
              </div>

              <div className="space-y-3 w-full max-h-[600px] pb-10 overflow-auto">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full cursor-move transition-all duration-200 ${
                      index === 1 ? "bg-[#E9E9E9]" : ""
                    } ${
                      index === 3
                        ? "bg-[#E9E9E9] shadow-[0px_0px_10px_0px_rgba(169,169,169,0.4)]"
                        : ""
                    } ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === index
                        ? "border-2 border-[#BBA2FE] border-dashed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                          {index + 1}
                        </span>
                        <div className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors">
                          <DotsSixIcon width={32} height={32} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 min-w-[200px] flex-1">
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
                      className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
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
                      textVolume === "Минимальный"
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
                      textVolume === "Средний"
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
                      textVolume === "Большой"
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
                      imageSource === "Flux"
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
                      imageSource === "Из интернета"
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
                      imageSource === "Смешанный"
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

      {/* Модальное окно для добавления нового слайда */}
      {isAddSlideModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-8 w-[600px] max-w-[90vw] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
                Добавить новый слайд
              </h3>
              <button
                onClick={() => {
                  setIsAddSlideModalOpen(false);
                  setNewSlidePrompt("");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-[16px] font-medium text-[#0B0911] leading-[1.2] tracking-[-0.32px] mb-3">
                Описание нового слайда
              </label>
              <textarea
                value={newSlidePrompt}
                onChange={(e) => setNewSlidePrompt(e.target.value)}
                placeholder="Например: Добавь кейс клиента с примером использования продукта..."
                className="w-full h-[120px] p-4 border border-[#E9E9E9] rounded-[8px] text-[16px] font-normal text-[#0B0911] leading-[1.4] tracking-[-0.32px] resize-none focus:outline-none focus:border-[#BBA2FE]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddSlideModalOpen(false);
                  setNewSlidePrompt("");
                }}
                disabled={isAddingSlide}
                className="px-6 py-3 bg-white border border-[#C0C0C1] rounded-[8px] text-[16px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.32px] hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                onClick={handleAddSlide}
                disabled={!newSlidePrompt.trim() || isAddingSlide}
                className="px-6 py-3 bg-[#BBA2FE] rounded-[8px] text-[16px] font-normal text-white leading-[1.2] tracking-[-0.32px] hover:bg-[#A693FD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAddingSlide && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isAddingSlide ? "Добавляем..." : "Добавить слайд"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
