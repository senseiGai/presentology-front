"use client";

import React, { useEffect, useRef, useState } from "react";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

export interface InteractiveTemplateRendererProps {
  html: string;
  templateId: string;
  slideNumber: number;
  slideData: any;
  className?: string;
}

interface EditableElement {
  id: string;
  type: "text" | "image";
  content: string;
  field: string; // поле в slideData (title, subtitle, text1_t1, etc.)
  element: HTMLElement;
  bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  styles: {
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    color: string;
    textAlign: string;
    lineHeight: string;
  };
}

export const InteractiveTemplateRenderer: React.FC<
  InteractiveTemplateRendererProps
> = ({ html, templateId, slideNumber, slideData, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editableElements, setEditableElements] = useState<EditableElement[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    selectedTextElement,
    setSelectedTextElement,
    selectedImageElement,
    setSelectedImageElement,
    updateTextElementStyle,
    setTextElementContent,
    getTextElementContent,
    getTextElementStyle,
  } = usePresentationStore();

  // Функция для создания уникального ID элемента
  const createElementId = (field: string, type: "text" | "image") => {
    return `template-${slideNumber}-${field}-${type}`;
  };

  // Функция для парсинга HTML и поиска редактируемых элементов
  const parseEditableElements = () => {
    if (!containerRef.current || !slideData) return;

    const container = containerRef.current;
    const elements: EditableElement[] = [];

    // Получаем контейнер с HTML
    const htmlContainer = container.querySelector(".template-html-container");
    if (!htmlContainer) return;

    const containerRect = htmlContainer.getBoundingClientRect();

    // Функция для поиска текста в DOM
    const findTextElement = (searchText: string, field: string) => {
      if (!searchText || searchText.trim() === "") return null;

      const walker = document.createTreeWalker(
        htmlContainer,
        NodeFilter.SHOW_TEXT
      );

      let node;
      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const parentElement = textNode.parentElement;

        if (!parentElement || !textNode.textContent) continue;

        const textContent = textNode.textContent.trim();
        const searchTextTrimmed = searchText.trim();

        if (textContent.includes(searchTextTrimmed) && textContent.length > 0) {
          const rect = parentElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(parentElement);

          return {
            element: parentElement,
            bounds: {
              left: rect.left - containerRect.left,
              top: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            },
            styles: {
              fontSize: computedStyle.fontSize,
              fontFamily: computedStyle.fontFamily,
              fontWeight: computedStyle.fontWeight,
              color: computedStyle.color,
              textAlign: computedStyle.textAlign,
              lineHeight: computedStyle.lineHeight,
            },
          };
        }
      }
      return null;
    };

    // Функция для поиска изображений в DOM
    const findImageElements = () => {
      const images = htmlContainer.querySelectorAll(
        'img, [style*="background-image"]'
      );
      return Array.from(images).map((img, index) => {
        const rect = img.getBoundingClientRect();
        return {
          element: img as HTMLElement,
          bounds: {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          },
          index,
        };
      });
    };

    // Парсим текстовые элементы
    const textFields = [
      { field: "title", content: slideData.title },
      { field: "subtitle", content: slideData.subtitle },
      { field: "text1_t1", content: slideData.text1?.t1 },
      { field: "text1_t2", content: slideData.text1?.t2 },
      { field: "text2_t1", content: slideData.text2?.t1 },
      { field: "text2_t2", content: slideData.text2?.t2 },
      { field: "text3_t1", content: slideData.text3?.t1 },
      { field: "text3_t2", content: slideData.text3?.t2 },
    ];

    textFields.forEach(({ field, content }) => {
      if (content) {
        const found = findTextElement(content, field);
        if (found) {
          const elementId = createElementId(field, "text");

          elements.push({
            id: elementId,
            type: "text",
            content,
            field,
            element: found.element,
            bounds: found.bounds,
            styles: found.styles,
          });

          // Скрываем оригинальный текст
          found.element.style.visibility = "hidden";

          // Регистрируем элемент в store, если его там нет
          if (!getTextElementContent(elementId)) {
            setTextElementContent(elementId, content);

            // Устанавливаем стили
            updateTextElementStyle(elementId, {
              fontSize: parseFloat(found.styles.fontSize),
              fontWeight: found.styles.fontWeight as any,
              color: found.styles.color,
              textAlign: found.styles.textAlign as any,
            });
          }
        }
      }
    });

    // Парсим изображения
    const imageElementsFound = findImageElements();
    if (slideData._images && slideData._images.length > 0) {
      slideData._images.forEach((imageUrl: string, index: number) => {
        const imageElement = imageElementsFound[index];
        if (imageElement) {
          const elementId = createElementId(`image_${index}`, "image");

          elements.push({
            id: elementId,
            type: "image",
            content: imageUrl,
            field: `_images[${index}]`,
            element: imageElement.element,
            bounds: imageElement.bounds,
            styles: {
              fontSize: "",
              fontFamily: "",
              fontWeight: "",
              color: "",
              textAlign: "",
              lineHeight: "",
            },
          });

          // Скрываем оригинальное изображение
          imageElement.element.style.visibility = "hidden";
        }
      });
    }

    setEditableElements(elements);
    setIsInitialized(true);
  };

  // Инициализация элементов после рендеринга HTML
  useEffect(() => {
    const timer = setTimeout(() => {
      parseEditableElements();
    }, 100);

    return () => clearTimeout(timer);
  }, [html, slideData]);

  // Обработчик изменения текста
  const handleTextChange = (elementId: string, newText: string) => {
    setTextElementContent(elementId, newText);

    // Обновляем данные в localStorage
    const element = editableElements.find((el) => el.id === elementId);
    if (element) {
      updateSlideDataInStorage(element.field, newText);
    }
  };

  // Обработчик изменения изображения
  const handleImageChange = (elementId: string, newImageUrl: string) => {
    const element = editableElements.find((el) => el.id === elementId);
    if (element && element.field.startsWith("_images[")) {
      const index = parseInt(element.field.match(/\d+/)?.[0] || "0");
      updateSlideImageInStorage(index, newImageUrl);
    }
  };

  // Функция для обновления данных слайда в localStorage
  const updateSlideDataInStorage = (field: string, value: string) => {
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
      const fieldParts = field.split("_");
      if (fieldParts.length === 1) {
        slideData[field] = value;
      } else if (fieldParts.length === 2) {
        const [mainField, subField] = fieldParts;
        if (!slideData[mainField]) slideData[mainField] = {};
        slideData[mainField][subField] = value;
      }

      // Сохраняем обновленные данные
      localStorage.setItem(
        "generatedPresentation",
        JSON.stringify(generatedPresentation)
      );

      console.log(`✅ Updated ${field} for slide ${slideNumber}:`, value);
    } catch (error) {
      console.error("❌ Error updating slide data:", error);
    }
  };

  // Функция для обновления изображения в localStorage
  const updateSlideImageInStorage = (index: number, imageUrl: string) => {
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (!generatedPresentationStr) return;

    try {
      const generatedPresentation = JSON.parse(generatedPresentationStr);
      const slides = generatedPresentation.data?.slides;

      if (!slides || !slides[slideNumber - 1]) return;

      const slideData = slides[slideNumber - 1];

      if (!slideData._images) slideData._images = [];
      slideData._images[index] = imageUrl;

      // Сохраняем обновленные данные
      localStorage.setItem(
        "generatedPresentation",
        JSON.stringify(generatedPresentation)
      );

      console.log(
        `✅ Updated image ${index} for slide ${slideNumber}:`,
        imageUrl
      );
    } catch (error) {
      console.error("❌ Error updating slide image:", error);
    }
  };

  return (
    <div
      className={`interactive-template-renderer ${className}`}
      style={{ position: "relative" }}
    >
      {/* Базовый HTML шаблон */}
      <div
        ref={containerRef}
        className="template-html-container"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Редактируемые элементы поверх HTML */}
      {isInitialized &&
        editableElements.map((element) => {
          if (element.type === "text") {
            const currentContent =
              getTextElementContent(element.id) || element.content;
            const currentStyle = getTextElementStyle(element.id);

            return (
              <div
                key={element.id}
                style={{
                  position: "absolute",
                  left: element.bounds.left,
                  top: element.bounds.top,
                  width: element.bounds.width,
                  height: element.bounds.height,
                  zIndex: 1000,
                }}
              >
                <ResizableTextBox
                  elementId={element.id}
                  isSelected={selectedTextElement === element.id}
                  onDelete={() => setSelectedTextElement(null)}
                  onCopy={() => {}}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                >
                  <div
                    onClick={() => setSelectedTextElement(element.id)}
                    style={{
                      fontSize:
                        currentStyle?.fontSize ||
                        parseFloat(element.styles.fontSize),
                      fontWeight:
                        currentStyle?.fontWeight || element.styles.fontWeight,
                      color: currentStyle?.color || element.styles.color,
                      textAlign:
                        currentStyle?.textAlign || element.styles.textAlign,
                      width: "100%",
                      height: "100%",
                      padding: "4px",
                      cursor: "text",
                      outline: "none",
                      border: "none",
                      background: "transparent",
                    }}
                    contentEditable={selectedTextElement === element.id}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newText = e.target.textContent || "";
                      if (newText !== currentContent) {
                        handleTextChange(element.id, newText);
                      }
                    }}
                  >
                    {currentContent}
                  </div>
                </ResizableTextBox>
              </div>
            );
          } else if (element.type === "image") {
            return (
              <div
                key={element.id}
                style={{
                  position: "absolute",
                  left: element.bounds.left,
                  top: element.bounds.top,
                  width: element.bounds.width,
                  height: element.bounds.height,
                  zIndex: 1000,
                }}
              >
                <ResizableImageBox
                  id={element.id}
                  src={element.content}
                  isSelected={selectedImageElement === element.id}
                  onSelect={() => setSelectedImageElement(element.id)}
                  onDeselect={() => setSelectedImageElement(null)}
                  onImageChange={(newImageUrl) =>
                    handleImageChange(element.id, newImageUrl)
                  }
                  bounds={{
                    left: element.bounds.left,
                    top: element.bounds.top,
                    width: element.bounds.width,
                    height: element.bounds.height,
                  }}
                />
              </div>
            );
          }

          return null;
        })}
    </div>
  );
};
