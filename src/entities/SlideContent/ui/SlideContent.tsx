import React from "react";

interface SlideContentProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  isGenerating?: boolean;
}

export const SlideContent: React.FC<SlideContentProps> = ({
  slideNumber,
  slideType = "default",
}) => {
  const renderSlideByType = () => {
    switch (slideType) {
      case "title":
        return (
          <div className="mx-auto w-[759px] h-[427px] bg-gradient-to-br from-[#2D3748] to-[#1A202C] rounded-[12px] p-12 text-white relative">
            <div className="text-[48px] font-bold leading-tight mb-4">
              ЗАГОЛОВОК
              <br />В ДВЕ СТРОКИ
            </div>
            <div className="text-[20px] font-light">
              Подзаголовок
              <br />в две строки
            </div>
            <div className="absolute bottom-12 right-12 w-48 h-32 bg-gradient-to-br from-[#4FD1C7] to-[#10B981] rounded-[12px]" />
          </div>
        );

      case "content":
        return (
          <div className="mx-auto w-[759px] h-[427px] p-12">
            <div className="text-[48px] font-bold text-[#2D3748] leading-tight mb-4">
              ЗАГОЛОВОК
              <br />В ДВЕ СТРОКИ
            </div>
            <div className="text-[20px] text-[#4A5568] mb-8">
              Подзаголовок
              <br />в две строки
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#F7FAFC] rounded-[12px] flex items-center justify-center border-2 border-[#E2E8F0]"
                >
                  <div className="w-16 h-16 bg-[#4FD1C7] rounded-full flex items-center justify-center">
                    <div className="text-white font-bold text-[20px]">
                      Текст {i}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-[14px] font-medium text-[#2D3748]">
                      Текст {i}
                    </div>
                    <div className="text-[12px] text-[#4A5568]">Текст 2</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="mx-auto w-[759px] h-[427px] bg-[#F7FAFC] rounded-[12px] flex items-center justify-center">
            <div className="text-[#6B7280] text-[18px]">
              Слайд {slideNumber}
            </div>
          </div>
        );
    }
  };

  return renderSlideByType();
};

// Функция для определения типа слайда на основе его номера
export const getSlideType = (
  slideNumber: number
): "title" | "content" | "default" => {
  if (slideNumber === 1) return "title";
  if (slideNumber === 5) return "content";
  return "default";
};
