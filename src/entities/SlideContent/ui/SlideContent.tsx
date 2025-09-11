import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";

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
    updateTextElementStyle,
    getTextElementStyle,
    textEditorContent,
    setTextElementContent,
    getTextElementContent,
  } = usePresentationStore();

  // Initialize default positions for elements if they don't exist
  React.useEffect(() => {
    const initializeElementPosition = (
      elementId: string,
      defaultX: number,
      defaultY: number
    ) => {
      const currentStyle = getTextElementStyle(elementId);
      console.log(`Checking element ${elementId}:`, currentStyle);
      if (currentStyle.x === undefined || currentStyle.y === undefined) {
        console.log(
          `Initializing position for ${elementId} to (${defaultX}, ${defaultY})`
        );
        updateTextElementStyle(elementId, {
          x: defaultX,
          y: defaultY,
          rotation: 0,
        });
      } else {
        console.log(`Element ${elementId} already has position:`, {
          x: currentStyle.x,
          y: currentStyle.y,
        });
      }
    };

    console.log(
      `Initializing positions for slideType: ${slideType}, slideNumber: ${slideNumber}`
    );
    switch (slideType) {
      case "title":
        initializeElementPosition("title-main", 48, 48);
        initializeElementPosition("title-sub", 48, 160);
        break;
      case "content":
        initializeElementPosition("content-main", 48, 48);
        initializeElementPosition("content-sub", 48, 160);
        // Initialize positions for grid elements
        for (let i = 1; i <= 2; i++) {
          initializeElementPosition(
            `content-label-${i}`,
            150 + (i - 1) * 300,
            270
          );
          initializeElementPosition(
            `content-desc-${i}`,
            150 + (i - 1) * 300,
            300
          );
        }
        break;
      default:
        initializeElementPosition(`slide-${slideNumber}-text`, 280, 200);
        break;
    }
  }, [slideType, slideNumber, getTextElementStyle, updateTextElementStyle]);

  const handleTextClick = (
    elementId: string,
    currentText: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // Always select the element
    setSelectedTextElement(elementId);

    // Get the saved content for this element, or use current text as fallback
    const savedContent = getTextElementContent(elementId);
    const contentToUse = savedContent || currentText;

    // Only update text editor content if:
    // 1. This is a new element selection (different from current), OR
    // 2. The current textEditorContent is empty or only whitespace
    if (selectedTextElement !== elementId || !textEditorContent?.trim()) {
      setTextEditorContent(contentToUse);
    }
    // If it's the same element and textEditorContent has content,
    // we preserve the current textEditorContent (which may have list formatting)
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
            style={{ position: "relative" }}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === "title-main"}
              elementId="title-main"
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <EditableText
                elementId="title-main"
                initialText="ЗАГОЛОВОК\nВ ДВЕ СТРОКИ"
                className={`text-[48px] font-bold leading-tight cursor-pointer transition-colors ${
                  selectedTextElement === "title-main"
                    ? ""
                    : "hover:bg-white/10 rounded p-2"
                }`}
                onClick={(e) => {
                  handleTextClick("title-main", "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ", e);
                }}
              />
            </ResizableTextBox>

            <ResizableTextBox
              isSelected={selectedTextElement === "title-sub"}
              elementId="title-sub"
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <EditableText
                elementId="title-sub"
                initialText="Подзаголовок\nв две строки"
                className={`text-[20px] font-light cursor-pointer transition-colors ${
                  selectedTextElement === "title-sub"
                    ? ""
                    : "hover:bg-white/10 rounded p-2"
                }`}
                onClick={(e) => {
                  handleTextClick("title-sub", "Подзаголовок\nв две строки", e);
                }}
              />
            </ResizableTextBox>
          </div>
        );

      case "content":
        return (
          <div
            className="slide-container mx-auto w-[759px] h-[427px] p-12"
            onClick={handleSlideClick}
            style={{ position: "relative" }}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === "content-main"}
              elementId="content-main"
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <EditableText
                elementId="content-main"
                initialText="ЗАГОЛОВОК\nВ ДВЕ СТРОКИ"
                className={`text-[48px] font-bold text-[#2D3748] leading-tight cursor-pointer transition-colors ${
                  selectedTextElement === "content-main"
                    ? ""
                    : "hover:bg-gray-100 rounded p-2"
                }`}
                onClick={(e) => {
                  handleTextClick("content-main", "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ", e);
                }}
              />
            </ResizableTextBox>

            <ResizableTextBox
              isSelected={selectedTextElement === "content-sub"}
              elementId="content-sub"
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <EditableText
                elementId="content-sub"
                initialText="Подзаголовок\nв две строки"
                className={`text-[20px] text-[#4A5568] cursor-pointer transition-colors ${
                  selectedTextElement === "content-sub"
                    ? ""
                    : "hover:bg-gray-100 rounded p-2"
                }`}
                onClick={(e) => {
                  handleTextClick(
                    "content-sub",
                    "Подзаголовок\nв две строки",
                    e
                  );
                }}
              />
            </ResizableTextBox>

            {/* Render text elements with absolute positioning */}
            {[1, 2].map((i) => (
              <React.Fragment key={i}>
                <ResizableTextBox
                  isSelected={selectedTextElement === `content-label-${i}`}
                  elementId={`content-label-${i}`}
                  onDelete={handleTextDelete}
                  onCopy={handleTextCopy}
                  onMoveUp={handleTextMoveUp}
                  onMoveDown={handleTextMoveDown}
                >
                  <EditableText
                    elementId={`content-label-${i}`}
                    initialText={`Текст ${i}`}
                    className={`text-[14px] font-medium text-[#2D3748] cursor-pointer transition-colors ${
                      selectedTextElement === `content-label-${i}`
                        ? ""
                        : "hover:bg-gray-100 rounded p-1"
                    }`}
                    onClick={(e) => {
                      handleTextClick(`content-label-${i}`, `Текст ${i}`, e);
                    }}
                  />
                </ResizableTextBox>

                <ResizableTextBox
                  isSelected={selectedTextElement === `content-desc-${i}`}
                  elementId={`content-desc-${i}`}
                  onDelete={handleTextDelete}
                  onCopy={handleTextCopy}
                  onMoveUp={handleTextMoveUp}
                  onMoveDown={handleTextMoveDown}
                >
                  <EditableText
                    elementId={`content-desc-${i}`}
                    initialText="Текст 2"
                    className={`text-[12px] text-[#4A5568] cursor-pointer transition-colors ${
                      selectedTextElement === `content-desc-${i}`
                        ? ""
                        : "hover:bg-gray-100 rounded p-1"
                    }`}
                    onClick={(e) => {
                      handleTextClick(`content-desc-${i}`, "Текст 2", e);
                    }}
                  />
                </ResizableTextBox>
              </React.Fragment>
            ))}
          </div>
        );

      default:
        return (
          <div
            className="slide-container mx-auto w-[759px] h-[427px] bg-[#F7FAFC] rounded-[12px]"
            onClick={handleSlideClick}
            style={{ position: "relative" }}
          >
            <ResizableTextBox
              isSelected={selectedTextElement === `slide-${slideNumber}-text`}
              elementId={`slide-${slideNumber}-text`}
              onDelete={handleTextDelete}
              onCopy={handleTextCopy}
              onMoveUp={handleTextMoveUp}
              onMoveDown={handleTextMoveDown}
            >
              <EditableText
                elementId={`slide-${slideNumber}-text`}
                initialText={`Слайд ${slideNumber}`}
                className={`text-[#6B7280] text-[18px] cursor-pointer transition-colors ${
                  selectedTextElement === `slide-${slideNumber}-text`
                    ? ""
                    : "hover:bg-gray-200 rounded p-2"
                }`}
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-text`,
                    `Слайд ${slideNumber}`,
                    e
                  );
                }}
              />
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
