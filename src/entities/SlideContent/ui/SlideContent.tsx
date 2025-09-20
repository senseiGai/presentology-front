import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";

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
      `slide-${slideNumber}-text`,
    ];

    console.log("renderDynamicTextElements - slideNumber:", slideNumber);
    console.log(
      "renderDynamicTextElements - textElementPositions:",
      textElementPositions
    );

    const filteredElements = Object.entries(textElementPositions).filter(
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
      "Filtered elements for slide",
      slideNumber,
      ":",
      filteredElements
    );

    return filteredElements.map(([elementId, position]) => {
      const content = textElementContents[elementId] || "New text element";

      console.log("Rendering element:", elementId, "with content:", content);

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
        const { dataUrl, svgContent, position, width, height } =
          infographicData;

        console.log("Rendering infographic element:", elementId, "with data:", {
          dataUrl: dataUrl?.substring(0, 50) + "...",
          position,
          width,
          height,
        });

        return (
          <div
            key={elementId}
            className={`absolute cursor-pointer border-2 ${
              selectedInfographicsElement === elementId
                ? "border-[#BBA2FE]"
                : "border-transparent"
            } hover:border-[#BBA2FE] transition-colors group`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInfographicsElement(elementId);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setSelectedInfographicsElement(elementId);
            }}
          >
            {/* Render SVG content */}
            {(dataUrl || svgContent) && (
              <div className="w-full h-full flex items-center justify-center">
                {/* Обработка base64 SVG */}
                {(dataUrl || svgContent)?.startsWith(
                  "data:image/svg+xml;base64,"
                ) ? (
                  <img
                    src={dataUrl || svgContent}
                    alt="Infographic"
                    className="w-full h-full object-contain"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (dataUrl || svgContent)?.startsWith(
                    "data:image/svg+xml"
                  ) ? (
                  <img
                    src={dataUrl || svgContent}
                    alt="Infographic"
                    className="w-full h-full object-contain"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (dataUrl || svgContent)?.includes("<svg") ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: dataUrl || svgContent || "",
                    }}
                  />
                ) : (dataUrl || svgContent)?.startsWith("data:image/") ? (
                  <img
                    src={dataUrl || svgContent}
                    alt="Infographic"
                    className="w-full h-full object-contain"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    Инфографика недоступна
                  </div>
                )}
              </div>
            )}

            {/* Selection overlay and controls */}
            {selectedInfographicsElement === elementId && (
              <>
                {/* Selection overlay */}
                <div className="absolute inset-0 bg-[#BBA2FE] bg-opacity-10 pointer-events-none" />

                {/* Delete button */}
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteInfographicsElement(slideNumber, elementId);
                    setSelectedInfographicsElement(null);
                  }}
                >
                  ×
                </button>

                {/* Resize handles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#BBA2FE] border border-white cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#BBA2FE] border border-white cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#BBA2FE] border border-white cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#BBA2FE] border border-white cursor-se-resize" />
              </>
            )}
          </div>
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

    if (
      !isToolbarClick &&
      !isTextElement &&
      !isTableElement &&
      !isImageElement
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
            <ResizableTextBox
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-text`
              )}
              elementId={`slide-${slideNumber}-text`}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-text`)}
              onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-text`)}
              onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-text`)}
            >
              <EditableText
                elementId={`slide-${slideNumber}-text`}
                initialText={`Слайд ${slideNumber}`}
                className="text-[#6B7280] text-[18px] cursor-pointer transition-colors text-center"
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
