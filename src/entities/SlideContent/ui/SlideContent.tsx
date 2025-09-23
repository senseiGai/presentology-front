import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { ResizableInfographicsBox } from "@/shared/ui/ResizableInfographicsBox";
import { TemplateRenderer } from "@/entities/TemplateRenderer";
import { useRenderSlidesWithData } from "@/shared/api/presentation-generation";

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
  const [renderedHtml, setRenderedHtml] = React.useState<string | null>(null);
  const [isLoadingRender, setIsLoadingRender] = React.useState(false);
  const [isTemplateMode, setIsTemplateMode] = React.useState(true); // Режим шаблона включен по умолчанию
  const [renderedSlides, setRenderedSlides] = React.useState<
    Record<number, string>
  >({});
  const [isMounted, setIsMounted] = React.useState(false);

  // Предотвращаем hydration errors
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderSlidesWithDataMutation = useRenderSlidesWithData();

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
    // Template state
    slideTemplates,
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

  // Эффект для автоматического рендеринга слайдов с бэкенда
  React.useEffect(() => {
    // Ждем клиентского рендеринга для предотвращения hydration errors
    if (!isMounted) {
      return;
    }

    // Проверяем, есть ли уже отрендеренный HTML для этого слайда
    if (renderedSlides[slideNumber]) {
      console.log(
        `🎯 [SlideContent] Using cached HTML for slide ${slideNumber}`
      );
      setRenderedHtml(renderedSlides[slideNumber]);
      return;
    }

    // Избегаем повторных запросов
    if (isLoadingRender) {
      console.log("🔄 [SlideContent] Already loading slides");
      return;
    }

    const loadAndRenderSlides = async () => {
      const generatedPresentationStr = localStorage.getItem(
        "generatedPresentation"
      );
      if (!generatedPresentationStr) {
        console.log("No presentation data found in localStorage");
        return;
      }

      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const slides = generatedPresentation.data?.slides;
        const templateIds = generatedPresentation.data?.templateIds;

        if (
          !slides ||
          !templateIds ||
          slides.length === 0 ||
          templateIds.length === 0
        ) {
          console.log("No slides or templateIds found in presentation data");
          return;
        }

        console.log("🎨 [SlideContent] Starting slide rendering", {
          slidesCount: slides.length,
          templateIds,
          currentSlide: slideNumber,
        });

        setIsLoadingRender(true);

        // Вызываем API для рендеринга всех слайдов
        const renderedSlidesResult =
          await renderSlidesWithDataMutation.mutateAsync({
            slides,
            templateIds,
          });

        console.log(
          "✅ [SlideContent] Slides rendered successfully",
          renderedSlidesResult
        );

        // Сохраняем все отрендеренные слайды в кэш
        const slidesCache: Record<number, string> = {};
        renderedSlidesResult.forEach((slide) => {
          slidesCache[slide.slideNumber] = slide.html;
        });
        setRenderedSlides(slidesCache);

        // Находим HTML для текущего слайда
        const currentSlideHtml = renderedSlidesResult.find(
          (slide) => slide.slideNumber === slideNumber
        );

        if (currentSlideHtml) {
          console.log(`🎯 [SlideContent] Found HTML for slide ${slideNumber}`, {
            templateId: currentSlideHtml.templateId,
            htmlLength: currentSlideHtml.html.length,
          });
          setRenderedHtml(currentSlideHtml.html);
        } else {
          console.warn(
            `⚠️ [SlideContent] No HTML found for slide ${slideNumber}`
          );
        }
      } catch (error) {
        console.error("❌ [SlideContent] Failed to render slides", error);
      } finally {
        setIsLoadingRender(false);
      }
    };

    loadAndRenderSlides();
  }, [slideNumber, isMounted]); // Добавляем isMounted в зависимости

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

  // Initialize positions for template elements when rendering with backend HTML
  React.useEffect(() => {
    if (renderedHtml) {
      const titleElementId = `slide-${slideNumber}-title`;
      const subtitleElementId = `slide-${slideNumber}-subtitle`;
      const text1ElementId = `slide-${slideNumber}-text1`;
      const text2ElementId = `slide-${slideNumber}-text2`;

      const positions = [
        {
          id: titleElementId,
          pos: {
            x: slideNumber === 1 ? 50 : 40,
            y: slideNumber === 1 ? 150 : 30,
          },
        },
        {
          id: subtitleElementId,
          pos: {
            x: slideNumber === 1 ? 50 : 40,
            y: slideNumber === 1 ? 240 : 90,
          },
        },
        { id: text1ElementId, pos: { x: 40, y: 160 } },
        { id: text2ElementId, pos: { x: 40, y: 280 } },
      ];

      positions.forEach(({ id, pos }) => {
        const currentPos = getTextElementPosition(id);
        if (currentPos.x === 0 && currentPos.y === 0) {
          setTextElementPosition(id, pos);
        }
      });
    }
  }, [
    renderedHtml,
    slideNumber,
    getTextElementPosition,
    setTextElementPosition,
  ]);

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
    // Предотвращаем hydration errors - ждем клиентского рендеринга
    if (!isMounted) {
      return (
        <div
          className="slide-container mx-auto w-[759px] h-[427px] bg-white rounded-[12px] overflow-hidden flex items-center justify-center"
          style={{ position: "relative" }}
        >
          <div className="text-gray-500">Загрузка...</div>
        </div>
      );
    }

    // Приоритет 1: Проверяем, есть ли готовый HTML с бэкенда
    if (renderedHtml) {
      console.log(
        `🎯 [SlideContent] Rendering slide ${slideNumber} with backend HTML`
      );

      // Получаем данные слайда для редактируемых элементов
      const generatedPresentationStr = localStorage.getItem(
        "generatedPresentation"
      );
      let slideData = null;

      if (generatedPresentationStr) {
        try {
          const generatedPresentation = JSON.parse(generatedPresentationStr);
          slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
        } catch (error) {
          console.error("Error parsing generated presentation:", error);
        }
      }

      // Подготавливаем начальные позиции для элементов в store
      const titleElementId = `slide-${slideNumber}-title`;
      const subtitleElementId = `slide-${slideNumber}-subtitle`;
      const text1ElementId = `slide-${slideNumber}-text1`;
      const text2ElementId = `slide-${slideNumber}-text2`;

      return (
        <div
          className={`slide-container mx-auto w-[759px] h-[427px] bg-white rounded-[12px] overflow-hidden ${
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
          {/* Кнопка переключения режимов */}
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={() => setIsTemplateMode(!isTemplateMode)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              title={isTemplateMode ? "Отключить шаблон" : "Включить шаблон"}
            >
              {isTemplateMode ? "Шаблон ВКЛ" : "Шаблон ВЫКЛ"}
            </button>
          </div>

          {/* Фоновый HTML шаблон */}
          {isTemplateMode && (
            <div
              className="template-background absolute inset-0 pointer-events-none"
              style={{
                zIndex: 0,
                opacity: 0.3, // Делаем фон полупрозрачным
                filter: "grayscale(0.5)", // Слегка обесцвечиваем фон
              }}
            >
              <TemplateRenderer
                html={renderedHtml}
                templateId={`slide_${slideNumber}`}
                className="w-full h-full"
              />
            </div>
          )}

          {/* Редактируемые элементы поверх шаблона */}
          <div
            className="editable-layer absolute inset-0"
            style={{ zIndex: 10 }}
          >
            {/* Заголовок */}
            <ResizableTextBox
              isSelected={selectedTextElements.includes(titleElementId)}
              elementId={titleElementId}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(titleElementId)}
              onMoveUp={() => handleTextMoveUp(titleElementId)}
              onMoveDown={() => handleTextMoveDown(titleElementId)}
            >
              <EditableText
                elementId={titleElementId}
                initialText={
                  slideData?.title || `Заголовок слайда ${slideNumber}`
                }
                className="text-[32px] font-bold text-black cursor-pointer transition-colors"
                style={{
                  backgroundColor: isTemplateMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "transparent",
                  padding: isTemplateMode ? "4px 8px" : "0",
                  borderRadius: isTemplateMode ? "4px" : "0",
                  textShadow: isTemplateMode
                    ? "1px 1px 2px rgba(0,0,0,0.3)"
                    : "none",
                }}
                onClick={(e) => {
                  handleTextClick(
                    titleElementId,
                    getTextElementContent(titleElementId) ||
                      slideData?.title ||
                      `Заголовок слайда ${slideNumber}`,
                    e
                  );
                }}
              />
            </ResizableTextBox>

            {/* Подзаголовок */}
            {slideData?.subtitle && (
              <ResizableTextBox
                isSelected={selectedTextElements.includes(subtitleElementId)}
                elementId={subtitleElementId}
                onDelete={handleTextDelete}
                onCopy={() => handleTextCopy(subtitleElementId)}
                onMoveUp={() => handleTextMoveUp(subtitleElementId)}
                onMoveDown={() => handleTextMoveDown(subtitleElementId)}
              >
                <EditableText
                  elementId={subtitleElementId}
                  initialText={slideData.subtitle}
                  className="text-[20px] font-normal text-gray-700 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isTemplateMode
                      ? "rgba(255, 255, 255, 0.8)"
                      : "transparent",
                    padding: isTemplateMode ? "4px 8px" : "0",
                    borderRadius: isTemplateMode ? "4px" : "0",
                    textShadow: isTemplateMode
                      ? "1px 1px 2px rgba(0,0,0,0.3)"
                      : "none",
                  }}
                  onClick={(e) => {
                    handleTextClick(
                      subtitleElementId,
                      getTextElementContent(subtitleElementId) ||
                        slideData.subtitle,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}

            {/* Первый текстовый блок */}
            {slideData?.text1?.t2 && (
              <ResizableTextBox
                isSelected={selectedTextElements.includes(text1ElementId)}
                elementId={text1ElementId}
                onDelete={handleTextDelete}
                onCopy={() => handleTextCopy(text1ElementId)}
                onMoveUp={() => handleTextMoveUp(text1ElementId)}
                onMoveDown={() => handleTextMoveDown(text1ElementId)}
              >
                <EditableText
                  elementId={text1ElementId}
                  initialText={slideData.text1.t2}
                  className="text-[16px] font-normal text-gray-800 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isTemplateMode
                      ? "rgba(255, 255, 255, 0.8)"
                      : "transparent",
                    padding: isTemplateMode ? "4px 8px" : "0",
                    borderRadius: isTemplateMode ? "4px" : "0",
                    textShadow: isTemplateMode
                      ? "1px 1px 2px rgba(0,0,0,0.3)"
                      : "none",
                  }}
                  onClick={(e) => {
                    handleTextClick(
                      text1ElementId,
                      getTextElementContent(text1ElementId) ||
                        slideData.text1.t2,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}

            {/* Второй текстовый блок */}
            {slideData?.text2?.t2 && (
              <ResizableTextBox
                isSelected={selectedTextElements.includes(text2ElementId)}
                elementId={text2ElementId}
                onDelete={handleTextDelete}
                onCopy={() => handleTextCopy(text2ElementId)}
                onMoveUp={() => handleTextMoveUp(text2ElementId)}
                onMoveDown={() => handleTextMoveDown(text2ElementId)}
              >
                <EditableText
                  elementId={text2ElementId}
                  initialText={slideData.text2.t2}
                  className="text-[16px] font-normal text-gray-800 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isTemplateMode
                      ? "rgba(255, 255, 255, 0.8)"
                      : "transparent",
                    padding: isTemplateMode ? "4px 8px" : "0",
                    borderRadius: isTemplateMode ? "4px" : "0",
                    textShadow: isTemplateMode
                      ? "1px 1px 2px rgba(0,0,0,0.3)"
                      : "none",
                  }}
                  onClick={(e) => {
                    handleTextClick(
                      text2ElementId,
                      getTextElementContent(text2ElementId) ||
                        slideData.text2.t2,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}

            {/* Динамические элементы */}
            {renderDynamicTextElements()}
            {renderTableElements()}
            {renderImageElements()}
            {renderInfographicsElements()}
            {renderAlignmentGuides()}
            {renderImageAreaSelection()}
          </div>
        </div>
      );
    }

    // Приоритет 2: Показываем лоадер, если HTML загружается
    if (isLoadingRender) {
      return (
        <div
          className="slide-container mx-auto w-[759px] h-[427px] bg-white rounded-[12px] flex items-center justify-center"
          style={{ position: "relative" }}
        >
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            Загрузка слайда {slideNumber}...
          </div>
        </div>
      );
    }

    // Приоритет 3: Fallback к старой логике (локальные шаблоны)
    console.log("🔄 [SlideContent] Falling back to local template logic");

    // Получаем данные презентации из localStorage
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    console.log(
      "localStorage generatedPresentation:",
      generatedPresentationStr
    );

    // Debug: показываем все ключи в localStorage
    console.log("All localStorage keys:", Object.keys(localStorage));

    // Debug: показываем доступные шаблоны
    console.log("Available slideTemplates:", Object.keys(slideTemplates));
    console.log("slideTemplates data:", slideTemplates);

    // Debug: показываем все что есть в localStorage
    const allLocalStorageData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allLocalStorageData[key] = localStorage.getItem(key);
      }
    }
    console.log("All localStorage data:", allLocalStorageData);
    let slideData = null;

    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        console.log("Parsed generatedPresentation:", generatedPresentation);
        console.log("Available slides:", generatedPresentation.data?.slides);

        // Получаем данные для текущего слайда (slideNumber - 1, так как массив начинается с 0)
        slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
        console.log(`Slide data for slide ${slideNumber}:`, slideData);
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }

    // Проверяем, есть ли HTML шаблон для текущего слайда
    console.log(`Looking for template for slide ${slideNumber}`);
    console.log("Available template keys:", Object.keys(slideTemplates));

    const slideTemplateKey = Object.keys(slideTemplates).find((templateId) => {
      // Попробуем найти шаблон по разным возможным именам
      const matches =
        templateId === `slide_${slideNumber}` ||
        templateId === `slide_${slideNumber.toString().padStart(3, "0")}` ||
        templateId === `proto_${slideNumber.toString().padStart(3, "0")}` ||
        templateId === `proto_${slideNumber}`;
      console.log(
        `Checking template ${templateId} for slide ${slideNumber}: ${matches}`
      );
      return matches;
    });

    console.log(`Found template key: ${slideTemplateKey}`);

    if (slideTemplateKey && slideTemplates[slideTemplateKey] && slideData) {
      console.log(
        `Rendering HTML template for slide ${slideNumber}:`,
        slideTemplateKey
      );

      // Заполняем шаблон данными слайда
      let filledHtml = slideTemplates[slideTemplateKey];
      console.log("Original template HTML length:", filledHtml.length);
      console.log("Template preview:", filledHtml.substring(0, 200) + "...");

      // Заменяем плейсхолдеры данными слайда
      if (slideData.title) {
        console.log("Replacing {{title}} with:", slideData.title);
        filledHtml = filledHtml.replace(/\{\{title\}\}/g, slideData.title);
      }
      if (slideData.subtitle) {
        console.log("Replacing {{subtitle}} with:", slideData.subtitle);
        filledHtml = filledHtml.replace(
          /\{\{subtitle\}\}/g,
          slideData.subtitle
        );
      }
      if (slideData.text1?.t1) {
        console.log("Replacing {{text1_title}} with:", slideData.text1.t1);
        filledHtml = filledHtml.replace(
          /\{\{text1_title\}\}/g,
          slideData.text1.t1
        );
      }
      if (slideData.text1?.t2) {
        console.log("Replacing {{text1_content}} with:", slideData.text1.t2);
        filledHtml = filledHtml.replace(
          /\{\{text1_content\}\}/g,
          slideData.text1.t2
        );
      }
      if (slideData.text2?.t1) {
        filledHtml = filledHtml.replace(
          /\{\{text2_title\}\}/g,
          slideData.text2.t1
        );
      }
      if (slideData.text2?.t2) {
        filledHtml = filledHtml.replace(
          /\{\{text2_content\}\}/g,
          slideData.text2.t2
        );
      }
      if (slideData.text3?.t1) {
        filledHtml = filledHtml.replace(
          /\{\{text3_title\}\}/g,
          slideData.text3.t1
        );
      }
      if (slideData.text3?.t2) {
        filledHtml = filledHtml.replace(
          /\{\{text3_content\}\}/g,
          slideData.text3.t2
        );
      }
      if (slideData._images?.[0]) {
        console.log("Replacing {{image}} with:", slideData._images[0]);
        filledHtml = filledHtml.replace(/\{\{image\}\}/g, slideData._images[0]);
      }

      console.log("Final filled HTML length:", filledHtml.length);
      console.log("Final HTML preview:", filledHtml.substring(0, 500) + "...");

      return (
        <div
          className={`slide-container mx-auto w-[759px] h-[427px] bg-white rounded-[12px] overflow-hidden ${
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
          <TemplateRenderer
            html={filledHtml}
            templateId={slideTemplateKey}
            className="w-full h-full"
          />
        </div>
      );
    }

    // Если нет HTML шаблона, рендерим обычный слайд
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
