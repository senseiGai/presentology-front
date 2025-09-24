import React from "react";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";

interface StructureStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const StructureStep: React.FC<StructureStepProps> = ({
  onNext,
  onBack,
}) => {
  // Store для workflow
  const { textVolume, imageSource, setTextVolume, setImageSource, uiSlides } =
    usePresentationFlowStore();

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

  return (
    <>
      <div className="p-10 flex-1">
        <div className="mb-6">
          <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
            Объем текста
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleTextVolumeChange("minimal")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  textVolume === "Минимальный"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Минимальный
              </button>
              <button
                onClick={() => handleTextVolumeChange("medium")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  textVolume === "Средний"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Средний
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTextVolumeChange("large")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  textVolume === "Большой"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
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
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Flux"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                FLUX
                <br />
                (ИИ генерация)
              </button>
              <button
                onClick={() => handleImageSourceChange("internet")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Из интернета"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Поиск
                <br />в интернете
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleImageSourceChange("mixed")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Смешанный"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Смешанный
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-[110px] bg-white rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-center gap-2 mt-6 px-10">
          <button
            onClick={onBack}
            className="w-[174px] h-[52px] bg-white border border-[#C0C0C1] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={() => {
              // Сохраняем данные в localStorage перед переходом
              const existingData = localStorage.getItem(
                "presentationGenerationData"
              );
              if (existingData) {
                try {
                  const parsedData = JSON.parse(existingData);
                  parsedData.uiSlides = uiSlides;
                  localStorage.setItem(
                    "presentationGenerationData",
                    JSON.stringify(parsedData)
                  );
                } catch (error) {
                  console.error("Error updating presentation data:", error);
                }
              }
              onNext();
            }}
            className="flex-1 h-[52px] bg-[#BBA2FE] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors"
          >
            Далее
          </button>
        </div>
      </div>
    </>
  );
};
