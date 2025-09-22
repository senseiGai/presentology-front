import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import SquareCheckIcon from "../../../../../public/icons/SquareCheckIcon";
import Image from "next/image";

interface StyleStepProps {
  onBack: () => void;
}

export const StyleStep: React.FC<StyleStepProps> = ({ onBack }) => {
  const router = useRouter();
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();

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

  const handleStyleSelect = (styleId: string) => {
    setSelectedTheme(styleId);
  };

  const handleCreatePresentation = () => {
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

    // Сохраняем данные в localStorage для передачи на страницу генерации
    localStorage.setItem(
      "presentationGenerationData",
      JSON.stringify(presentationData)
    );

    // Переходим на страницу генерации презентации
    router.push("/presentation-generation");
  };

  return (
    <div className="w-full  bg-white">
      <div className="flex">
        <div className="flex-1 mt-[122px]">
          <div className="w-full bg-[#F4F4F4] rounded-[24px] h-[686px] justify-center items-center flex flex-col">
            <span className="text-[#0B0911] text-[24px] font-medium">
              Выберите шаблон
            </span>
            <div className="flex flex-col items-center justify-center gap-6 mt-[53px] w-full">
              {templates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTemplateIndex(index)}
                  className={`relative w-[397px] h-[223px] cursor-pointer rounded-[12px] transition-all ${
                    selectedTemplateIndex === index
                      ? "ring-[8px] ring-[#A78BFA]"
                      : "border-[1px] border-[#EBEBEB]"
                  }`}
                >
                  {selectedTemplateIndex === index && (
                    <div className="absolute top-0 right-0 z-[99999] shadow-2xl">
                      <SquareCheckIcon />
                    </div>
                  )}
                  <Image
                    src={"/assets/presentation/presentation01.png"}
                    width={300}
                    height={200}
                    alt="Presentation"
                    className="absolute inset-0 w-full h-full object-cover rounded-[12px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col">
          <div className="flex-1 px-10 pt-8 overflow-y-auto max-h-[700px]">
            <div className="flex flex-col gap-10 w-full max-w-[356px]">
              <div className="mb-6">
                <h3 className="text-[24px] font-medium text-[#0B0911] mb-6">
                  Визуальный стиль
                </h3>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {styles.map((style, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedStyleIndex(index)}
                      className={`relative cursor-pointer w-[356px] h-[222px] p-4 rounded-[8px] transition-all ${
                        selectedStyleIndex === index
                          ? "bg-[#BBA2FE]"
                          : "bg-[#F4F4F4]"
                      }`}
                    >
                      {selectedStyleIndex === index && (
                        <div className="absolute top-1 right-1">
                          <SquareCheckIcon />
                        </div>
                      )}
                      <div className="relative">
                        <h4
                          className={`text-[18px] font-medium  mb-1 ${
                            selectedStyleIndex === index
                              ? "text-white"
                              : "text-[#0B0911]"
                          }`}
                        >
                          {style.name}
                        </h4>
                        <p
                          className={`text-[13px] tracking-[-3%] ${
                            selectedStyleIndex === index
                              ? "text-white"
                              : "text-[#6B7280]"
                          }`}
                        >
                          {style.description}
                        </p>
                        <Image
                          src={style.image}
                          alt={style.name}
                          width={240}
                          height={126}
                          className="w-full h-[126px]  rounded-[4px] mt-[21px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border-t border-[#f0f0f0] rounded-t-2xl shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] mx-[11px] px-10 py-6">
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className={`w-[100px] h-[52px] bg-white border border-[#C0C0C1] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-50 transition-colors `}
              >
                Назад
              </button>
              <button
                onClick={handleCreatePresentation}
                className="w-[248px] h-[52px] bg-[#BBA2FE] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors"
              >
                Создать презентацию
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
