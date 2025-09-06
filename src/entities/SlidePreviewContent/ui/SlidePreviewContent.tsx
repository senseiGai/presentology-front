import React from "react";
import PreviewGenerationLoaderIcon from "../../../../public/icons/PreviewGenerationLoaderIcon";

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

  if (slideNumber === 1) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#2D3748] to-[#1A202C] rounded-[4px] p-2 text-white">
        <div className="text-[8px] font-bold mb-1">ЗАГОЛОВОК</div>
        <div className="text-[8px] font-bold">В ДВЕ СТРОКИ</div>
        <div className="text-[6px] mt-1">Подзаголовок</div>
        <div className="text-[6px]">в две строки</div>
        <div className="absolute bottom-1 right-1 w-6 h-4 bg-gradient-to-br from-[#4FD1C7] to-[#10B981] rounded-[2px]" />
      </div>
    );
  }

  if (slideNumber === 5) {
    return (
      <div className="w-full h-full bg-white rounded-[4px] p-2">
        <div className="text-[6px] font-bold text-[#2D3748] mb-1">
          ЗАГОЛОВОК
        </div>
        <div className="text-[6px] font-bold text-[#2D3748]">В ДВЕ СТРОКИ</div>
        <div className="text-[5px] text-[#4A5568] mt-1">Подзаголовок</div>
        <div className="text-[5px] text-[#4A5568]">в две строки</div>
        <div className="grid grid-cols-2 gap-1 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-3 bg-[#F7FAFC] rounded-[2px] flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-[#4FD1C7] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F7FAFC] rounded-[4px] flex items-center justify-center">
      <div className="w-6 h-6 bg-[#E2E8F0] rounded-full" />
    </div>
  );
};
