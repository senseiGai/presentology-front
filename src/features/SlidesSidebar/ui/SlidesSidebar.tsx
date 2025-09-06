import React from "react";
import { SlidePreview } from "@/entities/Slide";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import SideBarIcon from "../../../../public/icons/SideBarIcon";

interface SlidesSidebarProps {
  renderSlideContent: (slideNumber: number) => React.ReactNode;
}

export const SlidesSidebar: React.FC<SlidesSidebarProps> = ({
  renderSlideContent,
}) => {
  const {
    totalSlides,
    currentSlide,
    generatedSlides,
    isGenerating,
    isSidebarCollapsed,
    setCurrentSlide,
    toggleSidebar,
  } = usePresentationStore();

  if (isSidebarCollapsed) {
    return null;
  }

  return (
    <div
      className="w-[199px] bg-white relative border-r-[1px] border-[#E9E9E9] flex flex-col flex-shrink-0 transition-all duration-300"
      style={{
        height: "calc(100vh - 80px)",
        boxShadow: "4px 0px 4px 0px #BBA2FE1A",
      }}
    >
      {!isGenerating && toggleSidebar && (
        <div className="px-2 pt-[16px] pb-4 flex justify-end flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="w-[32px] h-[32px] flex items-center justify-center cursor-pointer rounded-[8px] bg-[#F4F4F4] hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors mr-2"
          >
            <SideBarIcon color={"#939396"} />
          </button>
        </div>
      )}

      {/* Scrollable content area */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden px-2 pb-[24px] ${
          isGenerating && "pt-[24px]"
        }`}
      >
        <div className="space-y-[24px]">
          {Array.from({ length: totalSlides }, (_, index) => {
            const slideNumber = index + 1;
            const isGenerated = generatedSlides.includes(slideNumber);
            const isCurrentlyGenerating =
              isGenerating && slideNumber === generatedSlides.length + 1;

            // If we're generating, only show the currently generating slide
            if (isGenerating && !isCurrentlyGenerating && !isGenerated) {
              return null;
            }

            return (
              <SlidePreview
                key={slideNumber}
                slideNumber={slideNumber}
                isActive={!isGenerating && currentSlide === slideNumber}
                isCompleted={isGenerated}
                isGenerating={isGenerating}
                onClick={() =>
                  !isGenerating && isGenerated && setCurrentSlide(slideNumber)
                }
              >
                {renderSlideContent(slideNumber)}
              </SlidePreview>
            );
          })}
        </div>
      </div>
    </div>
  );
};
