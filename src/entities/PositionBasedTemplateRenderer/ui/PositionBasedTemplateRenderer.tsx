"use client";

import React, { useEffect, useRef, useState } from "react";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

export interface PositionBasedTemplateRendererProps {
  html: string;
  templateId: string;
  slideNumber: number;
  slideData: any;
  className?: string;
}

interface ElementPosition {
  id: string;
  type: "text" | "image";
  field: string; // поле в slideData (title, subtitle, text1.t1, etc.)
  content: string;
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export const PositionBasedTemplateRenderer: React.FC<
  PositionBasedTemplateRendererProps
> = ({ html, templateId, slideNumber, slideData, className = "" }) => {
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const [elementPositions, setElementPositions] = useState<ElementPosition[]>(
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

  // Мапинг плейсхолдеров к полям данных
  const placeholderMap = {
    "{{title}}": { field: "title", content: slideData?.title },
    "{{subtitle}}": { field: "subtitle", content: slideData?.subtitle },
    "{{text1_title}}": { field: "text1.t1", content: slideData?.text1?.t1 },
    "{{text1_content}}": { field: "text1.t2", content: slideData?.text1?.t2 },
    "{{text2_title}}": { field: "text2.t1", content: slideData?.text2?.t1 },
    "{{text2_content}}": { field: "text2.t2", content: slideData?.text2?.t2 },
    "{{text3_title}}": { field: "text3.t1", content: slideData?.text3?.t1 },
    "{{text3_content}}": { field: "text3.t2", content: slideData?.text3?.t2 },
    "{{image}}": { field: "_images.0", content: slideData?._images?.[0] },
  };

  // Функция для извлечения позиций из HTML
  const extractElementPositions = () => {
    if (!hiddenContainerRef.current) return;

    const container = hiddenContainerRef.current;
    const positions: ElementPosition[] = [];

    // Временно рендерим HTML с плейсхолдерами для измерения позиций
    container.innerHTML = html;

    // Получаем размеры контейнера для нормализации координат
    const containerRect = container.getBoundingClientRect();

    // Ищем все текстовые узлы с плейсхолдерами
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const textContent = textNode.textContent || "";
      const parentElement = textNode.parentElement;

      if (!parentElement) continue;

      // Проверяем каждый плейсхолдер
      Object.entries(placeholderMap).forEach(([placeholder, data]) => {
        if (textContent.includes(placeholder) && data.content) {
          const rect = parentElement.getBoundingClientRect();

          // Нормализуем координаты относительно контейнера слайда
          const normalizedPosition = {
            left:
              ((rect.left - containerRect.left) / containerRect.width) * 759, // 759px - ширина слайда
            top: ((rect.top - containerRect.top) / containerRect.height) * 427, // 427px - высота слайда
            width: (rect.width / containerRect.width) * 759,
            height: (rect.height / containerRect.height) * 427,
          };

          const elementId = `template-${slideNumber}-${data.field.replace(
            ".",
            "_"
          )}`;

          positions.push({
            id: elementId,
            type: placeholder === "{{image}}" ? "image" : "text",
            field: data.field,
            content: data.content,
            position: normalizedPosition,
          });

          console.log(
            `📍 Found ${placeholder} at position:`,
            normalizedPosition
          );
        }
      });
    }

    // Ищем изображения
    const images = container.querySelectorAll(
      'img, [style*="background-image"]'
    );
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const imageUrl = slideData?._images?.[index];

      if (imageUrl) {
        const normalizedPosition = {
          left: ((rect.left - containerRect.left) / containerRect.width) * 759,
          top: ((rect.top - containerRect.top) / containerRect.height) * 427,
          width: (rect.width / containerRect.width) * 759,
          height: (rect.height / containerRect.height) * 427,
        };

        const elementId = `template-${slideNumber}-image_${index}`;

        positions.push({
          id: elementId,
          type: "image",
          field: `_images.${index}`,
          content: imageUrl,
          position: normalizedPosition,
        });

        console.log(`📍 Found image ${index} at position:`, normalizedPosition);
      }
    });

    // Очищаем контейнер после измерения
    container.innerHTML = "";

