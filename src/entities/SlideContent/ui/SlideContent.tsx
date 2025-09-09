import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";

interface SlideContentProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  isGenerating?: boolean;
}

export const SlideContent: React.FC<SlideContentProps> = ({
  slideNumber,
  slideType = "default",
}) => {
  const {
    setSelectedTextElement,
    setTextEditorContent,
    selectedTextElement,
    clearTextSelection,
  } = usePresentationStore();

  const handleTextClick = (elementId: string, currentText: string) => {
    setSelectedTextElement(elementId);
    setTextEditorContent(currentText);
  };

  const handleTextDelete = () => {
    // In a real implementation, this would remove the text element from the slide
    console.log("Delete text element:", selectedTextElement);
    clearTextSelection();
  };

  const handleTextCopy = () => {
    // In a real implementation, this would copy the text element
    console.log("Copy text element:", selectedTextElement);
  };

  const handleTextMoveUp = () => {
    // In a real implementation, this would move the text element up in the z-index
    console.log("Move text element up:", selectedTextElement);
  };

  const handleTextMoveDown = () => {
    // In a real implementation, this would move the text element down in the z-index
    console.log("Move text element down:", selectedTextElement);
  };

  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const renderSlideByType = () => {
    const handleSlideClick = () => {
      clearTextSelection();
    };

    switch (slideType) {
      case "title":
        return (
          <div
            className="slide-container mx-auto w-[759px] h-[427px] bg-gradient-to-br from-[#2D3748] to-[#1A202C] rounded-[12px] p-12 text-white relative"
            onClick={handleSlideClick}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === "title-main"}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <div
                className={`text-[48px] font-bold leading-tight mb-4 cursor-pointer transition-colors ${
                  selectedTextElement === "title-main"
                    ? ""
                    : "hover:bg-white/10 rounded p-2"
                }`}
                onClick={(e) => {
                  preventPropagation(e);
                  handleTextClick("title-main", "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ");
                }}
              >
                ЗАГОЛОВОК
                <br />В ДВЕ СТРОКИ
              </div>
            </ResizableTextBox>

            <ResizableTextBox
              isSelected={selectedTextElement === "title-sub"}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <div
                className={`text-[20px] font-light cursor-pointer transition-colors ${
                  selectedTextElement === "title-sub"
                    ? ""
                    : "hover:bg-white/10 rounded p-2"
                }`}
                onClick={(e) => {
                  preventPropagation(e);
                  handleTextClick("title-sub", "Подзаголовок\nв две строки");
                }}
              >
                Подзаголовок
                <br />в две строки
              </div>
            </ResizableTextBox>

            <div className="absolute bottom-12 right-12 w-48 h-32 bg-gradient-to-br from-[#4FD1C7] to-[#10B981] rounded-[12px]" />
          </div>
        );

      case "content":
        return (
          <div
            className="slide-container mx-auto w-[759px] h-[427px] p-12"
            onClick={handleSlideClick}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === "content-main"}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <div
                className={`text-[48px] font-bold text-[#2D3748] leading-tight mb-4 cursor-pointer transition-colors ${
                  selectedTextElement === "content-main"
                    ? ""
                    : "hover:bg-gray-100 rounded p-2"
                }`}
                onClick={(e) => {
                  preventPropagation(e);
                  handleTextClick("content-main", "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ");
                }}
              >
                ЗАГОЛОВОК
                <br />В ДВЕ СТРОКИ
              </div>
            </ResizableTextBox>

            <ResizableTextBox
              isSelected={selectedTextElement === "content-sub"}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <div
                className={`text-[20px] text-[#4A5568] mb-8 cursor-pointer transition-colors ${
                  selectedTextElement === "content-sub"
                    ? ""
                    : "hover:bg-gray-100 rounded p-2"
                }`}
                onClick={(e) => {
                  preventPropagation(e);
                  handleTextClick("content-sub", "Подзаголовок\nв две строки");
                }}
              >
                Подзаголовок
                <br />в две строки
              </div>
            </ResizableTextBox>

            <div className="grid grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#F7FAFC] rounded-[12px] flex items-center justify-center border-2 border-[#E2E8F0]"
                >
                  <div className="w-16 h-16 bg-[#4FD1C7] rounded-full flex items-center justify-center">
                    <ResizableTextBox
                      isSelected={selectedTextElement === `content-text-${i}`}
                      onDelete={handleTextDelete}
                      onCopy={handleTextCopy}
                      onMoveUp={handleTextMoveUp}
                      onMoveDown={handleTextMoveDown}
                    >
                      <div
                        className={`text-white font-bold text-[20px] cursor-pointer transition-colors ${
                          selectedTextElement === `content-text-${i}`
                            ? ""
                            : "hover:bg-black/10 rounded p-1"
                        }`}
                        onClick={(e) => {
                          preventPropagation(e);
                          handleTextClick(`content-text-${i}`, `Текст ${i}`);
                        }}
                      >
                        Текст {i}
                      </div>
                    </ResizableTextBox>
                  </div>
                  <div className="ml-4">
                    <ResizableTextBox
                      isSelected={selectedTextElement === `content-label-${i}`}
                      onDelete={handleTextDelete}
                      onCopy={handleTextCopy}
                      onMoveUp={handleTextMoveUp}
                      onMoveDown={handleTextMoveDown}
                    >
                      <div
                        className={`text-[14px] font-medium text-[#2D3748] cursor-pointer transition-colors ${
                          selectedTextElement === `content-label-${i}`
                            ? ""
                            : "hover:bg-gray-100 rounded p-1"
                        }`}
                        onClick={(e) => {
                          preventPropagation(e);
                          handleTextClick(`content-label-${i}`, `Текст ${i}`);
                        }}
                      >
                        Текст {i}
                      </div>
                    </ResizableTextBox>

                    <ResizableTextBox
                      isSelected={selectedTextElement === `content-desc-${i}`}
                      onDelete={handleTextDelete}
                      onCopy={handleTextCopy}
                      onMoveUp={handleTextMoveUp}
                      onMoveDown={handleTextMoveDown}
                    >
                      <div
                        className={`text-[12px] text-[#4A5568] cursor-pointer transition-colors ${
                          selectedTextElement === `content-desc-${i}`
                            ? ""
                            : "hover:bg-gray-100 rounded p-1"
                        }`}
                        onClick={(e) => {
                          preventPropagation(e);
                          handleTextClick(`content-desc-${i}`, "Текст 2");
                        }}
                      >
                        Текст 2
                      </div>
                    </ResizableTextBox>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div
            className="slide-container mx-auto w-[759px] h-[427px] bg-[#F7FAFC] rounded-[12px] flex items-center justify-center"
            onClick={handleSlideClick}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === `slide-${slideNumber}-text`}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <div
                className={`text-[#6B7280] text-[18px] cursor-pointer transition-colors ${
                  selectedTextElement === `slide-${slideNumber}-text`
                    ? ""
                    : "hover:bg-gray-200 rounded p-2"
                }`}
                onClick={(e) => {
                  preventPropagation(e);
                  handleTextClick(
                    `slide-${slideNumber}-text`,
                    `Слайд ${slideNumber}`
                  );
                }}
              >
                Слайд {slideNumber}
              </div>
            </ResizableTextBox>
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
