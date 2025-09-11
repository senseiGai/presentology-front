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
    deleteTextElement, // Добавляем deleteTextElement из store
    copyTextElement,
    moveTextElementUp,
    moveTextElementDown,
    textElementPositions,
    textElementStyles,
    textElementContents,
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
    if (selectedTextElement) {
      console.log("Deleting text element:", selectedTextElement);
      deleteTextElement(selectedTextElement);
    }
  };

  const handleTextCopy = (elementId: string) => {
    console.log("SlideContent: handleTextCopy called for:", elementId);
    const newElementId = usePresentationStore
      .getState()
      .copyTextElement(elementId);
    console.log(
      "Text element copied:",
      elementId,
      "-> new element:",
      newElementId
    );
  };

  const handleTextMoveUp = (elementId: string) => {
    console.log("SlideContent: handleTextMoveUp called for:", elementId);
    usePresentationStore.getState().moveTextElementUp(elementId);
    console.log("Text element moved up:", elementId);
  };

  const handleTextMoveDown = (elementId: string) => {
    console.log("SlideContent: handleTextMoveDown called for:", elementId);
    usePresentationStore.getState().moveTextElementDown(elementId);
    console.log("Text element moved down:", elementId);
  };

  // Render dynamic text elements from store
  const renderDynamicTextElements = () => {
    const staticElementIds = [
      "title-main",
      "title-sub",
      "content-main",
      "content-sub",
      `slide-${slideNumber}-text`,
    ];

    return Object.entries(textElementPositions)
      .filter(([elementId]) => !staticElementIds.includes(elementId))
      .map(([elementId, position]) => {
        const content = textElementContents[elementId] || "New text element";

        return (
          <ResizableTextBox
            key={elementId}
            isSelected={selectedTextElement === elementId}
            elementId={elementId}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(elementId)}
            onMoveUp={() => handleTextMoveUp(elementId)}
            onMoveDown={() => handleTextMoveDown(elementId)}
          >
            <EditableText
              elementId={elementId}
              initialText={content}
              className="text-[16px] cursor-pointer transition-colors hover:bg-gray-100 rounded p-2"
              onClick={(e) => {
                handleTextClick(elementId, content, e);
              }}
            />
          </ResizableTextBox>
        );
      });
  };

  const renderSlideByType = () => {
    const handleSlideClick = (e: React.MouseEvent) => {
      // Don't clear selection if clicking on toolbar or text elements
      const target = e.target as HTMLElement;
      const isToolbarClick =
        target.closest('[role="toolbar"]') ||
        target.closest(".bg-white.rounded-\\[8px\\]") ||
        target.closest("button");
      const isTextElement = target.closest("[data-text-element]");

      if (!isToolbarClick && !isTextElement) {
        clearTextSelection();
      }
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
              onCopy={() => handleTextCopy("title-main")}
              onMoveUp={() => handleTextMoveUp("title-main")}
              onMoveDown={() => handleTextMoveDown("title-main")}
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
              onCopy={() => handleTextCopy("title-sub")}
              onMoveUp={() => handleTextMoveUp("title-sub")}
              onMoveDown={() => handleTextMoveDown("title-sub")}
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

            {/* Render dynamic text elements */}
            {renderDynamicTextElements()}
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
              onCopy={() => handleTextCopy("content-main")}
              onMoveUp={() => handleTextMoveUp("content-main")}
              onMoveDown={() => handleTextMoveDown("content-main")}
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
              onCopy={() => handleTextCopy("content-sub")}
              onMoveUp={() => handleTextMoveUp("content-sub")}
              onMoveDown={() => handleTextMoveDown("content-sub")}
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
                  onCopy={() => handleTextCopy(`content-label-${i}`)}
                  onMoveUp={() => handleTextMoveUp(`content-label-${i}`)}
                  onMoveDown={() => handleTextMoveDown(`content-label-${i}`)}
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
                  onCopy={() => handleTextCopy(`content-desc-${i}`)}
                  onMoveUp={() => handleTextMoveUp(`content-desc-${i}`)}
                  onMoveDown={() => handleTextMoveDown(`content-desc-${i}`)}
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

            {/* Render dynamic text elements */}
            {renderDynamicTextElements()}
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
              onCopy={() => handleTextCopy(`slide-${slideNumber}-text`)}
              onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-text`)}
              onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-text`)}
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

            {/* Render dynamic text elements */}
            {renderDynamicTextElements()}
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