    setElementPositions(positions);
    setIsInitialized(true);
  };

  // Инициализация позиций
  useEffect(() => {
    if (html && slideData) {
      setTimeout(extractElementPositions, 100);
    }
  }, [html, slideData]);

  // Обработчик изменения текста
  const handleTextChange = (elementId: string, newText: string) => {
    setTextElementContent(elementId, newText);

    // Обновляем данные в localStorage
    const element = elementPositions.find((el) => el.id === elementId);
    if (element) {
      updateSlideDataInStorage(element.field, newText);
    }
  };

  // Функция для обновления данных в localStorage
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

      // Парсим путь поля (например, "text1.t2" или "_images.0")
      const fieldParts = field.split(".");

      if (fieldParts.length === 1) {
        slideData[field] = value;
      } else if (fieldParts.length === 2) {
        const [mainField, subField] = fieldParts;

        if (mainField === "_images") {
          if (!slideData._images) slideData._images = [];
          slideData._images[parseInt(subField)] = value;
        } else {
          if (!slideData[mainField]) slideData[mainField] = {};
          slideData[mainField][subField] = value;
        }
      }

      localStorage.setItem(
        "generatedPresentation",
        JSON.stringify(generatedPresentation)
      );
      console.log(`✅ Updated ${field} for slide ${slideNumber}:`, value);
    } catch (error) {
      console.error("❌ Error updating slide data:", error);
    }
  };

  return (
    <div
      className={`position-based-template-renderer ${className}`}
      style={{ position: "relative" }}
    >
      {/* Скрытый контейнер для измерения позиций HTML */}
      <div
        ref={hiddenContainerRef}
        style={{
          position: "absolute",
          top: -9999,
          left: -9999,
          width: "759px",
          height: "427px",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />

      {/* Фон слайда */}
      <div
        className="slide-background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
        }}
      />

      {/* Редактируемые элементы */}
      {isInitialized &&
        elementPositions.map((element) => {
          if (element.type === "text") {
            const currentContent =
              getTextElementContent(element.id) || element.content;
            const currentStyle = getTextElementStyle(element.id);

            return (
              <div
                key={element.id}
                style={{
                  position: "absolute",
                  left: element.position.left,
                  top: element.position.top,
                  width: element.position.width,
                  height: element.position.height,
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
                      width: "100%",
                      height: "100%",
                      padding: "8px",
                      cursor: "text",
                      outline: "none",
                      border:
                        selectedTextElement === element.id
                          ? "2px solid #4F46E5"
                          : "1px solid transparent",
                      borderRadius: "4px",
                      backgroundColor:
                        selectedTextElement === element.id
                          ? "rgba(255, 255, 255, 0.95)"
                          : "transparent",
                      color: currentStyle?.color || "#FFFFFF",
                      fontSize: `${currentStyle?.fontSize || 16}px`,
                      fontWeight: currentStyle?.fontWeight || "normal",
                      textAlign: currentStyle?.textAlign || "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: element.field.includes("title")
                        ? "center"
                        : "flex-start",
                      transition: "all 0.2s ease",
                    }}
                    contentEditable={selectedTextElement === element.id}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newText = e.target.textContent || "";
                      if (newText !== currentContent) {
                        handleTextChange(element.id, newText);
                      }
                    }}
                    onFocus={() => setSelectedTextElement(element.id)}
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
                  left: element.position.left,
                  top: element.position.top,
                  width: element.position.width,
                  height: element.position.height,
                  zIndex: 1000,
                }}
              >
                <ResizableImageBox
                  elementId={element.id}
                  isSelected={selectedImageElement === element.id}
                  onDelete={() => setSelectedImageElement(null)}
                />

                {/* Отображаем изображение */}
                <img
                  src={element.content}
                  alt="Slide image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      selectedImageElement === element.id
                        ? "2px solid #4F46E5"
                        : "1px solid transparent",
                  }}
                  onClick={() => setSelectedImageElement(element.id)}
                />
              </div>
            );
          }

          return null;
        })}

      {/* Подсказка */}
      {isInitialized && (
        <div
          className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-70 hover:opacity-100 transition-opacity"
          style={{ zIndex: 2000, pointerEvents: "none" }}
        >
          Элементы: {elementPositions.length} найдено
        </div>
      )}
    </div>
  );
};
