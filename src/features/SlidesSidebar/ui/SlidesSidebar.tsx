"use client";

import React, { useState, useRef, useEffect } from "react";
import { SlidePreview } from "@/entities/Slide";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { AddSlidePopup } from "@/shared/ui/AddSlidePopup";
import { useSlideNavigation } from "@/shared/hooks/useSlideNavigation";
import SideBarIcon from "../../../../public/icons/SideBarIcon";
import MiniPlusIcon from "../../../../public/icons/MiniPlusIcon";

interface SlidesSidebarProps {
  renderSlideContent: (slideNumber: number) => React.ReactNode;
}

export const SlidesSidebar: React.FC<SlidesSidebarProps> = ({
  renderSlideContent,
}) => {
  const [hoveredInsertZone, setHoveredInsertZone] = useState<number | null>(
    null
  );
  const [isAddSlidePopupOpen, setIsAddSlidePopupOpen] = useState(false);
  const [insertAfterSlide, setInsertAfterSlide] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Record<number, HTMLDivElement>>({});

  const {
    totalSlides,
    currentSlide,
    generatedSlides,
    isGenerating,
    isSidebarCollapsed,
    setCurrentSlide,
    toggleSidebar,
    insertSlideAfter,
    scrollToSlideInCanvas,
  } = usePresentationStore();

  const [actualSlidesCount, setActualSlidesCount] = useState(totalSlides);

  const { scrollToSlideInSidebar } = useSlideNavigation({
    slideRefs,
    scrollContainerRef,
  });

  const handleInsertSlideClick = (slideNumber: number) => {
    setInsertAfterSlide(slideNumber);
    setIsAddSlidePopupOpen(true);
  };

  const handleAddSlide = (content: string) => {
    if (insertAfterSlide !== null) {
      // Here you can use the content to customize the slide
      insertSlideAfter(insertAfterSlide);
      console.log(
        `Adding slide after ${insertAfterSlide} with content: ${content}`
      );

      // Auto-scroll to the newly added slide after a short delay
      // to allow the DOM to update
      setTimeout(() => {
        const newSlideNumber = insertAfterSlide + 1;
        scrollToSlideInSidebar(newSlideNumber);
      }, 100);
    }
    setIsAddSlidePopupOpen(false);
    setInsertAfterSlide(null);
  };

  // Предотвращаем hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll when currentSlide changes (from canvas scroll)
  useEffect(() => {
    if (!isGenerating && generatedSlides.includes(currentSlide)) {
      scrollToSlideInSidebar(currentSlide);
    }
  }, [currentSlide, isGenerating, generatedSlides, scrollToSlideInSidebar]);

  // Get actual slides count from localStorage
  useEffect(() => {
    const getActualSlidesCount = () => {
      try {
        const presentationGenerationData = localStorage.getItem(
          "presentationGenerationData"
        );
        if (presentationGenerationData) {
          const data = JSON.parse(presentationGenerationData);

          console.log("🎯 [SlidesSidebar] localStorage data structure:", {
            hasData: !!data?.data,
            hasSlides: !!data?.data?.slides,
            slidesLength: data?.data?.slides?.length,
            hasUiSlides: !!data?.uiSlides,
            uiSlidesLength: data?.uiSlides?.length,
          });

          // Priority 1: Check API response structure (data.data.slides)
          if (data?.data?.slides && Array.isArray(data.data.slides)) {
            console.log(
              "🎯 [SlidesSidebar] Using slides from API response data.data.slides:",
              data.data.slides.length
            );
            return data.data.slides.length;
          }

          // Priority 2: Check direct slides structure
          if (data?.slides && Array.isArray(data.slides)) {
            console.log(
              "🎯 [SlidesSidebar] Using slides from data.slides:",
              data.slides.length
            );
            return data.slides.length;
          }

          // Priority 3: Check uiSlides structure (input data)
          if (data?.uiSlides && Array.isArray(data.uiSlides)) {
            console.log(
              "🎯 [SlidesSidebar] Using slides from uiSlides:",
              data.uiSlides.length
            );
            return data.uiSlides.length;
          }
        }

        console.log(
          "🎯 [SlidesSidebar] No valid slide data found, using store totalSlides:",
          totalSlides
        );
        return totalSlides;
      } catch (error) {
        console.error("❌ [SlidesSidebar] Error parsing slide data:", error);
        return totalSlides;
      }
    };

    const actualCount = getActualSlidesCount();
    console.log(
      "🎯 [SlidesSidebar] Initial actualSlidesCount set to:",
      actualCount
    );
    setActualSlidesCount(actualCount);

    // Update periodically to catch changes
    const interval = setInterval(() => {
      const newCount = getActualSlidesCount();
      if (newCount !== actualCount) {
        console.log(
          "🎯 [SlidesSidebar] Updating actualSlidesCount from",
          actualCount,
          "to",
          newCount
        );
        setActualSlidesCount(newCount);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleClosePopup = () => {
    setIsAddSlidePopupOpen(false);
    setInsertAfterSlide(null);
  };

  if (isSidebarCollapsed) {
    return null;
  }

  // Простая заглушка для предотвращения hydration error
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-y-[24px] w-[140px] h-full bg-white p-2">
        <div className="w-full h-[79px] bg-gray-100 rounded-md animate-pulse" />
        <div className="w-full h-[79px] bg-gray-100 rounded-md animate-pulse" />
        <div className="w-full h-[79px] bg-gray-100 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <>
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
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden px-2 pb-[24px] ${
            isGenerating && "pt-[24px]"
          }`}
        >
          <div className="flex flex-col gap-y-[24px]">
            {Array.from({ length: actualSlidesCount }, (_, index) => {
              const slideNumber = index + 1;
              const isGenerated = generatedSlides.includes(slideNumber);
              const isCurrentlyGenerating =
                isGenerating && slideNumber === generatedSlides.length + 1;

              // If we're generating, only show the currently generating slide
              if (isGenerating && !isCurrentlyGenerating && !isGenerated) {
                return null;
              }

              return (
                <React.Fragment key={slideNumber}>
                  <div
                    ref={(el) => {
                      if (el) {
                        slideRefs.current[slideNumber] = el;
                      }
                    }}
                    className="relative"
                  >
                    <SlidePreview
                      slideNumber={slideNumber}
                      isActive={!isGenerating && currentSlide === slideNumber}
                      isCompleted={isGenerated}
                      isGenerating={isGenerating}
                      onClick={() => {
                        if (!isGenerating && isGenerated) {
                          setCurrentSlide(slideNumber);
                          // Also scroll to slide in canvas
                          scrollToSlideInCanvas?.(slideNumber);
                        }
                      }}
                    >
                      {renderSlideContent(slideNumber)}
                    </SlidePreview>

                    {isGenerated && !isGenerating && (
                      <div
                        className="w-full absolute -bottom-[12px] left-0 h-[3px] flex items-center justify-center cursor-pointer z-10"
                        onMouseEnter={() => setHoveredInsertZone(slideNumber)}
                        onMouseLeave={() => setHoveredInsertZone(null)}
                        onClick={() => handleInsertSlideClick(slideNumber)}
                      >
                        {hoveredInsertZone === slideNumber && (
                          <div className="flex items-center justify-center relative z-[50] w-[24px] h-[24px] bg-[#BBA2FE] text-white rounded-full text-lg font-bold">
                            <MiniPlusIcon />
                          </div>
                        )}
                        <div
                          className={`absolute inset-0 ${
                            hoveredInsertZone === slideNumber
                              ? "bg-[#BBA2FE]"
                              : ""
                          } rounded transition-colors`}
                        />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <AddSlidePopup
        isOpen={isAddSlidePopupOpen}
        onClose={handleClosePopup}
        onAdd={handleAddSlide}
      />
    </>
  );
};
