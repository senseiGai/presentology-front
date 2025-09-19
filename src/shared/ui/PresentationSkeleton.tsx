import React from "react";

interface PresentationSkeletonProps {
  count?: number;
}

export const PresentationSkeleton: React.FC<PresentationSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-3 gap-[24px] 2xl:gap-[20px] mt-[40px]">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-[16px] p-[16px] animate-pulse"
        >
          {/* Превью изображений */}
          <div className="flex gap-[8px] mb-[16px]">
            <div className="flex-1 bg-white/20 rounded-[8px] h-[120px]" />
            <div className="flex-1 bg-white/20 rounded-[8px] h-[120px]" />
          </div>

          {/* Заголовок */}
          <div className="h-[16px] bg-white/20 rounded-[4px] mb-[8px]" />

          {/* Дата и тег */}
          <div className="flex justify-between items-center">
            <div className="h-[12px] bg-white/20 rounded-[4px] w-[60px]" />
            <div className="h-[20px] bg-white/20 rounded-[10px] w-[80px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresentationSkeleton;
