"use client";

import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { ResizableInfographicsBox } from "@/shared/ui/ResizableInfographicsBox";
import { useRenderSlidesWithData } from "@/shared/api/presentation-generation";
import Image from "next/image";

interface SlideContentProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  isGenerating?: boolean;
}

export const Proto005Template = ({
  slideNumber,
  slideType = "default",
}: SlideContentProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [editingTableElement, setEditingTableElement] = React.useState<
    string | null
  >(null);
  const [renderedHtml, setRenderedHtml] = React.useState<string | null>(null);
  const [isLoadingRender, setIsLoadingRender] = React.useState(false);
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
    textElementStyles,
    getTextElementPosition,
    setTextElementPosition,
    textElementContents,
    setTextElementContent,
    getTextElementContent,
    deleteTextElement,
    copyTextElement,
    moveTextElementUp,
    moveTextElementDown,
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
    // Infographics state
    infographicsElements,
    selectedInfographicsElement,
    setSelectedInfographicsElement,
    deleteInfographicsElement,
    copyTableElement,
  } = usePresentationStore();

  // Get image area selection for current slide
  const imageAreaSelection = getImageAreaSelection(slideNumber);

  // Add init callback
  const initializeElementContents = React.useCallback(
    (slideData: any) => {
      console.log(
        `🔧 Proto005Template: Initializing element contents for slide ${slideNumber}`,
        { slideData }
      );

      // Title initialization
      if (slideData?.title) {
        const titleId = `slide-${slideNumber}-title`;
        const currentTitle = getTextElementContent(titleId);
        if (!currentTitle || currentTitle !== slideData.title) {
          setTextElementContent(titleId, slideData.title);
          console.log(
            `✅ Title initialized: ${titleId} = "${slideData.title}"`
          );
        }
      }

      // Subtitle initialization
      if (slideData?.subtitle) {
        const subtitleId = `slide-${slideNumber}-subtitle`;
        const currentSubtitle = getTextElementContent(subtitleId);
        if (!currentSubtitle || currentSubtitle !== slideData.subtitle) {
          setTextElementContent(subtitleId, slideData.subtitle);
          console.log(
            `✅ Subtitle initialized: ${subtitleId} = "${slideData.subtitle}"`
          );
        }
      }

      // T2 content initialization
      if (slideData?.t2_content) {
        const t2ContentId = `slide-${slideNumber}-t2-content`;
        const currentT2Content = getTextElementContent(t2ContentId);
        if (!currentT2Content || currentT2Content !== slideData.t2_content) {
          setTextElementContent(t2ContentId, slideData.t2_content);
          console.log(
            `✅ T2 content initialized: ${t2ContentId} = "${slideData.t2_content}"`
          );
        }
      }

      // Proto005Template использует первое изображение как фон
      // Остальные изображения могут быть добавлены как элементы если нужно
      if (slideData?._images && Array.isArray(slideData._images)) {
        console.log(
          `🖼️ Proto005Template: Found ${slideData._images.length} images for slide ${slideNumber}:`,
          slideData._images
        );

        // Первое изображение используется как фон (уже обработано выше)
        // Дополнительные изображения можно добавить как элементы если понадобится
        if (slideData._images.length > 1) {
          console.log(
            `📋 Proto005Template: Additional images available but not used in this template`
          );
        }
      }
    },
    [
      slideNumber,
      setTextElementContent,
      getTextElementContent,
      getImageElement,
      addImageElement,
      updateImageElement,
    ]
  );

  // Простой эффект для логирования изменений слайда
  React.useEffect(() => {
    if (isMounted) {
      console.log(
        `🎯 Proto005Template mounted for slide ${slideNumber}, slideType: ${slideType}`
      );
    }
  }, [slideNumber, isMounted]);

  // Debug effect to track state changes
  React.useEffect(() => {
    console.log(
      `🐛 Proto005Template Debug - Slide: ${slideNumber}, Type: ${slideType}`,
      {
        textElementStyles: Object.keys(textElementStyles).filter((key) =>
          key.includes(`slide-${slideNumber}`)
        ),
        selectedTextElement,
      }
    );
  }, [slideNumber, slideType, textElementStyles, selectedTextElement]);

  // Эффект для инициализации элементов слайда при переключении
  React.useEffect(() => {
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const slideData = generatedPresentation.data?.slides?.[slideNumber - 1];

        if (slideData) {
          initializeElementContents(slideData);
        }
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }

    // Проверяем, есть ли уже отрендеренный HTML для этого слайда
    if (renderedSlides[slideNumber]) {
      setRenderedHtml(renderedSlides[slideNumber]);
      console.log(
        `♻️ Proto005Template: Using cached HTML for slide ${slideNumber}`
      );
      return;
    }

    // Избегаем повторных запросов
    if (isLoadingRender) {
      console.log(
        `⏳ Proto005Template: Already loading render for slide ${slideNumber}`
      );
      return;
    }

    const loadAndRenderSlides = async () => {
      if (!generatedPresentationStr) {
        console.log(
          "❌ Proto005Template: No generated presentation data found"
        );
        return;
      }

      try {
        setIsLoadingRender(true);
        console.log(
          `🚀 Proto005Template: Starting render for slide ${slideNumber}`
        );

        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
        const templateIds = generatedPresentation.data?.templateIds;
        const templateId =
          templateIds?.[slideNumber - 1] ||
          slideData?._template_id ||
          "proto005";

        if (!slideData) {
          console.log(
            `❌ Proto005Template: No slide data found for slide ${slideNumber}`
          );
          return;
        }

        console.log(
          `📊 Proto005Template: Processing slide data for slide ${slideNumber}:`,
          slideData
        );

        const result = await renderSlidesWithDataMutation.mutateAsync({
          slides: [slideData],
          templateIds: [templateId],
        });

        console.log(
          `✅ Proto005Template: Render completed for slide ${slideNumber}`,
          result
        );

        // Находим HTML для текущего слайда
        const currentSlideResult = result.find(
          (slide) => slide.slideNumber === slideNumber
        );

        if (currentSlideResult) {
          const htmlContent = currentSlideResult.html;
          setRenderedHtml(htmlContent);

          // Сохраняем в кеш
          setRenderedSlides((prev) => ({
            ...prev,
            [slideNumber]: htmlContent,
          }));

          console.log(
            `💾 Proto005Template: Cached HTML for slide ${slideNumber}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Proto005Template: Error rendering slide ${slideNumber}:`,
          error
        );
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
      const currentPosition = getTextElementPosition(elementId);
      if (!currentPosition) {
        setTextElementPosition(elementId, { x: defaultX, y: defaultY });
        console.log(
          `🎯 Proto005Template: Initialized position for ${elementId}:`,
          { x: defaultX, y: defaultY }
        );
      }
    };

    console.log(
      `Initializing positions for slideType: ${slideType}, slideNumber: ${slideNumber}`
    );
    console.log("Current textElementStyles:", textElementStyles);

    switch (slideType) {
      case "content":
        // Content slide specific positioning
        initializeElementPosition(`slide-${slideNumber}-title`, 40, 20);
        initializeElementPosition(`slide-${slideNumber}-subtitle`, 40, 60);
        initializeElementPosition(`slide-${slideNumber}-text1`, 40, 100);
        initializeElementPosition(`slide-${slideNumber}-text2`, 40, 140);
        break;

      default:
        // Initialize positions for Proto005Template layout
        initializeElementPosition(`slide-${slideNumber}-title`, 60, 60);
        initializeElementPosition(`slide-${slideNumber}-subtitle`, 60, 120);
        initializeElementPosition(`slide-${slideNumber}-t2-content`, 60, 440);
        initializeElementPosition(`slide-${slideNumber}-t2-content`, 60, 320);
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
        { id: text1ElementId, pos: { x: 200, y: 160 } },
        { id: text2ElementId, pos: { x: 40, y: 280 } },
      ];

      positions.forEach(({ id, pos }) => {
        const currentPosition = getTextElementPosition(id);
        if (!currentPosition) {
          setTextElementPosition(id, pos);
          console.log(`🎯 Set position for ${id}:`, pos);
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
      // Escape key - clear image area selection
      if (e.key === "Escape" && isImageAreaSelectionMode) {
        clearImageAreaSelection(slideNumber);
        return;
      }

      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      const store = usePresentationStore.getState();

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
        console.log("↶ Undo triggered");
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if (
        (e.ctrlKey && e.shiftKey && e.key === "Z") ||
        (e.ctrlKey && e.key === "y")
      ) {
        e.preventDefault();
        store.redo();
        console.log("↷ Redo triggered");
        return;
      }

      // Ctrl+C - Copy selected element
      if (e.ctrlKey && e.key === "c") {
        console.log("📋 Copy triggered");
        return;
      }

      // Ctrl+V - Paste from clipboard
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        store.pasteElementFromClipboard(slideNumber);
        console.log("📋 Paste triggered");
        return;
      }

      // Delete key - delete selected element
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();

        console.log("Delete key pressed. Current selections:", {
          selectedTextElement,
          selectedImageElement,
          selectedTableElement,
          selectedInfographicsElement,
        });

        if (selectedTextElement) {
          console.log("Deleting text element:", selectedTextElement);
          deleteTextElement(selectedTextElement);
          setSelectedTextElement(null);
        } else if (selectedImageElement) {
          console.log("Deleting image element:", selectedImageElement);
          deleteImageElement(selectedImageElement, slideNumber);
          setSelectedImageElement(null);
        } else if (selectedTableElement) {
          console.log("Deleting table element:", selectedTableElement);
          deleteTableElement(selectedTableElement);
          setSelectedTableElement(null);
        } else if (selectedInfographicsElement) {
          console.log(
            "Deleting infographics element:",
            selectedInfographicsElement
          );
          deleteInfographicsElement(slideNumber, selectedInfographicsElement);
          setSelectedInfographicsElement(null);
        }
        console.log("🗑️ Delete triggered");
        return;
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
    selectedInfographicsElement,
    deleteTextElement,
    deleteImageElement,
    setSelectedImageElement,
    deleteTableElement,
    setSelectedTableElement,
    deleteInfographicsElement,
    setSelectedInfographicsElement,
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
        const templateIds = generatedPresentation.data?.templateIds;
        templateId = templateIds?.[slideNumber - 1] || slideData?._template_id;
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
        return [];
      }
    }

    console.log(
      `🎨 Proto005Template - Slide ${slideNumber}, templateId: ${templateId}`,
      { slideData }
    );

    const getElementPosition = (elementType: string): React.CSSProperties => {
      switch (elementType) {
        case "title":
          // Заголовок в левом верхнем углу
          return {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "auto",
            maxWidth: "calc(100% - 120px)",
            textAlign: "left",
          };
        case "subtitle":
          return {
            position: "absolute",
            left: "0px",
            top: "30px",
            width: "auto",
            maxWidth: "calc(100% - 120px)",
            textAlign: "left",
          };
        case "t2-content":
          return {
            position: "absolute",
            left: "30px",
            top: "220px",
            textAlign: "center",
            zIndex: 99999,
            fontSize: "20px",
            fontWeight: "bold",
          };
        case "text1-title":
        case "text1-content":
        case "text2-title":
        case "text2-content":
          return {
            position: "absolute",
            left: "-9999px",
            visibility: "hidden",
          };
        default:
          return { position: "absolute", left: 0, top: 0 };
      }
    };

    if (!slideData) {
      console.log(
        `⚠️ No slide data found for slide ${slideNumber}, showing placeholders`
      );
      const elements = [];

      const titlePosition = getElementPosition("title");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-title-placeholder`}
          style={titlePosition}
        >
          <ResizableTextBox
            minWidth={200}
            elementId={`slide-${slideNumber}-title`}
            isSelected={selectedTextElement === `slide-${slideNumber}-title`}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
            onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-title`)}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText="{{title}}"
              className="text-[32px] font-bold cursor-pointer transition-colors text-[#2563EB]"
              onClick={(e) => {
                handleTextClick(`slide-${slideNumber}-title`, "{{title}}", e);
              }}
            />
          </ResizableTextBox>
        </div>
      );

      // Плейсхолдер для subtitle
      const subtitlePosition = getElementPosition("subtitle");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-subtitle-placeholder`}
          style={subtitlePosition}
        >
          <ResizableTextBox
            minWidth={200}
            elementId={`slide-${slideNumber}-subtitle`}
            isSelected={selectedTextElement === `slide-${slideNumber}-subtitle`}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-subtitle`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-subtitle`)}
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-subtitle`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-subtitle`}
              initialText="{{subtitle}}"
              className="text-[18px] cursor-pointer transition-colors text-black"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-subtitle`,
                  "{{subtitle}}",
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );

      const t2ContentPosition = getElementPosition("t2-content");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-t2-content-placeholder`}
          style={t2ContentPosition}
        >
          <ResizableTextBox
            minWidth={200}
            elementId={`slide-${slideNumber}-t2-content`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-t2-content`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-t2-content`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-t2-content`)}
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-t2-content`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-t2-content`}
              initialText="{{t2_content}}"
              className="text-[20px] cursor-pointer transition-colors text-white font-bold px-6 py-3 rounded-lg inline-block"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-t2-content`,
                  slideData?.text3,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );

      return elements;
    }

    const elements = [];

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
            isSelected={selectedTextElement === `slide-${slideNumber}-title`}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
            onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-title`)}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-[32px] font-bold cursor-pointer transition-colors text-[#2563EB]"
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
            isSelected={selectedTextElement === `slide-${slideNumber}-subtitle`}
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
              className="text-[18px] cursor-pointer transition-colors text-black"
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

    {
      const t2ContentPosition = getElementPosition("t2-content");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-t2-content-wrapper`}
          style={t2ContentPosition}
        >
          <ResizableTextBox
            minWidth={200}
            elementId={`slide-${slideNumber}-t2-content`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-t2-content`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-t2-content`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-t2-content`)}
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-t2-content`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-t2-content`}
              initialText={slideData?.text3 || "{{t2_content}}"}
              className="text-[20px] cursor-pointer transition-colors text-white font-bold px-6 py-3 rounded-lg inline-block"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-t2-content`,
                  slideData?.text3,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );
    }

    return elements;
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

  // Create image element from slide data
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto005-image`;

    // Get slideData from localStorage
    let slideData = null;
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }

    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto005Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto005 image: ${elementId}`);
    console.log(`Current slideData:`, slideData);
    console.log(`Image URL:`, imageUrl);

    // ПРИНУДИТЕЛЬНО создаем изображение с src из slideData
    if (imageUrl) {
      console.log(`🚀 Creating image element in store...`);
      usePresentationStore.setState((state) => {
        console.log(`📦 Current state before update:`, {
          slideImages: state.imageElements[slideNumber],
          allImages: Object.keys(state.imageElements),
        });

        const newState = {
          imageElements: {
            ...state.imageElements,
            [slideNumber]: {
              ...(state.imageElements[slideNumber] || {}),
              [elementId]: {
                id: elementId,
                position: { x: 0, y: 213 }, // Позиция - нижняя половина слайда (427/2 = 213.5)
                width: 759, // Вся ширина слайда
                height: 214, // Нижняя половина слайда (427 - 213 = 214)
                placeholder: false,
                alt: "Proto005 Background Image",
                zIndex: 2, // Фоновое изображение
                src: imageUrl, // Устанавливаем src для показа в ResizableImageBox
              },
            },
          },
        };

        console.log(`📦 New state after update:`, {
          slideImages: newState.imageElements[slideNumber],
          elementToCreate: newState.imageElements[slideNumber][elementId],
        });

        return newState;
      });
      console.log(`✅ FORCE created proto005 image in store: ${elementId}`);
    } else {
      console.log(`❌ No image URL found for slide ${slideNumber}`);
    }

    // Проверим, что изображение создалось
    setTimeout(() => {
      console.log(`🔍 Verification phase - checking created image...`);
      const createdImage = getImageElement(elementId, slideNumber);
      console.log(`🔍 getImageElement result:`, createdImage);

      if (!createdImage) {
        console.error(`❌ CRITICAL: Image not found after creation!`);
      } else {
        console.log(`✅ SUCCESS: Image found after creation!`);
      }
    }, 100);
  }, [slideNumber, getImageElement]);

  // Render image elements from store - для Proto005Template создаем интерактивные изображения
  const renderImageElements = () => {
    const imageElementId = `slide-${slideNumber}-proto005-image`;
    const storeImage = getImageElement(imageElementId, slideNumber);

    console.log(`🎯 About to render ResizableImageBox:`, {
      elementId: imageElementId,
      slideNumber: slideNumber,
      slideDataImages: slideData?._images,
      storeImage: storeImage,
      shouldRender: !!storeImage,
    });

    // Рендерим если есть изображение в store
    if (storeImage) {
      return (
        <ResizableImageBox
          elementId={imageElementId}
          slideNumber={slideNumber}
          isSelected={selectedImageElement === imageElementId}
          onDelete={() => {
            setSelectedImageElement(null);
          }}
        />
      );
    }
    return null;
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

        {/* Right guide */}
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
        {/* Top guide */}
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

        {/* Bottom guide */}
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
        className="absolute   bg-blue-200 bg-opacity-20 pointer-events-none"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          zIndex: 999,
        }}
      />
    );
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking on the slide background
    if (e.target === e.currentTarget) {
      clearTextSelection();
      setSelectedTextElement(null);
      setSelectedImageElement(null);
      setSelectedTableElement(null);
      setSelectedInfographicsElement(null);
    }
  };

  // Get background image from slideData
  let backgroundImage: string | null = null;
  let slideData: any = null;
  let templateId: string | null = null;
  let hasInteractiveBackground = false;

  const generatedPresentationStr = localStorage.getItem(
    "generatedPresentation"
  );
  if (generatedPresentationStr) {
    try {
      const generatedPresentation = JSON.parse(generatedPresentationStr);
      slideData = generatedPresentation.data?.slides?.[slideNumber - 1];
      const templateIds = generatedPresentation.data?.templateIds;
      templateId = templateIds?.[slideNumber - 1] || slideData?._template_id;

      // Получаем фоновое изображение из _images массива
      if (
        slideData?._images &&
        Array.isArray(slideData._images) &&
        slideData._images.length > 0
      ) {
        backgroundImage = slideData._images[0];

        // Проверяем, есть ли уже интерактивное фоновое изображение
        if (templateId === "proto_005") {
          const currentSlideImages = imageElements[slideNumber] || {};
          for (const [, imageData] of Object.entries(currentSlideImages)) {
            if (imageData.src === backgroundImage) {
              hasInteractiveBackground = true;
              break;
            }
          }
        }

        console.log(
          `🖼️ Proto005Template: Using background image for slide ${slideNumber}:`,
          backgroundImage,
          `Interactive: ${hasInteractiveBackground}`
        );
      } else {
        console.log(
          `📋 Proto005Template: No background image found for slide ${slideNumber}, using fallback gradient`
        );
      }
    } catch (error) {
      console.error("Error parsing generated presentation:", error);
    }
  }

  return (
    <div
      className="relative  w-[759px] h-[427px] rounded-[12px] bg-white"
      onClick={handleSlideClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* Render interactive image elements first (as background) */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {renderImageElements()}
      </div>

      {/* Render slide data elements */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {renderSlideDataElements()}
      </div>

      {/* Render interactive table elements */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {renderTableElements()}
      </div>

      {/* Render interactive infographics elements */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {renderInfographicsElements()}
      </div>

      {/* Render alignment guides */}
      {renderAlignmentGuides()}

      {/* Render image area selection */}
      {renderImageAreaSelection()}
    </div>
  );
};
