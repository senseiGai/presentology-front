import React from "react";
import clsx from "clsx";

interface SlidePreviewProps {
  slideNumber: number;
  isActive?: boolean;
  isCompleted?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({
  slideNumber,
  isActive = false,
  isCompleted = false,
  children,
  onClick,
  className,
}) => {
  return (
    <div
      className={clsx(
        "w-[183px] h-[95px] rounded-[8px] border-[1px] p-2 transition-all duration-300 cursor-pointer relative overflow-hidden",
        isActive
          ? "border-[#BBA2FE] bg-[#DDD1FF] shadow-md"
          : isCompleted
          ? "border-none bg-white"
          : "border-[#E5E7EB] bg-[#F9FAFB] cursor-not-allowed opacity-60",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 z-10">
        <span
          className={clsx(
            "text-[18px] font-semibold",
            isActive ? "text-[#8A6CDC]" : "text-[#BEBEC0]"
          )}
        >
          {slideNumber}
        </span>
      </div>

      {/* Контент слайда */}
      <div className="w-[140px] ml-auto h-[79px]">
        {children || (
          <div className="w-full h-full bg-[#F3F4F6] rounded-[4px] flex items-center justify-center">
            <div className="w-6 h-6 bg-[#D1D5DB] rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
