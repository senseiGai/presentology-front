import React, { useState } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { SlideContent, getSlideType } from "@/entities/SlideContent";
import { DeleteConfirmationModal } from "@/shared/ui/DeleteConfirmationModal";

import Image from "next/image";
import { Mascot } from "@/shared/ui/Mascot";
import SparksIcon from "@/../public/icons/SparksIcon";
import GrayTrashIcon from "@/../public/icons/GrayTrashIcon";
interface SlideCanvasProps {
  children?: React.ReactNode;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = () => {
  const [deleteConfirmSlide, setDeleteConfirmSlide] = useState<{
    slideNumber: number;
    slideIndex: number;
  } | null>(null);

  const {
    generatedSlides,
    totalSlides,
    isGenerating,
    setCurrentSlide,
    deleteSlideByIndex,
  } = usePresentationStore();

  // Во время генерации показываем только градиентный фон
  if (isGenerating) {
    return (
      <div className="relative bg-[#BBA2FE66] flex-1 min-h-screen">
        <div className="relative w-[759px] h-[427px] overflow-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/assets/presentation/pesentation_generation.png"
            width={759}
            height={427}
            alt="Presentation"
            className="absolute w-full h-full"
          />
          <div className="relative">
            <Mascot className="!absolute w-[429px] h-[429px] bottom-[-585px] left-[380px] transform -translate-x-1/2 " />
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
      <div className="">
        <SlideContent slideNumber={slideNumber} slideType={slideType} />
      </div>
    );
  };

  return (
    <div
      className="flex-1 bg-[#BBA2FE66] overflow-y-auto"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="flex flex-col items-center mt-[116px] gap-8">
        {Array.from({ length: totalSlides }, (_, index) => {
          const slideNumber = index + 1;
          const isGenerated = generatedSlides.includes(slideNumber);

          return (
            <React.Fragment key={`slide-${slideNumber}-${totalSlides}`}>
              <div className="flex flex-col items-center">
                {/* Show buttons for all slides but only enable delete for generated ones */}
                <div className="flex mr-auto gap-2 mb-2">
                  <button
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
                          `Deleting slide ${slideNumber} from position ${
                            index + 1
                          }`
                        );
                        setDeleteConfirmSlide({
                          slideNumber,
                          slideIndex: index,
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
                  onClick={() => isGenerated && setCurrentSlide(slideNumber)}
                  className="cursor-pointer"
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
              `Confirming delete for slide: ${deleteConfirmSlide.slideNumber} at index: ${deleteConfirmSlide.slideIndex}`
            );
            deleteSlideByIndex(deleteConfirmSlide.slideIndex);
            setDeleteConfirmSlide(null);
          }
        }}
        onCancel={() => setDeleteConfirmSlide(null)}
      />
    </div>
  );
};
