"use client";

import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { EditableText } from "@/shared/ui/EditableText";
import { ResizableTable } from "@/shared/ui/ResizableTable";
import { EditableTable } from "@/features/TablePanel/ui/EditableTable";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { ResizableInfographicsBox } from "@/shared/ui/ResizableInfographicsBox";
import { PureTemplateRenderer } from "@/entities/PureTemplateRenderer";
import { useRenderSlidesWithData } from "@/shared/api/presentation-generation";

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
  const [isTemplateMode, setIsTemplateMode] = React.useState(true);
  const [renderedSlides, setRenderedSlides] = React.useState<
    Record<number, string>
  >({});
  const [isMounted, setIsMounted] = React.useState(false);
  const initializedSlidesRef = React.useRef<Set<number>>(new Set());

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

      // Image initialization - добавляем изображения из _images массива
      if (slideData?._images && Array.isArray(slideData._images)) {
        slideData._images.forEach((imageSrc: string, index: number) => {
          const imageId = `slide-${slideNumber}-image-${index + 1}`;
          const existingImage = getImageElement(slideNumber, imageId);

          if (!existingImage) {
            console.log(`🖼️ Adding image ${imageId}:`, imageSrc);
            addImageElement(slideNumber, imageId, {
              src: imageSrc,
              position: { x: 50 + index * 20, y: 50 + index * 20 },
              width: 200,
              height: 150,
            });
          } else {
            // Обновляем src если изменился
            if (existingImage.src !== imageSrc) {
              console.log(`🖼️ Updating image ${imageId}:`, imageSrc);
              updateImageElement(slideNumber, imageId, {
                ...existingImage,
                src: imageSrc,
              });
            }
          }
        });
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
          slideNumbers: [slideNumber],
        });

        console.log(
          `✅ Proto005Template: Render completed for slide ${slideNumber}`,
          result
        );

        if (result?.renderedSlides?.[slideNumber]) {
          const htmlContent = result.renderedSlides[slideNumber];
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
          // Центрированный заголовок
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "150px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        case "subtitle":
          // Центрированный подзаголовок под заголовком
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "210px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        case "text1-title":
          // Центрированный text1 title
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "270px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        case "text1-content":
          // Центрированный text1 content
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "310px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        case "text2-title":
          // Центрированный text2 title
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "370px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        case "text2-content":
          // Центрированный text2 content
          return {
            position: "absolute",
            left: "60px",
            right: "60px",
            top: "410px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          };
        default:
          return { position: "absolute", left: 0, top: 0 };
      }
    };

    // Если нет данных слайда, показываем плейсхолдеры
    if (!slideData) {
      console.log(
        `⚠️ No slide data found for slide ${slideNumber}, showing placeholders`
      );
      const elements = [];

      // Плейсхолдер для title
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
              className="text-[32px] font-bold cursor-pointer transition-colors text-[#2563EB] text-center w-full"
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
              className="text-[18px] cursor-pointer transition-colors text-gray-600 text-center w-full"
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

      return elements;
    }

    const elements = [];

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
            isSelected={selectedTextElement === `slide-${slideNumber}-title`}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
            onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-title`)}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-[32px] font-bold cursor-pointer transition-colors text-[#2563EB] text-center w-full"
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
              className="text-[18px] cursor-pointer transition-colors text-gray-600 text-center w-full"
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

    // Рендерим text1 если есть
    if (slideData.text1?.t1) {
      const text1TitlePosition = getElementPosition("text1-title");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-text1-title-wrapper`}
          style={text1TitlePosition}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-text1-title`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-text1-title`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-text1-title`)}
            onMoveUp={() =>
              handleTextMoveUp(`slide-${slideNumber}-text1-title`)
            }
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-text1-title`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-text1-title`}
              initialText={slideData.text1.t1}
              className="text-[16px] font-semibold cursor-pointer transition-colors text-center w-full"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text1-title`,
                  slideData.text1.t1,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );
    }

    if (slideData.text1?.t2) {
      const text1ContentPosition = getElementPosition("text1-content");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-text1-content-wrapper`}
          style={text1ContentPosition}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-text1-content`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-text1-content`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-text1-content`)}
            onMoveUp={() =>
              handleTextMoveUp(`slide-${slideNumber}-text1-content`)
            }
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-text1-content`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-text1-content`}
              initialText={slideData.text1.t2}
              className="text-[16px] cursor-pointer transition-colors text-center w-full"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text1-content`,
                  slideData.text1.t2,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );
    }

    if (slideData.text2?.t1) {
      const text2TitlePosition = getElementPosition("text2-title");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-text2-title-wrapper`}
          style={text2TitlePosition}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-text2-title`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-text2-title`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-text2-title`)}
            onMoveUp={() =>
              handleTextMoveUp(`slide-${slideNumber}-text2-title`)
            }
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-text2-title`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-text2-title`}
              initialText={slideData.text2.t1}
              className="text-[16px] font-semibold cursor-pointer transition-colors text-center w-full"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text2-title`,
                  slideData.text2.t1,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      );
    }

    if (slideData.text2?.t2) {
      const text2ContentPosition = getElementPosition("text2-content");
      elements.push(
        <div
          key={`slidedata-${slideNumber}-text2-content-wrapper`}
          style={text2ContentPosition}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-text2-content`}
            isSelected={
              selectedTextElement === `slide-${slideNumber}-text2-content`
            }
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-text2-content`)}
            onMoveUp={() =>
              handleTextMoveUp(`slide-${slideNumber}-text2-content`)
            }
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-text2-content`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-text2-content`}
              initialText={slideData.text2.t2}
              className="text-[16px] cursor-pointer transition-colors text-center w-full"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text2-content`,
                  slideData.text2.t2,
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

  // Render image elements from store - для Proto005Template не показываем интерактивные изображения
  const renderImageElements = () => {
    // Проверяем templateId для специального позиционирования
    let templateId = null;
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const templateIds = generatedPresentation.data?.templateIds;
        templateId = templateIds?.[slideNumber - 1];
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }

    // proto_005 изображения используются как фон, не как интерактивные элементы
    if (templateId === "proto_005") {
      console.log(
        `🎯 Proto005Template: Skipping interactive images - using as background`
      );
      return []; // Пустой массив для proto_005
    }

    // Обычная логика для других шаблонов
    const currentSlideImages = imageElements[slideNumber] || {};
    const currentSlideImageElements = Object.entries(currentSlideImages);

    const elementCount = currentSlideImageElements.length;

    console.log(
      `🎬 [SlideContent] Rendering ${elementCount} images for slide ${slideNumber}:`,
      currentSlideImageElements.map(([id, data]) => ({ id, src: data.src }))
    );

    if (elementCount === 0) {
      console.log(`🎬 [SlideContent] No images found for slide ${slideNumber}`);
      console.log(
        `🎬 [SlideContent] Current slide imageElements:`,
        currentSlideImages
      );
    }

    return currentSlideImageElements
      .map(([elementId, imageData]) => {
        // Проверяем, что imageData существует и имеет необходимые поля
        if (!imageData || !imageData.position) {
          console.warn(
            "❌ [SlideContent] Invalid image data for element:",
            elementId,
            imageData
          );
          return null;
        }

        console.log(`✅ [SlideContent] Rendering image element ${elementId}:`, {
          src: imageData.src,
          position: imageData.position,
          size: { width: imageData.width, height: imageData.height },
        });

        // Всегда показываем изображения как интерактивные элементы
        return (
          <ResizableImageBox
            key={elementId}
            elementId={elementId}
            slideNumber={slideNumber}
            isSelected={selectedImageElement === elementId}
            onDelete={() => {
              deleteImageElement(elementId, slideNumber);
              setSelectedImageElement(null);
            }}
          />
        );
      })
      .filter(Boolean); // Убираем null элементы
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
        {/* Left guide */}
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
        {/* Center vertical guide */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "0px",
            width: "1px",
            height: "100%",
            background:
              "repeating-linear-gradient(to bottom, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
            transform: "translateX(-50%)",
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
        {/* Center horizontal guide */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "0px",
            height: "1px",
            width: "100%",
            background:
              "repeating-linear-gradient(to right, #bba2fe 0px, #bba2fe 4px, transparent 4px, transparent 8px)",
            zIndex: 998,
            transform: "translateY(-50%)",
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
        className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20 pointer-events-none"
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
      setSelectedImageElement(null);
      setSelectedTableElement(null);
      setSelectedInfographicsElement(null);
    }
  };

  // Get background image from slideData
  let backgroundImage = null;
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

      // Получаем фоновое изображение из _images массива
      if (
        slideData?._images &&
        Array.isArray(slideData._images) &&
        slideData._images.length > 0
      ) {
        backgroundImage = slideData._images[0];
      }
    } catch (error) {
      console.error("Error parsing generated presentation:", error);
    }
  }

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        // Fallback gradient
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      };

  return (
    <div
      className="slide-canvas relative w-full h-full overflow-hidden cursor-crosshair"
      style={{
        width: "860px",
        height: "484px",
        ...backgroundStyle,
      }}
      onClick={handleSlideClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* Render slide data elements */}
      {renderSlideDataElements()}

      {/* Render interactive table elements */}
      {renderTableElements()}

      {/* Render interactive image elements */}
      {renderImageElements()}

      {/* Render interactive infographics elements */}
      {renderInfographicsElements()}

      {/* Render alignment guides */}
      {renderAlignmentGuides()}

      {/* Render image area selection */}
      {renderImageAreaSelection()}
    </div>
  );
};
