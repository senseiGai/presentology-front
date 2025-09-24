"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PresentationCreationStep } from "../model/types";
import { DescriptionStep } from "./steps/DescriptionStep";
import { StructureStep } from "./steps/StructureStep";
import { StyleStep } from "./steps/StyleStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { usePresentationCreationStore } from "../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import {
  useSelectStructureNew,
  useCreateTitleAndSlidesNew,
  useAddSlideToStructureNew,
} from "@/shared/api/presentation-generation";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";
import Image from "next/image";

import HandWritingIcon from "../../../../public/icons/HandWritingIcon";
import StructureIcon from "../../../../public/icons/StructureIcon";
import PaintIcon from "../../../../public/icons/PainIcon";
import DotsSixIcon from "../../../../public/icons/DotsSixIcon";
import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";
import CreationLoaderIcon from "../../../../public/icons/CreationLoaderIcon";

import LogoIllustration from "../../../../public/icons/LogoIllustration";
import { PresentationMascot } from "@/shared/ui/PesentationMascot";
import SquareCheckIcon from "../../../../public/icons/SquareCheckIcon";
import { AddSlideButton } from "../../../shared/ui/AddSlideButton";

export const PresentationCreationWizard: React.FC = () => {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    presentationData,
    updatePresentationData,
  } = usePresentationCreationStore();

  // Store для workflow
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

  // API хуки для StructureStep
  const selectStructureMutation = useSelectStructureNew();
  const createTitleAndSlidesMutation = useCreateTitleAndSlidesNew();
  const addSlideMutation = useAddSlideToStructureNew();

  // Local state for template selection
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  // Состояние для StructureStep
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

  // Состояние для редактирования слайдов
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<"title" | "summary" | null>(
    null
  );
  const [tempSlideTitle, setTempSlideTitle] = useState("");
  const [tempSlideSummary, setTempSlideSummary] = useState("");

  // Ref для предотвращения повторных вызовов API
  const hasCalledApi = useRef(false);

  // Add responsive breakpoints
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const middleWidth = windowWidth > 1600;
  const topWidth = windowWidth > 1800;

  // Используем данные из store для StructureStep
  const slides = uiSlides || [];
  const presentationTitle = deckTitle || "Название презентации";

  // CSS анимация для StructureStep
  useEffect(() => {
    if (currentStep === "structure") {
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
    }
  }, [currentStep]);

  // Автоматический вызов API для выбора структуры при загрузке компонента
  useEffect(() => {
    if (currentStep !== "structure") return;

    const autoGenerateStructure = async () => {
      if (!brief || hasCalledApi.current || (uiSlides && uiSlides.length > 0)) {
        if (uiSlides && uiSlides.length > 0) {
          setIsLoading(false);
          setHasGeneratedStructure(true);
        }
        return;
      }

      hasCalledApi.current = true;

      try {
        setIsLoading(true);
        setHasGeneratedStructure(true);

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

          setTimeout(() => {
            setVisibleSlidesCount(structureSlides.length);
          }, 100);

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

              setTimeout(() => {
                setVisibleSlidesCount(slidesData.length);
              }, 200);
            }
          } catch (titleError) {
            console.error("Error generating title and slides:", titleError);
          }
        }
      } catch (error) {
        console.error("Error during automatic structure generation:", error);
        hasCalledApi.current = false;
        setHasGeneratedStructure(false);
      } finally {
        setIsLoading(false);
      }
    };

    autoGenerateStructure();
  }, [currentStep, brief]);

  useEffect(() => {
    if (currentStep === "structure") {
      setVisibleSlidesCount(slides.length);
    }
  }, [slides.length, currentStep]);

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
    !!brief?.topic && !!brief?.goal && !!brief?.audience;
  const isStructureComplete =
    slides.length > 0 && !!textVolume && !!imageSource;
  const isStyleComplete =
    !!presentationData.selectedTemplate || !!presentationData.selectedStyle;

  const isCompleted =
    isDescriptionComplete && isStructureComplete && isStyleComplete;

  // Debug logging

  const handleTemplateSelect = (templateId: string) => {
    updatePresentationData({ selectedTemplate: templateId });
  };

  // Обработчики для StructureStep
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

  const handleEditSlide = (slideIndex: number, field: "title" | "summary") => {
    const slide = slides[slideIndex];
    setEditingSlideId(slideIndex);
    setEditingField(field);

    if (field === "title") {
      setTempSlideTitle(slide.title);
    } else {
      setTempSlideSummary(slide.summary);
    }
  };

  const handleSaveSlideEdit = () => {
    if (editingSlideId === null || editingField === null) return;

    const updatedSlides = [...slides];
    const slide = updatedSlides[editingSlideId];

    if (editingField === "title" && tempSlideTitle.trim()) {
      slide.title = tempSlideTitle.trim();
    } else if (editingField === "summary" && tempSlideSummary.trim()) {
      slide.summary = tempSlideSummary.trim();
    }

    setUiSlides(updatedSlides);
    handleCancelSlideEdit();
  };

  const handleCancelSlideEdit = () => {
    setEditingSlideId(null);
    setEditingField(null);
    setTempSlideTitle("");
    setTempSlideSummary("");
  };

  const handleSlideKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveSlideEdit();
    } else if (e.key === "Escape") {
      handleCancelSlideEdit();
    }
  };

  const handleAddSlide = async () => {
    if (!newSlidePrompt.trim() || !brief || !slides.length || isAddingSlide) {
      return;
    }

    try {
      setIsAddingSlide(true);

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

      const newSlide = await addSlideMutation.mutateAsync(addSlideRequest);

      const updatedSlides = [
        ...slides,
        {
          title: newSlide.title,
          summary: newSlide.summary,
        },
      ];

      setUiSlides(updatedSlides);

      setIsAddSlideModalOpen(false);
      setNewSlidePrompt("");

      setTimeout(() => {
        setVisibleSlidesCount(updatedSlides.length);
      }, 200);
    } catch (error) {
      console.error("Error adding slide:", error);
    } finally {
      setIsAddingSlide(false);
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

    newSlides.splice(draggedIndex, 1);

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

  const handleBack = () => {
    if (currentStep === "description") {
      router.push("/home");
    } else {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        // Если возвращаемся на шаг описания, сбрасываем структуру
        if (steps[prevIndex].key === "description") {
          setUiSlides([]);
          setHasGeneratedStructure(false);
          setVisibleSlidesCount(0);
          hasCalledApi.current = false;
        }
        setCurrentStep(steps[prevIndex].key);
      }
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      // Если переходим с описания на структуру, сбрасываем структуру для регенерации
      if (
        currentStep === "description" &&
        steps[nextIndex].key === "structure"
      ) {
        setUiSlides([]);
        setHasGeneratedStructure(false);
        setVisibleSlidesCount(0);
        hasCalledApi.current = false;
      }
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
          <div className="bg-white h-[100px] border-t rounded-tl-[16px] rounded-tr-[16px] border-[#f0f0f0] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)]">
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
      <div className="w-full bg-white">
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

        <div className="flex">
          {/* Main content area */}
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
                        <div className="flex flex-col gap-1 flex-1 min-w-0 mr-4">
                          {/* Заголовок слайда */}
                          {editingSlideId === index &&
                          editingField === "title" ? (
                            <input
                              type="text"
                              value={tempSlideTitle}
                              onChange={(e) =>
                                setTempSlideTitle(e.target.value)
                              }
                              onKeyDown={handleSlideKeyPress}
                              onBlur={handleSaveSlideEdit}
                              autoFocus
                              className="text-[18px] w-full min-w-[400px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none"
                            />
                          ) : (
                            <h3
                              onClick={() => handleEditSlide(index, "title")}
                              className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all"
                              title="Нажмите для редактирования"
                            >
                              {slide.title}
                            </h3>
                          )}

                          {/* Описание слайда */}
                          {editingSlideId === index &&
                          editingField === "summary" ? (
                            <textarea
                              value={tempSlideSummary}
                              onChange={(e) =>
                                setTempSlideSummary(e.target.value)
                              }
                              onKeyDown={handleSlideKeyPress}
                              onBlur={handleSaveSlideEdit}
                              autoFocus
                              rows={3}
                              className="text-[14px] w-full min-w-[100%] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none resize-none"
                            />
                          ) : (
                            <p
                              onClick={() => handleEditSlide(index, "summary")}
                              className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all"
                              title="Нажмите для редактирования"
                            >
                              {slide.summary}
                            </p>
                          )}
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
                <div className="flex items-start justify-between mb-6 pt-[138px]">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
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
                          <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] max-w-[480px] 2xl:max-w-[700px]">
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

                {/* Main slides list */}
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
                      } ${
                        draggedIndex === index ? "opacity-50 scale-95" : ""
                      } ${
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
                        <div className="flex flex-col gap-1 min-w-[200px] flex-1 mr-4">
                          {/* Заголовок слайда */}
                          {editingSlideId === index &&
                          editingField === "title" ? (
                            <input
                              type="text"
                              value={tempSlideTitle}
                              onChange={(e) =>
                                setTempSlideTitle(e.target.value)
                              }
                              onKeyDown={handleSlideKeyPress}
                              onBlur={handleSaveSlideEdit}
                              autoFocus
                              className="text-[18px] w-full min-w-[400px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none"
                            />
                          ) : (
                            <h3
                              onClick={() => handleEditSlide(index, "title")}
                              className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all"
                              title="Нажмите для редактирования"
                            >
                              {slide.title}
                            </h3>
                          )}

                          {/* Описание слайда */}
                          {editingSlideId === index &&
                          editingField === "summary" ? (
                            <textarea
                              value={tempSlideSummary}
                              onChange={(e) =>
                                setTempSlideSummary(e.target.value)
                              }
                              onKeyDown={handleSlideKeyPress}
                              onBlur={handleSaveSlideEdit}
                              autoFocus
                              rows={3}
                              className="text-[14px] w-full min-w-[500px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none resize-none"
                            />
                          ) : (
                            <p
                              onClick={() => handleEditSlide(index, "summary")}
                              className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all"
                              title="Нажмите для редактирования"
                            >
                              {slide.summary}
                            </p>
                          )}
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

          {/* Right sidebar - StructureStep settings */}
          <div
            className={`w-[436px] bg-white border-l border-[#E9E9E9] flex flex-col ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            <StructureStep onNext={handleNext} onBack={handleBack} />
          </div>
        </div>

        {/* Modal for adding new slide */}
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
