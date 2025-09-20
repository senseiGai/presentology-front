import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { DeleteConfirmationModal } from "@/shared/ui/DeleteConfirmationModal";
import { SlideTypeChangePopup } from "@/shared/ui/SlideTypeChangePopup/SlideTypeChangePopup";
import { useSlideTypeChangePopup } from "@/shared/hooks/useSlideTypeChangePopup";
import { useSlideNavigation } from "@/shared/hooks/useSlideNavigation";

import Image from "next/image";
import SparksIcon from "@/../public/icons/SparksIcon";
import GrayTrashIcon from "@/../public/icons/GrayTrashIcon";
import { PresentationMascot } from "@/shared/ui/PesentationMascot";
import GenerationLoaderIcon from "../../../../public/icons/GenerationLoaderIcon";
interface SlideCanvasProps {
  children?: React.ReactNode;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = () => {
  const [deleteConfirmSlide, setDeleteConfirmSlide] = useState<{
    slideNumber: number;
    slideIndex: number;
  } | null>(null);

  const [currentSlideForTypeChange, setCurrentSlideForTypeChange] = useState<
    number | null
  >(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Record<number, HTMLDivElement>>({});

  const {
    generatedSlides,
    totalSlides,
    isGenerating,
    currentSlide,
    setCurrentSlide,
    deleteSlideByIndex,
    zoomLevel,
    clearTextSelection,
    setScrollToSlideInCanvas,
    setSelectedTextElement,
    setSelectedImageElement,
    setSelectedTableElement,
    setSelectedInfographicsElement,
    clearImageAreaSelection,
  } = usePresentationStore();

  const { scrollToSlide } = useSlideNavigation({
    slideRefs,
    scrollContainerRef,
  });

  const { isOpen, openPopup, closePopup, handleConfirm } =
    useSlideTypeChangePopup((textBlockCount, contentType, templateIndex) => {
      console.log(`Changing slide ${currentSlideForTypeChange} type to:`, {
        textBlockCount,
        contentType,
        templateIndex,
      });
      // Here you can implement the actual slide type change logic
      // For example, updating the slide type in your store
      closePopup();
      setCurrentSlideForTypeChange(null);
    });

  // Function to determine which slide is in the center of the viewport
  const findCenterSlide = useCallback(() => {
    if (!scrollContainerRef.current || isGenerating) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    let closestSlide = 1;
    let closestDistance = Infinity;

    // Check all generated slides to find the one closest to center
    generatedSlides.forEach((slideNumber) => {
      const slideElement = slideRefs.current[slideNumber];
      if (slideElement) {
        const slideRect = slideElement.getBoundingClientRect();
        const slideCenter = slideRect.top + slideRect.height / 2;
        const distance = Math.abs(slideCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSlide = slideNumber;
        }
      }
    });

    // Only update if the slide has changed and the slide is generated
    if (
      closestSlide !== currentSlide &&
      generatedSlides.includes(closestSlide)
    ) {
      setCurrentSlide(closestSlide);
    }
  }, [currentSlide, generatedSlides, isGenerating, setCurrentSlide]);

  // Throttled scroll handler to avoid too many updates
  const handleScroll = useCallback(() => {
    const timeoutId = setTimeout(findCenterSlide, 100);
    return () => clearTimeout(timeoutId);
  }, [findCenterSlide]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(findCenterSlide, 100);
    };

    container.addEventListener("scroll", throttledScroll);
    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [findCenterSlide]);

  // Register scroll function in store for use by sidebar
  useEffect(() => {
    setScrollToSlideInCanvas(scrollToSlide);
    return () => setScrollToSlideInCanvas(undefined);
  }, [scrollToSlide, setScrollToSlideInCanvas]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear text selection if clicking on the canvas background
    if (e.target === e.currentTarget) {
      clearTextSelection();

      // Close all panels by clearing selections
      setSelectedTextElement(null);
      setSelectedImageElement(null);
      setSelectedTableElement(null);
      setSelectedInfographicsElement(null);
      clearImageAreaSelection();
    }
  };

  // Во время генерации показываем только градиентный фон
  if (isGenerating) {
    return (
      <div className="relative bg-[#BBA2FE66] flex-1 min-h-screen">
        <div className="relative w-[759px] h-[427px] overflow-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/assets/presentation/presentation_gen.png"
            width={759}
            height={427}
            alt="Presentation"
            className="absolute w-full h-full select-none"
          />
          <div className="relative">
            <GenerationLoaderIcon className="animate-spin absolute top-[47px] left-[90px]" />
          </div>
          <div className="relative">
            <PresentationMascot className="!absolute w-[429px] !h-[475px] bottom-[-585px] left-[380px] transform -translate-x-1/2 " />
          </div>
        </div>
      </div>
    );
  }

  const renderSlide = (slideNumber: number) => {
    const isGenerated = generatedSlides.includes(slideNumber);

    if (!isGenerated) {
      return (
        <div className="w-[640px] h-[360px] bg-[#F7FAFC] rounded-[12px] flex items-center justify-center border-2 border-dashed border-[#E2E8F0]">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E2E8F0] rounded-full mx-auto mb-3" />
            <div className="text-[#6B7280] text-[16px]">
              Слайд {slideNumber} ожидает генерации
            </div>
          </div>
        </div>
      );
    }

    const slideType = getSlideType(slideNumber);
    return (
      <div>
        <SlideContent slideNumber={slideNumber} slideType={slideType} />
      </div>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 bg-[#BBA2FE66] overflow-y-auto"
      style={{ height: "calc(100vh - 80px)" }}
      onClick={handleCanvasClick}
    >
      <div
        className="flex flex-col items-center mt-[116px] mb-[32px]"
        style={{
          gap: `${32 * (zoomLevel / 100)}px`, // Scale gap with zoom level to maintain visual density
        }}
      >
        {Array.from({ length: totalSlides }, (_, index) => {
          const slideNumber = index + 1;
          const isGenerated = generatedSlides.includes(slideNumber);
          const scale = zoomLevel / 100;

          return (
            <React.Fragment key={`slide-${slideNumber}-${totalSlides}`}>
              <div
                ref={(el) => {
                  if (el) {
                    slideRefs.current[slideNumber] = el;
                  }
                }}
                className="flex flex-col items-center"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                }}
              >
                {/* Show buttons for all slides but only enable delete for generated ones */}
                <div className="flex mr-auto gap-2 mb-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isGenerated) {
                        setCurrentSlideForTypeChange(slideNumber);
                        openPopup();
                      }
                    }}
                    className={`flex items-center justify-center gap-2 w-[250px] h-[40px] bg-white rounded-[8px] border border-[#E5E7EB] transition-colors ${
                      isGenerated
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isGenerated}
                  >
                    <SparksIcon className="w-5 h-5" />
                    <span className="text-[#0B0911] text-[18px] font-normal">
                      Изменить тип слайда
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isGenerated) {
                        console.log(
                          `[DEBUG] Deleting slide ${slideNumber} from position ${
                            index + 1
                          }`
                        );
                        console.log(
                          `[DEBUG] generatedSlides:`,
                          generatedSlides
                        );
                        console.log(`[DEBUG] slideNumber:`, slideNumber);
                        console.log(`[DEBUG] array index:`, index);
                        console.log(
                          `[DEBUG] slideIndex to pass:`,
                          slideNumber - 1
                        );
                        setDeleteConfirmSlide({
                          slideNumber,
                          slideIndex: slideNumber - 1, // Use slideNumber - 1 as the actual index
                        });
                      }
                    }}
                    className={`flex items-center justify-center w-[40px] h-[40px] bg-white rounded-[8px] border border-[#E5E7EB] transition-colors ${
                      isGenerated
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isGenerated}
                  >
                    <GrayTrashIcon className="w-4 h-5" />
                  </button>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove manual slide selection since it's now handled by scroll
                    // if (isGenerated) setCurrentSlide(slideNumber);
                  }}
                  className="cursor-default"
                >
                  {renderSlide(slideNumber)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteConfirmSlide !== null}
        slideNumber={deleteConfirmSlide?.slideNumber || 0}
        onConfirm={() => {
          if (deleteConfirmSlide) {
            console.log(
              `[DEBUG] Confirming delete for slide: ${deleteConfirmSlide.slideNumber} at index: ${deleteConfirmSlide.slideIndex}`
            );
            console.log(
              `[DEBUG] Current generatedSlides before delete:`,
              generatedSlides
            );
            console.log(`[DEBUG] Current totalSlides:`, totalSlides);
            deleteSlideByIndex(deleteConfirmSlide.slideIndex);
            setDeleteConfirmSlide(null);
          }
        }}
        onCancel={() => setDeleteConfirmSlide(null)}
      />

      <SlideTypeChangePopup
        isOpen={isOpen}
        onClose={() => {
          closePopup();
          setCurrentSlideForTypeChange(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
