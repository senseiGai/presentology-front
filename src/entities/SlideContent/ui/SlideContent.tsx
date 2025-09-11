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
    selectedTextElement,
    clearTextSelection,
    updateTextElementStyle,
    getTextElementStyle,
    setTextElementContent,
    getTextElementContent,
    deleteTextElement,
    copyTextElement,
    moveTextElementUp,
    moveTextElementDown,
    textElementPositions,
    textElementStyles,
    textElementContents,
  } = usePresentationStore();

  // Debug effect to track state changes
  React.useEffect(() => {
    console.log(
      "SlideContent render - slideNumber:",
      slideNumber,
      "slideType:",
      slideType
    );
    console.log("Current textElementStyles:", textElementStyles);
    console.log("selectedTextElement:", selectedTextElement);
  }, [slideNumber, slideType, textElementStyles, selectedTextElement]);

  // Initialize default positions for elements if they don't exist
  React.useEffect(() => {
    const initializeElementPosition = (
      elementId: string,
      defaultX: number,
      defaultY: number
    ) => {
      // Check if element exists in textElementStyles (not just getting default values)
      const elementExists = textElementStyles[elementId];

      if (!elementExists) {
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
          x: elementExists.x,
          y: elementExists.y,
        });
      }
    };

    console.log(
      `Initializing positions for slideType: ${slideType}, slideNumber: ${slideNumber}`
    );
    console.log("Current textElementStyles:", textElementStyles);

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
        // Center the text in the slide (759x427)
        // Approximate center position accounting for text size
        initializeElementPosition(`slide-${slideNumber}-text`, 350, 200);
        break;
    }
  }, [slideType, slideNumber, textElementStyles, updateTextElementStyle]);

  // Re-initialize positions when slide changes
  React.useEffect(() => {
    console.log(`Slide changed to: ${slideNumber}, checking positions...`);

    // Force re-check positions for current slide elements
    const slideElementIds = [];
    switch (slideType) {
      case "title":
        slideElementIds.push("title-main", "title-sub");
        break;
      default:
        slideElementIds.push(`slide-${slideNumber}-text`);
        break;
    }

    slideElementIds.forEach((elementId) => {
      const elementExists = textElementStyles[elementId];
      console.log(`Element ${elementId} position:`, elementExists);
    });
  }, [slideNumber, slideType, textElementStyles]);

  const handleTextClick = (
    elementId: string,
    currentText: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // Always select the element
    setSelectedTextElement(elementId);
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

  // Render static alignment guides when text element is selected
  const renderAlignmentGuides = () => {
    if (!selectedTextElement) return null;

    // Static center lines - always at the center of the slide
    const slideWidth = 759; // Slide width
    const slideHeight = 427; // Slide height
    const centerX = slideWidth / 2;
    const centerY = slideHeight / 2;

    return (
      <>
        {/* Vertical guide line - center of slide */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `24px`,
            top: "0px",
            width: "1px",
            height: "100%",
            background:
              "repeating-linear-gradient(to bottom, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: `24px`,
            left: "0px",
            height: "1px",
            width: "100%",
            background:
              "repeating-linear-gradient(to right, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: `24px`,
            left: "0px",
            height: "1px",
            width: "100%",
            background:
              "repeating-linear-gradient(to right, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            right: `24px`,
            top: "0px",
            width: "1px",
            height: "100%",
            background:
              "repeating-linear-gradient(to bottom, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
          }}
        />
      </>
    );
  };

  const renderSlideByType = () => {
    const handleSlideClick = (e: React.MouseEvent) => {
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

            {renderDynamicTextElements()}

            {renderAlignmentGuides()}
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
                className={`text-[#6B7280] text-[18px] cursor-pointer transition-colors text-center ${
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

            {renderDynamicTextElements()}

            {renderAlignmentGuides()}
          </div>
        );
    }
  };

  return renderSlideByType();
};

export const getSlideType = (slideNumber: number): "title" | "default" => {
  if (slideNumber === 1) return "title";
  return "default";
};
