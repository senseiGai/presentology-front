import React from "react";
import { usePresentationCreationStore } from "../../model/useImproveFileWizard";

interface StructureStepProps {
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  isCompleted?: boolean;
}

export const StructureStep: React.FC<StructureStepProps> = ({
  onNext,
  onBack,
  canProceed = true,
  isCompleted = false,
}) => {
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();

  const handleSlideCountChange = (count: number) => {
    updatePresentationData({ slideCount: count });
  };

  const handleTextVolumeChange = (volume: "minimal" | "medium" | "large") => {
    updatePresentationData({ textVolume: volume });
  };

  const handleImageSourceChange = (source: "flux" | "internet" | "mixed") => {
    updatePresentationData({ imageSource: source });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 px-10 pt-8 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full max-w-[356px]">
          <h2 className="font-['Onest:Medium',_sans-serif] font-medium text-[#0b0911] text-[24px] tracking-[-0.48px]">
            Структура презентации
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[#0b0911] text-[14px] font-medium mb-2">
                Количество слайдов: {presentationData.slideCount}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={presentationData.slideCount}
                onChange={(e) =>
                  handleSlideCountChange(parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="block text-[#0b0911] text-[14px] font-medium mb-2">
                Объем текста *
              </label>
              <div className="flex gap-2">
                {(["minimal", "medium", "large"] as const).map((volume) => (
                  <button
                    key={volume}
                    onClick={() => handleTextVolumeChange(volume)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      presentationData.textVolume === volume
                        ? "bg-[#bba2fe] text-white border-[#bba2fe]"
                        : "bg-white text-[#0b0911] border-[#c0c0c1] hover:border-[#bba2fe]"
                    }`}
                  >
                    {volume === "minimal" && "Минимальный"}
                    {volume === "medium" && "Средний"}
                    {volume === "large" && "Большой"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#0b0911] text-[14px] font-medium mb-2">
                Источник изображений *
              </label>
              <div className="flex gap-2">
                {(["flux", "internet", "mixed"] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => handleImageSourceChange(source)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      presentationData.imageSource === source
                        ? "bg-[#bba2fe] text-white border-[#bba2fe]"
                        : "bg-white text-[#0b0911] border-[#c0c0c1] hover:border-[#bba2fe]"
                    }`}
                  >
                    {source === "flux" && "AI"}
                    {source === "internet" && "Интернет"}
                    {source === "mixed" && "Смешано"}
                  </button>
                ))}
              </div>
            </div>

            {!canProceed && (
              <p className="text-red-500 text-[12px]">
                * Выберите все параметры
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f0f0f0] rounded-t-2xl shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] mx-[11px] px-10 py-6">
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 h-[52px] bg-white border border-[#c0c0c1] rounded-lg flex items-center justify-center text-[#0b0911] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={canProceed ? onNext : undefined}
            disabled={!canProceed}
            className={`flex-1 h-[52px] rounded-lg flex items-center justify-center text-[18px] leading-[1.2] tracking-[-0.36px] font-normal transition-colors ${
              canProceed
                ? "bg-[#bba2fe] text-white hover:bg-[#a688fd] cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );
};
