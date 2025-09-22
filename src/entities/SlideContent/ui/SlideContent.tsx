import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { ResizableInfographicsBox } from "@/shared/ui/ResizableInfographicsBox";

interface SlideContentProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  isGenerating?: boolean;
}

export const SlideContent: React.FC<SlideContentProps> = ({
  slideNumber,
  slideType = "default",
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [editingTableElement, setEditingTableElement] = React.useState<
    string | null
  >(null);

  const {
    setSelectedTextElement,
    selectedTextElement,
    selectedTextElements,
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
    isImageAreaSelectionMode,
    startImageAreaSelection,
    updateImageAreaSelection,
    finishImageAreaSelection,
    clearImageAreaSelection,
    getImageAreaSelection,
    // Image state
    imageElements,
    selectedImageElement,
    setSelectedImageElement,
    deleteImageElement,
    // Table state
    tableElements,
    selectedTableElement,
    setSelectedTableElement,
    updateTableElement,
    deleteTableElement,
    // Infographics state
    infographicsElements,
    selectedInfographicsElement,
    setSelectedInfographicsElement,
    deleteInfographicsElement,
    copyTableElement,
  } = usePresentationStore();

  // Get image area selection for current slide
  const imageAreaSelection = getImageAreaSelection(slideNumber);

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
        // Initialize positions for slide elements from API data structure
        initializeElementPosition(`slide-${slideNumber}-title`, 40, 40);
        initializeElementPosition(`slide-${slideNumber}-subtitle`, 40, 80);

        // Initialize text1 elements (both object and string formats)
        initializeElementPosition(`slide-${slideNumber}-text1-title`, 40, 130);
        initializeElementPosition(
          `slide-${slideNumber}-text1-content`,
          40,
          160
        );
        initializeElementPosition(`slide-${slideNumber}-text1`, 40, 130);

        // Initialize text2 elements (both object and string formats)
        initializeElementPosition(`slide-${slideNumber}-text2-title`, 40, 220);
        initializeElementPosition(
          `slide-${slideNumber}-text2-content`,
          40,
          250
        );
        initializeElementPosition(`slide-${slideNumber}-text2`, 40, 220);

        // Initialize text3 elements
        initializeElementPosition(`slide-${slideNumber}-text3-title`, 40, 310);
        initializeElementPosition(
          `slide-${slideNumber}-text3-content`,
          40,
          340
        );
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
        slideElementIds.push(
          `slide-${slideNumber}-title`,
          `slide-${slideNumber}-subtitle`,
          `slide-${slideNumber}-text1-title`,
          `slide-${slideNumber}-text1-content`,
          `slide-${slideNumber}-text1`,
          `slide-${slideNumber}-text2-title`,
          `slide-${slideNumber}-text2-content`,
          `slide-${slideNumber}-text2`,
          `slide-${slideNumber}-text3-title`,
          `slide-${slideNumber}-text3-content`
        );
        break;
    }

    slideElementIds.forEach((elementId) => {
      const elementExists = textElementStyles[elementId];
      console.log(`Element ${elementId} position:`, elementExists);
    });
  }, [slideNumber, slideType, textElementStyles]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isImageAreaSelectionMode) {
        clearImageAreaSelection(slideNumber);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageAreaSelectionMode, clearImageAreaSelection, slideNumber]);

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
    console.log(
      "SlideContent: handleTextCopy called for:",
      elementId,
      "on slide:",
      slideNumber
    );
    const newElementId = usePresentationStore
      .getState()
      .copyTextElement(elementId, slideNumber);
    console.log(
      "Text element copied:",
      elementId,
      "-> new element:",
      newElementId
    );

    // Select the newly copied element
    if (newElementId && newElementId !== elementId) {
      setSelectedTextElement(newElementId);
    }
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

  // Image area selection handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImageAreaSelectionMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    startImageAreaSelection(slideNumber, x, y);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      !isImageAreaSelectionMode ||
      !isDragging ||
      !imageAreaSelection?.isSelecting
    )
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateImageAreaSelection(slideNumber, x, y);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isImageAreaSelectionMode || !isDragging) return;

    setIsDragging(false);
    finishImageAreaSelection(slideNumber);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      finishImageAreaSelection(slideNumber);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isImageAreaSelectionMode && imageAreaSelection) {
      e.preventDefault();
      e.stopPropagation();
      clearImageAreaSelection(slideNumber);
    }
  };

  // Render dynamic text elements from store
  const renderDynamicTextElements = () => {
    const staticElementIds = [
      "title-main",
      "title-sub",
      "content-main",
      "content-sub",
    ];

    console.log("renderDynamicTextElements - slideNumber:", slideNumber);
    console.log("textElementPositions:", textElementPositions);
    console.log("textElementContents:", textElementContents);
    console.log("textElementStyles:", textElementStyles);

    // Use textElementStyles instead of textElementPositions to get all elements with styles
    const allElementsWithStyles = Object.entries(textElementStyles).filter(
      ([elementId]) => {
        // Filter out static elements
        if (staticElementIds.includes(elementId)) {
          console.log("Filtering out static element:", elementId);
          return false;
        }
        // Only show elements that belong to current slide
        const belongsToSlide = elementId.includes(`slide-${slideNumber}-`);
        console.log(
          "Element",
          elementId,
          "belongs to slide",
          slideNumber,
          ":",
          belongsToSlide
        );
        return belongsToSlide;
      }
    );

    console.log(
      "Elements with styles for slide",
      slideNumber,
      ":",
      allElementsWithStyles
    );

    return allElementsWithStyles.map(([elementId, style]) => {
      const content = textElementContents[elementId] || "New text element";

      console.log(
        "Rendering element:",
        elementId,
        "with content:",
        content,
        "style:",
        style
      );

      return (
        <ResizableTextBox
          key={elementId}
          isSelected={selectedTextElements.includes(elementId)}
          elementId={elementId}
          onDelete={handleTextDelete}
          onCopy={() => handleTextCopy(elementId)}
          onMoveUp={() => handleTextMoveUp(elementId)}
          onMoveDown={() => handleTextMoveDown(elementId)}
        >
          <EditableText
            elementId={elementId}
            initialText={content}
            className="text-[16px] cursor-pointer transition-colors"
            onClick={(e) => {
              handleTextClick(elementId, content, e);
            }}
          />
        </ResizableTextBox>
      );
    });
  };

  // Render table elements from store
  const renderTableElements = () => {
    const currentSlideElements = tableElements[slideNumber] || {};
    return Object.entries(currentSlideElements).map(
      ([elementId, tableData]) => {
        return (
          <ResizableTable
            key={elementId}
            elementId={elementId}
            isSelected={selectedTableElement === elementId}
            isEditing={editingTableElement === elementId}
            onDelete={() => {
              deleteTableElement(elementId);
              setSelectedTableElement(null);
              setEditingTableElement(null);
            }}
            onCopy={() => {
              console.log(
                "SlideContent: handleTableCopy called for:",
                elementId
              );
              const newElementId = copyTableElement(elementId);
              console.log(
                "Table element copied:",
                elementId,
                "-> new element:",
                newElementId
              );

              // Select the newly copied element
              if (newElementId && newElementId !== elementId) {
                setSelectedTableElement(newElementId);
              }
            }}
            onMoveUp={() => {
              // TODO: Implement table layer movement
              console.log("Move table up:", elementId);
            }}
            onMoveDown={() => {
              // TODO: Implement table layer movement
              console.log("Move table down:", elementId);
            }}
          >
            <EditableTable
              initialData={tableData}
              onTableChange={(newData) => {
                updateTableElement(elementId, newData);
              }}
              onEditingChange={(isEditing) => {
                setEditingTableElement(isEditing ? elementId : null);
              }}
              onTableSelect={() => {
                setSelectedTableElement(elementId);
              }}
            />
          </ResizableTable>
        );
      }
    );
  };

  // Render image elements from store
  const renderImageElements = () => {
    const currentSlideElements = imageElements[slideNumber] || {};
    return Object.entries(currentSlideElements).map(
      ([elementId, imageData]) => {
        return (
          <ResizableImageBox
            key={elementId}
            elementId={elementId}
            isSelected={selectedImageElement === elementId}
            onDelete={() => {
              deleteImageElement(elementId);
              setSelectedImageElement(null);
            }}
          />
        );
      }
    );
  };

  // Render infographics elements from store
  const renderInfographicsElements = () => {
    const currentSlideElements = infographicsElements[slideNumber] || {};

    console.log(
      "Rendering infographics for slide",
      slideNumber,
      ":",
      currentSlideElements
    );

    return Object.entries(currentSlideElements).map(
      ([elementId, infographicData]) => {
        return (
          <ResizableInfographicsBox
            key={elementId}
            elementId={elementId}
            slideNumber={slideNumber}
            isSelected={selectedInfographicsElement === elementId}
            onDelete={() => {
              deleteInfographicsElement(slideNumber, elementId);
              setSelectedInfographicsElement(null);
            }}
          />
        );
      }
    );
  };

  // Render static alignment guides when any element is selected on current slide
  const renderAlignmentGuides = () => {
    // Check if any element is selected and belongs to current slide
    const isTextElementOnCurrentSlide =
      selectedTextElement &&
      (selectedTextElement.includes(`slide-${slideNumber}-`) ||
        (slideType === "title" &&
          (selectedTextElement === "title-main" ||
            selectedTextElement === "title-sub")) ||
        (slideType === "content" &&
          selectedTextElement.startsWith("content-")));

    const isTableElementOnCurrentSlide =
      selectedTableElement &&
      tableElements[slideNumber]?.[selectedTableElement];

    const isImageElementOnCurrentSlide =
      selectedImageElement &&
      imageElements[slideNumber]?.[selectedImageElement];

    const isInfographicsElementOnCurrentSlide =
      selectedInfographicsElement &&
      infographicsElements[slideNumber]?.[selectedInfographicsElement];

    // Show guides only if an element from current slide is selected
    if (
      !isTextElementOnCurrentSlide &&
      !isTableElementOnCurrentSlide &&
      !isImageElementOnCurrentSlide &&
      !isInfographicsElementOnCurrentSlide
    ) {
      return null;
    }

    return (
      <>
        {/* Left vertical guide line */}
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
        {/* Top horizontal guide line */}
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
        {/* Bottom horizontal guide line */}
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
        {/* Right vertical guide line */}
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

  // Render image area selection
  const renderImageAreaSelection = () => {
    if (!isImageAreaSelectionMode || !imageAreaSelection) return null;

    const { startX, startY, endX, endY } = imageAreaSelection;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);

    // Минимальный размер для показа выделения
    if (width < 5 || height < 5) return null;

    return (
      <div
        className="absolute pointer-events-none z-[999]"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Полупрозрачный фон */}
        <div className="absolute inset-0 bg-[#BBA2FE] opacity-10" />

        {/* Основная рамка */}
        <div
          className="absolute inset-0 border-2 border-[#BBA2FE]"
          style={{
            borderStyle: "solid",
          }}
        />

        <div
          className="absolute w-2 h-2 bg-[#BBA2FE] "
          style={{
            left: "-4px",
            top: "-4px",
          }}
        />

        {/* Верхний правый */}
        <div
          className="absolute w-2 h-2 bg-[#BBA2FE] "
          style={{
            right: "-4px",
            top: "-4px",
          }}
        />

        {/* Нижний левый */}
        <div
          className="absolute w-2 h-2 bg-[#BBA2FE] "
          style={{
            left: "-4px",
            bottom: "-4px",
          }}
        />

        {/* Нижний правый */}
        <div
          className="absolute w-2 h-2 bg-[#BBA2FE] "
          style={{
            right: "-4px",
            bottom: "-4px",
          }}
        />
      </div>
    );
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    // Don't clear text selection if we're in image area selection mode
    if (isImageAreaSelectionMode) return;

    const target = e.target as HTMLElement;
    const isToolbarClick =
      target.closest('[role="toolbar"]') ||
      target.closest(".bg-white.rounded-\\[8px\\]") ||
      target.closest("button");
    const isTextElement = target.closest("[data-text-element]");
    const isTableElement = target.closest("[data-table-element]");
    const isImageElement = target.closest("[data-image-element]");
    const isInfographicsElement = target.closest("[data-infographics-element]");

    if (
      !isToolbarClick &&
      !isTextElement &&
      !isTableElement &&
      !isImageElement &&
      !isInfographicsElement
    ) {
      clearTextSelection();
      setSelectedTableElement(null);
      setEditingTableElement(null); // Also clear editing state
      setSelectedImageElement(null); // Clear image selection

      // Close all tool panels by clearing their selections
      // This will close any open panels (TextEditor, Image, Table, Infographics)
      const store = usePresentationStore.getState();
      store.setSelectedTextElement(null);
      store.setSelectedImageElement(null);
      store.setSelectedTableElement(null);
      store.setSelectedInfographicsElement(null);
      store.clearImageAreaSelection();
    }
  };

  const renderSlideByType = () => {
    switch (slideType) {
      case "title":
        return (
          <div
            className={`slide-container mx-auto w-[759px] h-[427px] bg-gradient-to-br from-[#2D3748] to-[#1A202C] rounded-[12px] p-12 text-white relative ${
              isImageAreaSelectionMode ? "cursor-crosshair" : ""
            }`}
            onClick={handleSlideClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative" }}
          >
            <ResizableTextBox
              isSelected={selectedTextElements.includes("title-main")}
              elementId="title-main"
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy("title-main")}
              onMoveUp={() => handleTextMoveUp("title-main")}
              onMoveDown={() => handleTextMoveDown("title-main")}
            >
              <EditableText
                elementId="title-main"
                initialText="ЗАГОЛОВОК\nВ ДВЕ СТРОКИ"
                className="text-[48px] font-bold leading-tight cursor-pointer transition-colors"
                onClick={(e) => {
                  handleTextClick("title-main", "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ", e);
                }}
              />
            </ResizableTextBox>

            <ResizableTextBox
              isSelected={selectedTextElements.includes("title-sub")}
              elementId="title-sub"
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy("title-sub")}
              onMoveUp={() => handleTextMoveUp("title-sub")}
              onMoveDown={() => handleTextMoveDown("title-sub")}
            >
              <EditableText
                elementId="title-sub"
                initialText="Подзаголовок\nв две строки"
                className="text-[20px] font-light cursor-pointer transition-colors"
                onClick={(e) => {
                  handleTextClick("title-sub", "Подзаголовок\nв две строки", e);
                }}
              />
            </ResizableTextBox>

            {renderDynamicTextElements()}

            {renderTableElements()}

            {renderImageElements()}

            {renderInfographicsElements()}

            {renderAlignmentGuides()}

            {renderImageAreaSelection()}
          </div>
        );

      default:
        return (
          <div
            className={`slide-container mx-auto w-[759px] h-[427px] bg-[#F7FAFC] rounded-[12px] ${
              isImageAreaSelectionMode ? "cursor-crosshair" : ""
            }`}
            onClick={handleSlideClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative" }}
          >
            {/* Render slide title if exists */}
            <ResizableTextBox
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-title`
              )}
              elementId={`slide-${slideNumber}-title`}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
              onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
              onMoveDown={() =>
                handleTextMoveDown(`slide-${slideNumber}-title`)
              }
            >
              <EditableText
                elementId={`slide-${slideNumber}-title`}
                initialText={`Слайд ${slideNumber} - Заголовок`}
                className="text-[#1F2937] text-[24px] font-bold cursor-pointer transition-colors"
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-title`,
                    getTextElementContent(`slide-${slideNumber}-title`) ||
                      `Слайд ${slideNumber} - Заголовок`,
                    e
                  );
                }}
              />
            </ResizableTextBox>

            {renderDynamicTextElements()}

            {renderTableElements()}

            {renderImageElements()}

            {renderInfographicsElements()}

            {renderAlignmentGuides()}

            {renderImageAreaSelection()}
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
