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

export const SlideContent = ({
  slideNumber,
  slideType = "default",
}: SlideContentProps) => {
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
    // Template state
    slideTemplates,
  } = usePresentationStore();

  // Get image area selection for current slide
  const imageAreaSelection = getImageAreaSelection(slideNumber);

  // Функция для замены изображений в HTML шаблоне на наши изображения
  // Функция для обработки изменений текста в шаблоне
  const handleTemplateTextChange = (field: string, value: string) => {
    console.log(`📝 Template text changed - field: ${field}, value: ${value}`);

    // Получаем текущие данные презентации
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (!generatedPresentationStr) return;

    try {
      const generatedPresentation = JSON.parse(generatedPresentationStr);
      const slides = generatedPresentation.data?.slides;

      if (!slides || !slides[slideNumber - 1]) return;

      const slideData = slides[slideNumber - 1];

      // Обновляем соответствующее поле
      switch (field) {
        case "title":
          slideData.title = value;
          break;
        case "subtitle":
          slideData.subtitle = value;
          break;
        case "text1_title":
          if (!slideData.text1) slideData.text1 = {};
          slideData.text1.t1 = value;
          break;
        case "text1_content":
          if (!slideData.text1) slideData.text1 = {};
          slideData.text1.t2 = value;
          break;
        case "text2_title":
          if (!slideData.text2) slideData.text2 = {};
          slideData.text2.t1 = value;
          break;
        case "text2_content":
          if (!slideData.text2) slideData.text2 = {};
          slideData.text2.t2 = value;
          break;
        case "text3_title":
          if (!slideData.text3) slideData.text3 = {};
          slideData.text3.t1 = value;
          break;
        case "text3_content":
          if (!slideData.text3) slideData.text3 = {};
          slideData.text3.t2 = value;
          break;
      }

      // Сохраняем обновленные данные
      localStorage.setItem(
        "generatedPresentation",
        JSON.stringify(generatedPresentation)
      );

      // Обновляем кэш рендера
      setRenderedSlides((prev) => {
        const newSlides = { ...prev };
        delete newSlides[slideNumber]; // Удаляем кэш, чтобы перерендерить
        return newSlides;
      });

      // Форсируем перерендеринг
      setRenderedHtml(null);

      console.log(`✅ Updated ${field} for slide ${slideNumber}`);
    } catch (error) {
      console.error("❌ Error updating template text:", error);
    }
  };

  const replaceTemplateImagesWithOurs = (html: string): string => {
    if (!html) {
      console.log("🖼️ No HTML provided for image replacement");
      return html;
    }

    const generatedPresentation = localStorage.getItem("generatedPresentation");
    if (!generatedPresentation) {
      console.log("🖼️ No generated presentation found for image replacement");
      return html;
    }

    try {
      const presentationData = JSON.parse(generatedPresentation);
      const slides = presentationData.data?.slides;

      if (!slides || !slides[slideNumber - 1]) {
        console.log(`🖼️ No slide data found for slide ${slideNumber}`);
        return html;
      }

      const slideData = slides[slideNumber - 1];
      const slideImages = slideData._images;

      if (!slideImages || slideImages.length === 0) {
        console.log(`🖼️ No images found for slide ${slideNumber}`);
        return html;
      }

      let modifiedHtml = html;

      // Заменяем изображения в HTML
      slideImages.forEach((imageUrl: string, index: number) => {
        console.log(
          `🖼️ [Preview] Replaced template image ${index} with our image:`,
          imageUrl
        );

        // Заменяем различные паттерны изображений в HTML
        const imgPatterns = [
          /src="[^"]*\.(jpg|jpeg|png|gif|webp|svg)[^"]*"/gi,
          /background-image:\s*url\(['"]?[^'"]*\.(jpg|jpeg|png|gif|webp|svg)[^'"]*['"]?\)/gi,
        ];

        imgPatterns.forEach((pattern) => {
          if (index === 0) {
            // Заменяем только первое найденное изображение
            modifiedHtml = modifiedHtml.replace(pattern, (match) => {
              if (match.includes("src=")) {
                return `src="${imageUrl}"`;
              } else {
                return `background-image: url('${imageUrl}')`;
              }
            });
          }
        });
      });

      return modifiedHtml;
    } catch (error) {
      console.error("🖼️ Error replacing images:", error);
      return html;
    }
  };

  // Функция для инициализации содержимого элементов из данных слайда
  const initializeElementContents = React.useCallback(
    (slideData: any) => {
      console.log(
        "🎯 [SlideContent] Initializing element contents for slide",
        slideNumber,
        slideData
      );

      // Функция для безопасной установки содержимого элемента
      const safeSetContent = (elementId: string, content: string) => {
        const existingContent = getTextElementContent(elementId);
        if (!existingContent || existingContent === "New text element") {
          setTextElementContent(elementId, content);
          console.log(`Set content: ${content} for ${elementId}`);
        } else {
          console.log(
            `Skipped setting content for ${elementId} - already has content: ${existingContent}`
          );
        }
      };

      // Инициализируем базовые элементы слайда только если их содержимое еще не установлено
      if (slideData.title) {
        const titleElementId = `slide-${slideNumber}-title`;
        safeSetContent(titleElementId, slideData.title);
      }

      if (slideData.subtitle) {
        const subtitleElementId = `slide-${slideNumber}-subtitle`;
        safeSetContent(subtitleElementId, slideData.subtitle);
      }

      // Инициализируем text1 элементы
      if (slideData.text1) {
        if (slideData.text1.t1) {
          const text1TitleId = `slide-${slideNumber}-text1-title`;
          safeSetContent(text1TitleId, slideData.text1.t1);
        }
        if (slideData.text1.t2) {
          const text1ContentId = `slide-${slideNumber}-text1-content`;
          safeSetContent(text1ContentId, slideData.text1.t2);
        }
      }

      // Инициализируем text2 элементы
      if (slideData.text2) {
        if (slideData.text2.t1) {
          const text2TitleId = `slide-${slideNumber}-text2-title`;
          safeSetContent(text2TitleId, slideData.text2.t1);
        }
        if (slideData.text2.t2) {
          const text2ContentId = `slide-${slideNumber}-text2-content`;
          safeSetContent(text2ContentId, slideData.text2.t2);
        }
      }

      // Инициализируем text3 элементы
      if (slideData.text3) {
        if (slideData.text3.t1) {
          const text3TitleId = `slide-${slideNumber}-text3-title`;
          safeSetContent(text3TitleId, slideData.text3.t1);
        }
        if (slideData.text3.t2) {
          const text3ContentId = `slide-${slideNumber}-text3-content`;
          safeSetContent(text3ContentId, slideData.text3.t2);
        }
      }

      // Инициализируем изображения
      if (slideData._images && Array.isArray(slideData._images)) {
        slideData._images.forEach((imageSrc: string, index: number) => {
          const imageElementId = `slide-${slideNumber}-image-${index}`;
          const existingImage = getImageElement(imageElementId);

          if (!existingImage && imageSrc) {
            // Добавляем изображение в store если его еще нет
            const defaultPosition = {
              x: 100 + index * 50, // Смещаем каждое следующее изображение
              y: 100 + index * 50,
            };
            const defaultSize = { width: 200, height: 150 };

            const newElementId = addImageElement(
              slideNumber,
              defaultPosition,
              defaultSize
            );
            // Обновляем изображение с правильным src
            updateImageElement(newElementId, {
              src: imageSrc,
              alt: `Image ${index + 1}`,
              placeholder: false,
            });
            console.log(`Added image ${imageSrc} as element ${newElementId}`);
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

      // Инициализируем содержимое элементов даже при использовании кешированного HTML
      const generatedPresentationStr = localStorage.getItem(
        "generatedPresentation"
      );
      if (generatedPresentationStr) {
        try {
          const generatedPresentation = JSON.parse(generatedPresentationStr);
          const slides = generatedPresentation.data?.slides;
          const currentSlideData = slides?.[slideNumber - 1];
          if (currentSlideData) {
            initializeElementContents(currentSlideData);
          }
        } catch (error) {
          console.error("Error initializing cached slide contents:", error);
        }
      }
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

          // Инициализируем содержимое элементов из данных слайда
          const currentSlideData = slides[slideNumber - 1];
          if (currentSlideData) {
            initializeElementContents(currentSlideData);
          }
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
  // Рендер интерактивных элементов с данными слайда
  const renderSlideDataElements = () => {
    // Получаем данные слайда из localStorage
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

    const elements = [];

    // Рендерим элементы из slideData если есть
    if (slideData) {
      // Рендерим title если есть
      if (slideData.title) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-title`}
            elementId={`slide-${slideNumber}-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-title`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
            onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-title`)}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-[32px] font-bold cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-title`,
                  slideData.title,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }

      // Рендерим subtitle если есть
      if (slideData.subtitle) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-subtitle`}
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
              className="text-[24px] font-medium cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-subtitle`,
                  slideData.subtitle,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }

      // Рендерим text1 если есть
      if (slideData.text1?.t1) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-text1-title`}
            elementId={`slide-${slideNumber}-text1-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-text1-title`
            )}
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
              className="text-[20px] font-semibold cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text1-title`,
                  slideData.text1.t1,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }

      if (slideData.text1?.t2) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-text1-content`}
            elementId={`slide-${slideNumber}-text1-content`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-text1-content`
            )}
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
              className="text-[16px] cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text1-content`,
                  slideData.text1.t2,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }

      // Аналогично для text2 и text3
      if (slideData.text2?.t1) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-text2-title`}
            elementId={`slide-${slideNumber}-text2-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-text2-title`
            )}
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
              className="text-[20px] font-semibold cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text2-title`,
                  slideData.text2.t1,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }

      if (slideData.text2?.t2) {
        elements.push(
          <ResizableTextBox
            key={`slidedata-${slideNumber}-text2-content`}
            elementId={`slide-${slideNumber}-text2-content`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-text2-content`
            )}
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
              className="text-[16px] cursor-pointer transition-colors"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-text2-content`,
                  slideData.text2.t2,
                  e
                );
              }}
            />
          </ResizableTextBox>
        );
      }
    } // Закрывающая скобка для if (slideData)

    // Также рендерим пользовательские элементы из store
    const userElements = Object.entries(textElementStyles)
      .filter(([elementId]) => elementId.includes(`slide-${slideNumber}-`))
      .map(([elementId, style]) => {
        const content = textElementContents[elementId] || "New text element";
        return (
          <ResizableTextBox
            key={`user-${elementId}`}
            elementId={elementId}
            isSelected={selectedTextElements.includes(elementId)}
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

    return [...elements, ...userElements];
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

    console.log(
      `🎬 Rendering images for slide ${slideNumber}:`,
      currentSlideElements
    );
    console.log(`🎬 All imageElements:`, imageElements);

    return Object.entries(currentSlideElements)
      .map(([elementId, imageData]) => {
        // Проверяем, что imageData существует и имеет необходимые поля
        if (!imageData || !imageData.position) {
          console.warn("Invalid image data for element:", elementId, imageData);
          return null;
        }

        // Всегда показываем изображения как интерактивные элементы
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
          {/* Только интерактивные элементы */}
          <div
            className="interactive-layer absolute inset-0"
            style={{ zIndex: 10 }}
          >
            {/* Интерактивные текстовые элементы с данными слайда */}
            {renderSlideDataElements()}
            {/* Другие интерактивные элементы (таблицы, изображения, инфографика) */}
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

      // Используем чистый HTML шаблон без заполнения данными
      // Данные будут рендериться отдельными интерактивными компонентами поверх шаблона
      let templateHtml = slideTemplates[slideTemplateKey];
      console.log("Using template HTML as background layout only");
      console.log("Template preview:", templateHtml.substring(0, 200) + "...");

      // Убираем плейсхолдеры из шаблона, чтобы оставить только дизайн/фон
      templateHtml = templateHtml
        .replace(/\{\{[^}]+\}\}/g, "") // Убираем все плейсхолдеры {{...}}
        .replace(/<[^>]*>\s*<\/[^>]*>/g, ""); // Убираем пустые теги

      console.log("Final template HTML length:", templateHtml.length);
      console.log(
        "Template HTML preview:",
        templateHtml.substring(0, 500) + "..."
      );

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
          {/* Только интерактивные элементы */}
          <div
            className="interactive-layer absolute inset-0"
            style={{ zIndex: 10 }}
          >
            {/* Интерактивные текстовые элементы с данными слайда */}
            {renderSlideDataElements()}
            {/* Другие интерактивные элементы (таблицы, изображения, инфографика) */}
            {renderTableElements()}
            {renderImageElements()}
            {renderInfographicsElements()}
            {renderAlignmentGuides()}
            {renderImageAreaSelection()}
          </div>
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
              key="user-title-main"
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
              key="user-title-sub"
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
              key={`user-slide-${slideNumber}-title`}
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
