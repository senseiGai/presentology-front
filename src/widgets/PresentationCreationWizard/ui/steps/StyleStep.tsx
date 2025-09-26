import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import { useCreatePresentationWithData } from "@/shared/api/presentations";
import SquareCheckIcon from "../../../../../public/icons/SquareCheckIcon";
import Image from "next/image";

interface StyleStepProps {
  onBack: () => void;
}

export const StyleStep: React.FC<StyleStepProps> = ({ onBack }) => {
  const router = useRouter();
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();

  // Хук для создания презентации в базе данных
  const createPresentationMutation = useCreatePresentationWithData();

  // Новое store для workflow
  const {
    brief,
    deckTitle,
    uiSlides,
    textVolume,
    imageSource,
    extractedFiles,
    selectedTheme,
    selectedTemplate,
    setSelectedTheme,
    setSelectedTemplate,
  } = usePresentationFlowStore();

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
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

  const styles = [
    {
      name: "Современный",
      description: "Чистый и минималистичный дизайн",
      color: "#A78BFA",
      bgColor: "#F3F4F6",
      image: "/assets/visual_style01.png",
    },
    {
      name: "Корпоративный",
      description: "Профессиональный бизнес-стиль",
      color: "#6B7280",
      bgColor: "#374151",
      image: "/assets/visual_style02.png",
    },
    {
      name: "Креативный",
      description: "Яркий и творческий подход",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      image: "/assets/visual_style03.png",
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleStyleSelect = async (styleId: string, styleIndex: number) => {
    setSelectedTheme(styleId);
    setSelectedStyleIndex(styleIndex);
    setIsSaving(true);

    try {
      // Автоматически сохраняем презентацию при выборе стиля
      await handleCreatePresentation();
    } catch (error) {
      console.error("Error saving presentation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePresentation = async () => {
    if (!brief || !deckTitle || !uiSlides || uiSlides.length === 0) {
      console.error("Missing required data for presentation generation");
      return;
    }

    // Подготавливаем данные для передачи на страницу генерации
    const presentationData = {
      deckTitle,
      uiSlides,
      userData: {
        topic: brief.topic,
        goal: brief.goal,
        audience: brief.audience,
        expectedAction: brief.expectedAction,
        keyIdea: brief.keyIdea,
        tones: brief.tones || [],
        files: extractedFiles || [],
      },
      volume: textVolume || "Средний",
      imageSource: imageSource || "Смешанный",
      seed: 42,
      concurrency: 5,
    };

    console.log("Preparing presentation data:", presentationData);

    try {
      // Создаем уникальный slug на основе заголовка и времени
      const slug = `${deckTitle
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`;

      // Создаем презентацию в базе данных
      const createdPresentation = await createPresentationMutation.mutateAsync({
        title: deckTitle,
        description: brief.topic || "Презентация создана через мастер",
        slug,
        generatedData: presentationData,
        presentationState: {
          textElementPositions: {},
          textElementContents: {},
          textElementStyles: {},
          imageElements: {},
          tableElements: {},
          selectedTemplateIndex,
          selectedStyleIndex,
          selectedTemplate: selectedTemplate || "proto_001",
          selectedTheme: selectedTheme || "modern",
        },
        templateIds: [selectedTemplate || "proto_001"],
        isPublic: false,
      });

      console.log("Presentation created in database:", createdPresentation);

      // Сохраняем данные в localStorage для передачи на страницу генерации
      localStorage.setItem(
        "presentationGenerationData",
        JSON.stringify({
          ...presentationData,
          presentationId: createdPresentation.id,
        })
      );

      // Переходим на страницу редактора слайдов
      router.push("/presentation-generation");
    } catch (error) {
      console.error("Error creating presentation:", error);
      // В случае ошибки все равно переходим на страницу генерации
      // чтобы не блокировать пользователя
      localStorage.setItem(
        "presentationGenerationData",
        JSON.stringify(presentationData)
      );
      router.push("/presentation-generation");
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-white overflow-y-auto">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BBA2FE]"></div>
            <div className="text-[#0B0911] font-medium">
              Сохраняем презентацию...
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 px-10">
        <div className="font-medium text-[#0B0911] text-[24px] w-[356px] mb-[27px]">
          Визуальный стиль
        </div>

        <div className="w-[356px] flex flex-col gap-4 pb-4">
          <div
            onClick={() => {
              if (!isSaving) {
                handleStyleSelect("modern", 0);
              }
            }}
            className={`p-4 rounded-lg relative ${
              isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${selectedStyleIndex === 0 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"}`}
          >
            {selectedStyleIndex === 0 && (
              <div className="absolute top-2 right-2 ">
                <SquareCheckIcon />
              </div>
            )}
            <div
              className={`flex flex-col gap-1 mb-[21px] ${
                selectedStyleIndex === 0 ? "text-white" : "text-[#0B0911]"
              }`}
            >
              <div className="font-semibold text-[18px]">Современный</div>
              <div
                className={`font-normal text-[14px] ${
                  selectedStyleIndex === 0 ? "text-white" : "text-[#8F8F92]"
                }`}
              >
                Чистый и минималистичный дизайн
              </div>
            </div>
            <div className="bg-white h-[126px] rounded-[4px] relative flex items-center">
              <div className="absolute left-6 flex flex-col">
                <div className="font-medium text-[#0B0911] text-[24px]">
                  Заголовок
                </div>
                <div className="font-normal text-[#BEBEC0] text-[18px]">
                  Основной текст
                </div>
              </div>
              <div className="absolute right-6 w-6 h-[88px] bg-blue-500 rounded flex flex-col justify-between p-1">
                <div className="w-full h-3 bg-blue-600 rounded"></div>
                <div className="w-full h-3 bg-blue-600 rounded"></div>
                <div className="w-full h-3 bg-cyan-500 rounded"></div>
              </div>
            </div>
          </div>

          {/* Корпоративный */}
          <div
            onClick={() => {
              if (!isSaving) {
                handleStyleSelect("corporate", 1);
              }
            }}
            className={`p-4 rounded-lg relative ${
              isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${selectedStyleIndex === 1 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"}`}
          >
            {selectedStyleIndex === 1 && (
              <div className="absolute top-2 right-2  flex items-center justify-center">
                <SquareCheckIcon />
              </div>
            )}
            <div
              className={`flex flex-col gap-1 mb-[21px] ${
                selectedStyleIndex === 1 ? "text-white" : "text-[#0B0911]"
              }`}
            >
              <div className="font-semibold text-[18px]">Корпоративный</div>
              <div
                className={`font-normal text-[14px] ${
                  selectedStyleIndex === 1 ? "text-white" : "text-[#8F8F92]"
                }`}
              >
                Профессиональный бизнес-стиль
              </div>
            </div>
            <div className="bg-gray-500 h-[126px] rounded-[4px] relative flex items-center">
              <div className="absolute left-6 flex flex-col">
                <div className="font-medium text-white text-[24px]">
                  Заголовок
                </div>
                <div className="font-normal text-[#BEBEC0] text-[18px]">
                  Основной текст
                </div>
              </div>
              <div className="absolute right-6 w-6 h-[88px] bg-gray-600 rounded flex flex-col justify-between p-1">
                <div className="w-full h-3 bg-gray-700 rounded"></div>
                <div className="w-full h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* Креативный */}
          <div
            onClick={() => {
              if (!isSaving) {
                handleStyleSelect("creative", 2);
              }
            }}
            className={`p-4 rounded-lg relative ${
              isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${selectedStyleIndex === 2 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"}`}
          >
            {selectedStyleIndex === 2 && (
              <div className="absolute top-2 right-2  flex items-center justify-center">
                <SquareCheckIcon />
              </div>
            )}
            <div
              className={`flex flex-col gap-1 mb-[21px] ${
                selectedStyleIndex === 2 ? "text-white" : "text-[#0B0911]"
              }`}
            >
              <div className="font-semibold text-[18px]">Креативный</div>
              <div
                className={`font-normal text-[14px] ${
                  selectedStyleIndex === 2 ? "text-white" : "text-[#8F8F92]"
                }`}
              >
                Яркий и творческий подход
              </div>
            </div>
            <div className="bg-white h-[126px] rounded-[4px] relative flex items-center">
              <div className="absolute left-6 flex flex-col">
                <div className="font-medium text-[#F59E0C] text-[24px]">
                  Заголовок
                </div>
                <div className="font-normal text-[rgba(245,158,12,0.5)] text-[18px]">
                  Основной текст
                </div>
              </div>
              <div className="absolute right-6 w-6 h-[88px] bg-orange-400 rounded flex flex-col justify-between p-1">
                <div className="w-full h-3 bg-orange-500 rounded"></div>
                <div className="w-full h-3 bg-red-500 rounded"></div>
                <div className="w-full h-3 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
