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

export const Proto004Template = ({
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
  const initializedSlidesRef = React.useRef<Set<number>>(new Set());
  const [slideData, setSlideData] = React.useState<any>(null);

  // Предотвращаем hydration errors
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Загружаем данные слайда как в Proto003Template
  React.useEffect(() => {
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const currentSlideData =
          generatedPresentation.data?.slides?.[slideNumber - 1];
        setSlideData(currentSlideData);
        console.log(
          `🎨 Proto004Template - Loaded slide ${slideNumber}:`,
          currentSlideData
        );
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }
  }, [slideNumber]);

  // Принудительно создаём изображение в store для работы ResizableImageBox как в Proto003Template
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto004-image`;
    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto004Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto004 image: ${elementId}`);
    console.log(`Current slideData:`, slideData);
    console.log(`Image URL:`, imageUrl);

    // ПРИНУДИТЕЛЬНО создаем изображение с src из slideData
    if (imageUrl) {
      console.log(`🚀 Creating image element in store...`);
      usePresentationStore.setState((state: any) => {
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
                position: { x: 0, y: 0 }, // Позиция для верхней половины слайда
                width: 759, // Вся ширина слайда
                height: 230, // Половина высоты слайда (405/2)
                placeholder: false,
                alt: "Proto004 Background Image",
                zIndex: 1,
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
      console.log(`✅ FORCE created proto004 image in store: ${elementId}`);
    } else {
      console.log(`❌ No image URL found for slide ${slideNumber}`);
    }

    // Проверим, что изображение создалось
    setTimeout(() => {
      console.log(`🔍 Verification phase - checking created image...`);
      const createdImage = getImageElement(elementId, slideNumber);
      console.log(`🔍 getImageElement result:`, createdImage);

      // Проверим весь store
      const allImages = usePresentationStore.getState().imageElements;
      console.log(`📦 Full store state:`, allImages);
      console.log(`📦 Current slide images:`, allImages[slideNumber]);
      console.log(
        `📦 Images for slide ${slideNumber}:`,
        allImages[slideNumber]
      );
      console.log(
        `📦 Specific image ${elementId}:`,
        allImages[slideNumber]?.[elementId]
      );

      console.log(
        `🎯 ResizableImageBox should now find: ${elementId} on slide ${slideNumber}`
      );

      if (!createdImage) {
        console.error(`❌ CRITICAL: Image not found after creation!`);
      } else {
        console.log(`✅ SUCCESS: Image found after creation!`);
      }
    }, 100);
  }, [slideNumber, slideData]);

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

      // Инициализируем изображения - ВСЕГДА проверяем и восстанавливаем
      if (slideData._images && Array.isArray(slideData._images)) {
        console.log(
          `🖼️ [SlideContent] Processing ${slideData._images.length} images for slide ${slideNumber}:`,
          slideData._images
        );

        slideData._images.forEach((imageSrc: string, index: number) => {
          // Получаем все изображения для данного слайда
          const store = usePresentationStore.getState();
          const slideImages = store.imageElements[slideNumber] || {};

          // Ищем изображение с таким же src или по индексу
          let existingImageId = null;
          let existingImage = null;

          // Сначала пробуем найти по src
          for (const [id, img] of Object.entries(slideImages)) {
            if (img.src === imageSrc) {
              existingImageId = id;
              existingImage = img;
              break;
            }
          }

          // Если не нашли по src, берем по индексу (если есть)
          if (!existingImage) {
            const imageIds = Object.keys(slideImages);
            if (imageIds[index]) {
              existingImageId = imageIds[index];
              existingImage = slideImages[existingImageId];
            }
          }

          console.log(
            `🖼️ [SlideContent] Processing image ${index} for slide ${slideNumber}:`,
            {
              imageSrc,
              existingImageId,
              existingImage: !!existingImage,
              existingSrc: existingImage?.src,
              needsUpdate: !existingImage || existingImage.src !== imageSrc,
            }
          );

          // Создаем или обновляем изображение
          if (!existingImage) {
            // Создаем новое изображение с позиционированием для Proto004Template
            const defaultPosition = {
              x: 0, // Начинаем с левого края
              y: 0, // Начинаем с верхнего края
            };
            const defaultSize = {
              width: 759, // Полная ширина слайда
              height: 202, // Половина высоты слайда (405/2)
            };

            const newElementId = addImageElement(
              slideNumber,
              defaultPosition,
              defaultSize
            );
            // Обновляем изображение с правильным src
            updateImageElement(newElementId, slideNumber, {
              src: imageSrc,
              alt: `Slide ${slideNumber} Image ${index + 1}`,
              placeholder: false,
            });
            console.log(
              `✅ [SlideContent] Created new image ${imageSrc} as element ${newElementId} for slide ${slideNumber}`
            );
          } else if (existingImage.src !== imageSrc) {
            // Обновляем существующий элемент с новым src
            updateImageElement(existingImageId!, slideNumber, {
              src: imageSrc,
              alt: `Slide ${slideNumber} Image ${index + 1}`,
              placeholder: false,
            });
            console.log(
              `✅ [SlideContent] Updated existing image ${existingImageId} with new src ${imageSrc} for slide ${slideNumber}`
            );
          } else {
            console.log(
              `⏭️ [SlideContent] Image ${existingImageId} is up to date for slide ${slideNumber}, src: ${imageSrc}`
            );
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
    if (!isMounted) return;
    console.log(`🔄 [SlideContent] Switched to slide ${slideNumber}`);
  }, [slideNumber, isMounted]);

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

  // Эффект для инициализации элементов слайда при переключении
  React.useEffect(() => {
    // Ждем клиентского рендеринга для предотвращения hydration errors
    if (!isMounted) {
      return;
    }

    // ВСЕГДА проверяем и инициализируем изображения для слайда
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const slides = generatedPresentation.data?.slides;
        const currentSlideData = slides?.[slideNumber - 1];
        if (currentSlideData) {
          // Проверяем количество изображений в store vs в данных
          const store = usePresentationStore.getState();
          const currentImageElements = store.imageElements[slideNumber] || {};
          const expectedImages = currentSlideData._images || [];
          const actualImageCount = Object.keys(currentImageElements).length;
          const expectedImageCount = expectedImages.length;

          console.log(`🎯 [SlideContent] Slide ${slideNumber} image check:`, {
            expected: expectedImageCount,
            actual: actualImageCount,
            hasImages: expectedImages.length > 0,
          });

          // Проверяем, есть ли изображения с правильными src
          let needsImageInit = false;
          if (expectedImageCount > 0) {
            if (actualImageCount === 0) {
              needsImageInit = true;
            } else {
              // Проверяем, совпадают ли src изображений
              const currentImages = Object.values(currentImageElements);
              const expectedSrcs = expectedImages;
              const actualSrcs = currentImages
                .map((img) => img.src)
                .filter(Boolean);

              const srcMismatch = expectedSrcs.some(
                (expectedSrc: string) => !actualSrcs.includes(expectedSrc)
              );

              if (srcMismatch || expectedImageCount !== actualImageCount) {
                needsImageInit = true;
              }
            }
          }

          if (needsImageInit) {
            console.log(
              `🎯 [SlideContent] Force initializing images for slide ${slideNumber}`
            );
            initializeElementContents(currentSlideData);
          }
          // Для текстовых элементов используем флаг инициализации
          else if (!initializedSlidesRef.current.has(slideNumber)) {
            console.log(
              `🎯 [SlideContent] Initializing text elements for slide ${slideNumber}`
            );
            initializeElementContents(currentSlideData);
            initializedSlidesRef.current.add(slideNumber);
          }
        }
      } catch (error) {
        console.error("Error initializing slide elements:", error);
      }
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
        // Для Proto004Template размещаем текст в нижней половине слайда
        initializeElementPosition(`slide-${slideNumber}-title`, 40, 220);
        initializeElementPosition(`slide-${slideNumber}-subtitle`, 40, 260);

        // Initialize text1 elements (both object and string formats)
        initializeElementPosition(`slide-${slideNumber}-text1-title`, 40, 300);
        initializeElementPosition(
          `slide-${slideNumber}-text1-content`,
          40,
          330
        );
        initializeElementPosition(`slide-${slideNumber}-text1`, 40, 300);

        // Initialize text2 elements (both object and string formats)
        initializeElementPosition(`slide-${slideNumber}-text2-title`, 300, 300);
        initializeElementPosition(
          `slide-${slideNumber}-text2-content`,
          300,
          330
        );
        initializeElementPosition(`slide-${slideNumber}-text2`, 300, 300);

        // Initialize text3 elements
        initializeElementPosition(`slide-${slideNumber}-text3-title`, 500, 300);
        initializeElementPosition(
          `slide-${slideNumber}-text3-content`,
          500,
          330
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
        console.log("🔄 Undo triggered");
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if (
        (e.ctrlKey && e.shiftKey && e.key === "Z") ||
        (e.ctrlKey && e.key === "y")
      ) {
        e.preventDefault();
        store.redo();
        console.log("🔄 Redo triggered");
        return;
      }

      // Ctrl+C - Copy selected element
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();

        if (selectedTextElement) {
          store.copyElementToClipboard(
            "text",
            selectedTextElement,
            slideNumber
          );
        } else if (selectedImageElement) {
          store.copyElementToClipboard(
            "image",
            selectedImageElement,
            slideNumber
          );
        } else if (selectedTableElement) {
          store.copyElementToClipboard(
            "table",
            selectedTableElement,
            slideNumber
          );
        } else if (selectedInfographicsElement) {
          store.copyElementToClipboard(
            "infographics",
            selectedInfographicsElement,
            slideNumber
          );
        }
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
        } else if (selectedImageElement) {
          console.log("Deleting image element:", selectedImageElement);
          deleteImageElement(selectedImageElement, slideNumber);
          setSelectedImageElement(null);
        } else if (selectedTableElement) {
          deleteTableElement(selectedTableElement);
          setSelectedTableElement(null);
        } else if (selectedInfographicsElement) {
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
      `🎨 Proto004Template - Slide ${slideNumber}, templateId: ${templateId}`,
      { slideData }
    );

    const getElementPosition = (elementType: string): React.CSSProperties => {
      switch (elementType) {
        case "title":
          // Центрированный заголовок в белой области (нижняя половина)
          return {
            position: "absolute",
            left: "540px",
            top: "220px", // В нижней половине (405/2 + отступ)
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "680px", // Почти вся ширина с отступами
          };
        case "subtitle":
          return {
            position: "absolute",
            left: "450px",
            top: "260px", // Ниже заголовка
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "680px", // Почти вся ширина с отступами
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

  const renderImageElements = () => {
    const imageElementId = `slide-${slideNumber}-proto004-image`;
    const storeImage = getImageElement(imageElementId, slideNumber);

    console.log(`� About to render ResizableImageBox:`, {
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

  // Render image area selection как в Proto003Template
  const renderImageAreaSelection = () => {
    if (!isImageAreaSelectionMode || !imageAreaSelection) return null;

    return (
      <div
        style={{
          position: "absolute",
          left: imageAreaSelection.startX,
          top: imageAreaSelection.startY,
          width: Math.abs(imageAreaSelection.endX - imageAreaSelection.startX),
          height: Math.abs(imageAreaSelection.endY - imageAreaSelection.startY),
          border: "2px dashed #007acc",
          backgroundColor: "rgba(0, 122, 204, 0.1)",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />
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
          className="slide-container mx-auto w-[759px] h-[405px] bg-white rounded-[12px] overflow-hidden flex items-center justify-center"
          style={{ position: "relative" }}
        >
          <div className="text-gray-500">Загрузка...</div>
        </div>
      );
    }

    // Проверяем наличие данных слайда как в Proto003Template
    if (!slideData) {
      return (
        <div className="relative w-[759px] h-[405px] bg-white rounded-lg shadow-lg">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Нет данных для слайда
          </div>
        </div>
      );
    }

    console.log(`🎯 [Proto004Template] Render for slide ${slideNumber}`);

    return (
      <div
        className={`relative w-[759px] h-[427px] bg-white rounded-lg shadow-lg overflow-hidden ${
          isImageAreaSelectionMode ? "cursor-crosshair" : ""
        }`}
        onClick={handleSlideClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Изображение на весь слайд через ResizableImageBox */}
        {renderImageElements()}

        {/* Текстовые элементы */}
        {renderSlideDataElements()}

        {/* Другие элементы */}
        {renderTableElements()}
        {renderInfographicsElements()}
        {renderAlignmentGuides()}
        {renderImageAreaSelection()}
      </div>
    );
  };

  return renderSlideByType();
};

export const getSlideType = (slideNumber: number): "title" | "default" => {
  if (slideNumber === 1) return "title";
  return "default";
};
