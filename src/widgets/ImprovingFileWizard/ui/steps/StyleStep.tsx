import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import { usePresentationCreationStore } from "../../model/useImproveFileWizard";

import SquareCheckIcon from "../../../../../public/icons/SquareCheckIcon";

interface StyleStepProps {
  onBack: () => void;
  canProceed?: boolean;
  isCompleted?: boolean;
}

export const StyleStep: React.FC<StyleStepProps> = ({
  onBack,
  canProceed,
  isCompleted,
}) => {
  const router = useRouter();

  // Store для ImprovingFileWizard
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();

  // Store для workflow (if needed for integration)
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

  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);

  const handleStyleSelect = (styleId: string) => {
    setSelectedTheme(styleId);
    updatePresentationData({
      selectedStyle: styleId as "modern" | "corporate" | "creative",
    });
  };

  return (
    <div className="h-full flex flex-col relative bg-white overflow-y-auto">
      <div className="pt-6 px-10">
        <div className="font-medium text-[#0B0911] text-[24px] w-[356px] mb-[27px]">
          Визуальный стиль
        </div>

        <div className="w-[356px] flex flex-col gap-4 pb-4">
          <div
            onClick={() => {
              setSelectedStyleIndex(0);
              handleStyleSelect("modern");
            }}
            className={`p-4 rounded-lg relative cursor-pointer ${
              selectedStyleIndex === 0 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"
            }`}
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
              setSelectedStyleIndex(1);
              handleStyleSelect("corporate");
            }}
            className={`p-4 rounded-lg relative cursor-pointer ${
              selectedStyleIndex === 1 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"
            }`}
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
              setSelectedStyleIndex(2);
              handleStyleSelect("creative");
            }}
            className={`p-4 rounded-lg relative cursor-pointer ${
              selectedStyleIndex === 2 ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"
            }`}
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
