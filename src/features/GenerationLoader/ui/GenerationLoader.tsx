import React from "react";

interface GenerationLoaderProps {
  progress: number;
  currentStep: string;
  isCompleted?: boolean;
}

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({
  progress,
  currentStep,
  isCompleted = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Animated loading circle */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#927DCB] to-[#F59E0B] opacity-20" />
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-[#927DCB] to-[#F59E0B]"
          style={{
            background: `conic-gradient(from 0deg, #927DCB 0%, #F59E0B ${progress}%, transparent ${progress}%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
          <div className="w-4 h-4 bg-[#927DCB] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <h3 className="text-[20px] font-semibold text-white mb-2">
          {isCompleted ? "Генерация завершена!" : currentStep}
        </h3>
        <p className="text-[14px] text-white/80">
          {isCompleted
            ? "Пожалуйста, оцените качество презентации"
            : "Наберитесь терпения, ИИ генерирует слайд..."}
        </p>
      </div>
    </div>
  );
};
