import React from "react";
import PreviewGenerationLoaderIcon from "../../../../public/icons/PreviewGenerationLoaderIcon";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { getSlideType } from "@/entities/SlideContent";

interface SlidePreviewContentProps {
  slideNumber: number;
  isGenerated: boolean;
  isCurrentlyGenerating: boolean;
}

export const SlidePreviewContent: React.FC<SlidePreviewContentProps> = ({
  slideNumber,
  isGenerated,
  isCurrentlyGenerating,
}) => {
  // Получаем данные из store для отображения реального контента
  const { textElementContents, textElementStyles } = usePresentationStore();

  if (!isGenerated && !isCurrentlyGenerating) {
    return (
      <div className="w-full h-full bg-[#F7FAFC] rounded-[4px] flex items-center justify-center">
        <div className="w-6 h-6 bg-[#E2E8F0] rounded-full" />
      </div>
    );
  }

  if (isCurrentlyGenerating) {
    return (
      <div className="w-full h-full bg-white rounded-[4px] flex items-center justify-center relative border-[1px] border-[#F4F4F4]">
        <div className="absolute inset-0 bg-white rounded-[4px]" />
        <PreviewGenerationLoaderIcon className="animate-spin" />
      </div>
    );
  }

  // Получаем тип слайда
  const slideType = getSlideType(slideNumber);

  // Функция для безопасного получения контента элемента
  const getElementContent = (elementId: string, fallback: string = "") => {
    return textElementContents[elementId] || fallback;
  };

  // Функция для проверки существования элемента
  const hasElement = (elementId: string) => {
    return textElementContents[elementId] !== undefined;
  };

  // Рендер превью на основе типа слайда и реального контента
  const renderSlidePreview = () => {
    switch (slideType) {
      case "title":
        // Титульный слайд - используем реальные данные
        const titleMain = getElementContent(
          "title-main",
          "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ"
        );
        const titleSub = getElementContent(
          "title-sub",
          "Подзаголовок\nв две строки"
        );

        return (
          <div className="w-full h-full bg-gradient-to-br from-[#2D3748] to-[#1A202C] rounded-[4px] p-2 text-white">
            <div className="text-[6px] font-bold mb-1 leading-tight">
              {titleMain.split("\n").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <div className="text-[4px] mt-1 leading-tight opacity-80">
              {titleSub.split("\n").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        );

      default:
        // Обычные слайды - проверяем, есть ли текстовый контент
        const slideTextId = `slide-${slideNumber}-text`;
        const slideContent = getElementContent(
          slideTextId,
          `Слайд ${slideNumber}`
        );

        // Проверяем наличие динамических элементов для этого слайда
        const dynamicElements = Object.keys(textElementContents).filter(
          (elementId) =>
            elementId.includes(`slide-${slideNumber}`) &&
            elementId !== slideTextId
        );

        return (
          <div className="w-full h-full bg-white rounded-[4px] p-2 border border-[#E5E7EB]">
            {/* Основной текст слайда */}
            <div className="text-[6px] font-semibold text-[#1F2937] mb-1 leading-tight">
              {slideContent.length > 30
                ? `${slideContent.substring(0, 30)}...`
                : slideContent}
            </div>

            {/* Дополнительные текстовые элементы */}
            {dynamicElements.length > 0 && (
              <div className="space-y-[1px] mt-1">
                {dynamicElements.slice(0, 3).map((elementId, index) => {
                  const content = getElementContent(elementId, "Текст");
                  return (
                    <div
                      key={elementId}
                      className="text-[4px] text-[#6B7280] leading-tight"
                    >
                      {content.length > 25
                        ? `${content.substring(0, 25)}...`
                        : content}
                    </div>
                  );
                })}
                {dynamicElements.length > 3 && (
                  <div className="text-[4px] text-[#9CA3AF]">
                    +{dynamicElements.length - 3} ещё
                  </div>
                )}
              </div>
            )}

            {/* Индикатор количества элементов */}
          </div>
        );
    }
  };

  return renderSlidePreview();
};
