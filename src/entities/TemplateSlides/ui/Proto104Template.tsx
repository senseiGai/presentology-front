"use client";

import React, { useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableText } from "@/shared/ui/EditableText";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";

interface Proto104TemplateProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  isGenerating?: boolean;
}

export const Proto104Template: React.FC<Proto104TemplateProps> = ({
  slideNumber,
  slideType = "default",
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [editingTableElement, setEditingTableElement] = React.useState<
    string | null
  >(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isTableInitialized, setIsTableInitialized] = React.useState(false);

  // Предотвращаем hydration errors
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Сбрасываем флаг инициализации при смене слайда
  React.useEffect(() => {
    setIsTableInitialized(false);
  }, [slideNumber]);

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
    setTextElementPosition,
    getTextElementPosition,
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
    getImageElement,
    addImageElement,
    updateImageElement,
    // Table state
    tableElements,
    selectedTableElement,
    setSelectedTableElement,
    updateTableElement,
    deleteTableElement,
    copyTableElement,
    addTableElement,
  } = usePresentationStore();

  // Get image area selection for current slide
  const imageAreaSelection = getImageAreaSelection(slideNumber);

  useEffect(() => {
    // Не инициализируем пока компонент не смонтирован
    if (!isMounted) return;

    const tableElementId = `slide-${slideNumber}-table`;
    const existingTable = tableElements[slideNumber]?.[tableElementId];

    console.log(
      `🔍 Proto004Template - useEffect triggered for slide ${slideNumber}:`,
      {
        tableElementId,
        existingTable: !!existingTable,
        allTables: Object.keys(tableElements[slideNumber] || {}),
        slideElements: tableElements[slideNumber],
        isTableInitialized,
      }
    );

    if (!existingTable && !isTableInitialized) {
      console.log(
        `🔧 Proto004Template - No table found for slide ${slideNumber}, creating default...`
      );

      const initialTableData = {
        id: tableElementId,
        rows: 4,
        cols: 4,
        cells: [
          [
            {
              id: "cell-0-0",
              content: "{{t1_content}}",
              rowIndex: 0,
              colIndex: 0,
            },
            {
              id: "cell-0-1",
              content: "{{t1_content}}",
              rowIndex: 0,
              colIndex: 1,
            },
            {
              id: "cell-0-2",
              content: "{{t1_content}}",
              rowIndex: 0,
              colIndex: 2,
            },
            {
              id: "cell-0-3",
              content: "{{t1_content}}",
              rowIndex: 0,
              colIndex: 3,
            },
          ],
          [
            {
              id: "cell-1-0",
              content: "{{t2_content}}",
              rowIndex: 1,
              colIndex: 0,
            },
            {
              id: "cell-1-1",
              content: "{{t2_content}}",
              rowIndex: 1,
              colIndex: 1,
            },
            {
              id: "cell-1-2",
              content: "{{t2_content}}",
              rowIndex: 1,
              colIndex: 2,
            },
            {
              id: "cell-1-3",
              content: "{{t2_content}}",
              rowIndex: 1,
              colIndex: 3,
            },
          ],
          [
            {
              id: "cell-2-0",
              content: "{{t2_content}}",
              rowIndex: 2,
              colIndex: 0,
            },
            {
              id: "cell-2-1",
              content: "{{t2_content}}",
              rowIndex: 2,
              colIndex: 1,
            },
            {
              id: "cell-2-2",
              content: "{{t2_content}}",
              rowIndex: 2,
              colIndex: 2,
            },
            {
              id: "cell-2-3",
              content: "{{t2_content}}",
              rowIndex: 2,
              colIndex: 3,
            },
          ],
          [
            {
              id: "cell-3-0",
              content: "{{t2_content}}",
              rowIndex: 3,
              colIndex: 0,
            },
            {
              id: "cell-3-1",
              content: "{{t2_content}}",
              rowIndex: 3,
              colIndex: 1,
            },
            {
              id: "cell-3-2",
              content: "{{t2_content}}",
              rowIndex: 3,
              colIndex: 2,
            },
            {
              id: "cell-3-3",
              content: "{{t2_content}}",
              rowIndex: 3,
              colIndex: 3,
            },
          ],
        ],
        style: {
          borderThickness: 1,
          borderColor: "#BBA2FE",
          textColor: "#333333",
          fontSize: 14,
          textAlign: "left" as const,
          textFormats: [],
        },
        position: { x: 0, y: 100 },
      };

      // Добавляем таблицу в store с позицией как на скриншоте (под subtitle)
      console.log(
        `⚡ About to add table for slide ${slideNumber} with ID: ${tableElementId}`
      );
      addTableElement(initialTableData, { x: 0, y: 100 });
      setIsTableInitialized(true);

      // Проверяем состояние после добавления
      setTimeout(() => {
        const updatedTables =
          usePresentationStore.getState().tableElements[slideNumber] || {};
        console.log(
          `✅ Proto004Template - Table created for slide ${slideNumber}. Current tables:`,
          Object.keys(updatedTables)
        );
      }, 0);
    }
  }, [slideNumber, isMounted, isTableInitialized]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent actions when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Delete selected elements with Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedTextElement) {
          deleteTextElement(selectedTextElement);
          setSelectedTextElement(null);
        } else if (selectedImageElement) {
          deleteImageElement(selectedImageElement, slideNumber);
          setSelectedImageElement(null);
        } else if (selectedTableElement) {
          deleteTableElement(selectedTableElement);
          setSelectedTableElement(null);
        }
      }

      // Clear image area selection with Escape
      if (e.key === "Escape") {
        if (isImageAreaSelectionMode) {
          clearImageAreaSelection(slideNumber);
        }
      }

      // Add text element with Ctrl+T
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        const newElementId = `slide-${slideNumber}-text-${Date.now()}`;

        // Set initial position and content
        setTextElementPosition(newElementId, { x: 100, y: 100 });
        setTextElementContent(newElementId, "New Text");
        updateTextElementStyle(newElementId, {
          fontSize: 16,
          fontWeight: "normal",
          color: "#000000",
          textAlign: "left" as const,
        });

        // Select the new element
        setSelectedTextElement(newElementId);

        console.log(`✅ Created new text element: ${newElementId}`);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isImageAreaSelectionMode,
    clearImageAreaSelection,
    slideNumber,
    selectedTextElement,
    selectedImageElement,
    selectedTableElement,
    deleteTextElement,
    deleteImageElement,
    setSelectedImageElement,
    deleteTableElement,
    setSelectedTableElement,
    setTextElementPosition,
    setTextElementContent,
    updateTextElementStyle,
    setSelectedTextElement,
  ]);

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
      deleteTextElement(selectedTextElement);
      setSelectedTextElement(null);
    }
  };

  const handleTextCopy = (elementId: string) => {
    console.log(
      "Proto004Template: handleTextCopy called for:",
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
    console.log("Proto004Template: handleTextMoveUp called for:", elementId);
    usePresentationStore.getState().moveTextElementUp(elementId);
    console.log("Text element moved up:", elementId);
  };

  const handleTextMoveDown = (elementId: string) => {
    console.log("Proto004Template: handleTextMoveDown called for:", elementId);
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

  const renderSlideDataElements = () => {
    let slideData = null;
    let templateId = null;
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
        templateId = slideData?._template_id;
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }

    console.log(
      `🎨 Proto004Template - Slide ${slideNumber}, templateId: ${templateId}`
    );

    const getElementPosition = (elementType: string): React.CSSProperties => {
      switch (elementType) {
        case "title":
          return { position: "absolute", left: 0, top: 0 };
        case "subtitle":
          return { position: "absolute", left: 0, top: 0 };
        default:
          return { position: "absolute", left: 0, top: 0 };
      }
    };

    const elements = [];

    // Рендерим элементы из slideData если есть
    if (slideData) {
      // Рендерим title если есть
      if (slideData.title) {
        const titlePosition = getElementPosition("title");
        elements.push(
          <div
            key={`slidedata-${slideNumber}-title-wrapper`}
            style={titlePosition}
          >
            <ResizableTextBox
              minWidth={200}
              elementId={`slide-${slideNumber}-title`}
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-title`
              )}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
              onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
              onMoveDown={() =>
                handleTextMoveDown(`slide-${slideNumber}-title`)
              }
            >
              <EditableText
                elementId={`slide-${slideNumber}-title`}
                initialText={slideData.title}
                className="text-[24px] font-bold cursor-pointer transition-colors text-black"
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-title`,
                    slideData.title,
                    e
                  );
                }}
              />
            </ResizableTextBox>
          </div>
        );
      }

      // Рендерим subtitle если есть
      if (slideData.subtitle) {
        const subtitlePosition = getElementPosition("subtitle");
        elements.push(
          <div
            key={`slidedata-${slideNumber}-subtitle-wrapper`}
            style={subtitlePosition}
          >
            <ResizableTextBox
              minWidth={200}
              elementId={`slide-${slideNumber}-subtitle`}
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-subtitle`
              )}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-subtitle`)}
              onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-subtitle`)}
              onMoveDown={() =>
                handleTextMoveDown(`slide-${slideNumber}-subtitle`)
              }
            >
              <EditableText
                elementId={`slide-${slideNumber}-subtitle`}
                initialText={slideData.subtitle}
                className="text-[18px] font-medium cursor-pointer transition-colors text-black"
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-subtitle`,
                    slideData.subtitle,
                    e
                  );
                }}
              />
            </ResizableTextBox>
          </div>
        );
      }
    }

    return elements;
  };

  // Render table elements from store
  const renderTableElements = () => {
    const currentSlideElements = tableElements[slideNumber] || {};
    console.log(
      `🎨 Proto004Template - Rendering tables for slide ${slideNumber}:`,
      {
        elementCount: Object.keys(currentSlideElements).length,
        elementIds: Object.keys(currentSlideElements),
      }
    );
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
                "Proto004Template: handleTableCopy called for:",
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

  // Render static alignment guides when any element is selected on current slide
  const renderAlignmentGuides = () => {
    // Check if any element is selected and belongs to current slide
    const isTextElementOnCurrentSlide =
      selectedTextElement &&
      selectedTextElement.includes(`slide-${slideNumber}-`);

    const isTableElementOnCurrentSlide =
      selectedTableElement &&
      tableElements[slideNumber]?.[selectedTableElement];

    const isImageElementOnCurrentSlide =
      selectedImageElement &&
      imageElements[slideNumber]?.[selectedImageElement];

    // Show guides only if an element from current slide is selected
    if (
      !isTextElementOnCurrentSlide &&
      !isTableElementOnCurrentSlide &&
      !isImageElementOnCurrentSlide
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
      setSelectedTextElement(null);
      setSelectedTableElement(null);
      setSelectedImageElement(null);
      clearTextSelection();
    }
  };

  const renderSlideByType = () => {
    // Предотвращаем hydration errors - ждем клиентского рендеринга
    if (!isMounted) {
      return (
        <div
          className="slide-container mx-auto w-[720px] h-[405px] bg-white rounded-[12px] overflow-hidden flex items-center justify-center"
          style={{ position: "relative" }}
        >
          <div className="text-gray-500">Загрузка...</div>
        </div>
      );
    }

    console.log(`🎯 [Proto004Template] Render for slide ${slideNumber}`);

    return (
      <div
        className={`slide-container mx-auto w-[720px] h-[405px] bg-white rounded-[12px] overflow-hidden ${
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
        <div
          className="interactive-layer absolute inset-0"
          style={{ zIndex: 10 }}
        >
          {renderSlideDataElements()}
          {renderTableElements()}
          {renderAlignmentGuides()}
          {renderImageAreaSelection()}
        </div>
      </div>
    );
  };

  return renderSlideByType();
};
