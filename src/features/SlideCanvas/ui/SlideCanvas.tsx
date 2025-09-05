import React from "react";

interface SlideCanvasProps {
  currentSlide: number;
  generatedSlides: number[];
  isGenerating: boolean;
  children: React.ReactNode;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  currentSlide,
  generatedSlides,
  isGenerating,
  children,
}) => {
  const isCurrentSlideGenerated = generatedSlides.includes(currentSlide);
  const isCurrentSlideGenerating =
    isGenerating && currentSlide === generatedSlides.length + 1;

  const getSlideState = () => {
    if (!isCurrentSlideGenerated && !isCurrentSlideGenerating) {
      return "waiting";
    }
    if (isCurrentSlideGenerating) {
      return "generating";
    }
    return "ready";
  };

  const renderSlideState = () => {
    const state = getSlideState();

    switch (state) {
      case "waiting":
        return (
          <div className="max-w-[759px] h-full bg-[#F7FAFC] rounded-[12px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E2E8F0] rounded-full mx-auto mb-4" />
              <div className="text-[#6B7280] text-[18px]">
                Слайд {currentSlide} ожидает генерации
              </div>
            </div>
          </div>
        );

      case "generating":
        return null;

      case "ready":
      default:
        return children;
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-6 bg-[#BBA2FE66]">
      {renderSlideState()}
    </div>
  );
};
