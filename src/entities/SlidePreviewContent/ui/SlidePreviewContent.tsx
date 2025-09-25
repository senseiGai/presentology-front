"use client";

import React, { useEffect, useState } from "react";
import PreviewGenerationLoaderIcon from "../../../../public/icons/PreviewGenerationLoaderIcon";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { getSlideType } from "@/entities/SlideContent";

interface SlidePreviewContentProps {
  slideNumber: number;
  isGenerated: boolean;
  isCurrentlyGenerating: boolean;
}

export const SlidePreviewContent: React.FC<SlidePreviewContentProps> = ({
  slideNumber,
  isGenerated,
  isCurrentlyGenerating,
}) => {
  // Состояние для принудительного обновления
  const [forceUpdateCount, forceUpdate] = useState(0);
  // Предотвращение hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Получаем данные из store для отображения реального контента
  const {
    textElementContents,
    textElementStyles,
    textElementPositions,
    tableElements,
    imageElements,
    slideTemplates,
    // Добавляем дополнительные зависимости для отслеживания всех изменений
    selectedTextElement,
    zoomLevel,
  } = usePresentationStore();

  // Предотвращаем hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect для отслеживания изменений
  useEffect(() => {
    if (!isMounted) return; // Ждем клиентского рендеринга

    console.log(
      "SlidePreviewContent useEffect triggered for slide:",
      slideNumber
    );
    forceUpdate((prev) => prev + 1);
  }, [
    isMounted,
    textElementContents,
    textElementPositions,
    textElementStyles,
    tableElements,
    imageElements,
    slideTemplates,
    selectedTextElement,
    slideNumber,
  ]);

  if (!isGenerated && !isCurrentlyGenerating) {
    return (
      <div className="w-full h-full bg-[#F7FAFC] rounded-[4px] flex items-center justify-center">
        <div className="w-6 h-6 bg-[#E2E8F0] rounded-full" />
      </div>
    );
  }

  if (isCurrentlyGenerating) {
    return (
      <div className="w-full h-full bg-white rounded-[4px] flex items-center justify-center relative border-[1px] border-[#F4F4F4]">
        <div className="absolute inset-0 bg-white rounded-[4px]" />
        <PreviewGenerationLoaderIcon className="animate-spin" />
      </div>
    );
  }

  // Функция для замены изображений в HTML шаблоне на наши изображения (аналогично SlideContent)
  const replaceTemplateImagesWithOurs = (html: string): string => {
    if (!html) return html;

    const slideImageElements = imageElements[slideNumber] || {};
    const ourImages = Object.values(slideImageElements);

    if (ourImages.length === 0) {
      return html; // Если нет наших изображений, возвращаем оригинальный HTML
    }

    // Создаем DOM parser для работы с HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");

    // Заменяем изображения в шаблоне на наши
    images.forEach((img, index) => {
      if (index < ourImages.length && ourImages[index].src) {
        img.src = ourImages[index].src;
        if (ourImages[index].alt) {
          img.alt = ourImages[index].alt;
        }
        console.log(
          `🖼️ [Preview] Replaced template image ${index} with our image:`,
          ourImages[index].src
        );
      }
    });

    return doc.documentElement.outerHTML;
  };

  // Получаем тип слайда
  const slideType = getSlideType(slideNumber);

  // Функция для безопасного получения контента элемента
  const getElementContent = (elementId: string, fallback: string = "") => {
    return textElementContents[elementId] || fallback;
  };

  // Функция для получения позиции элемента
  const getElementPosition = (elementId: string) => {
    const position = textElementPositions[elementId] ||
      textElementStyles[elementId] || { x: 0, y: 0 };
    return position;
  };

  // Масштаб для миниатюры (реальные размеры контейнера в SlidePreview)
  const SCALE = 0.18; // Подходящий масштаб для контейнера 140x79
  const PREVIEW_WIDTH = 140; // Реальная ширина контейнера в SlidePreview
  const PREVIEW_HEIGHT = 79; // Реальная высота контейнера в SlidePreview
  const ORIGINAL_WIDTH = 759;
  const ORIGINAL_HEIGHT = 427;

  // Рендер динамических текстовых элементов в миниатюре
  const renderPreviewTextElements = () => {
    const slideType = getSlideType(slideNumber);

    // Определяем статические элементы для каждого типа слайда
    let staticElementIds: string[] = [];

    if (slideType === "title") {
      staticElementIds = ["title-main", "title-sub"];
    } else {
      // Для default слайдов
      staticElementIds = [`slide-${slideNumber}-text`];
    }

    // Используем только элементы, которые реально существуют в textElementContents
    // так как это основной источник истины для существования элементов
    const allElementIds = Object.keys(textElementContents).filter(
      (elementId) => {
        // Включаем статические элементы для соответствующего типа слайда
        if (staticElementIds.includes(elementId)) {
          return true;
        }
        // Включаем динамические элементы этого слайда
        return (
          elementId.includes(`slide-${slideNumber}-`) &&
          !staticElementIds.includes(elementId)
        );
      }
    );

    console.log(
      `Rendering preview text elements for slide ${slideNumber}:`,
      allElementIds
    );

    return allElementIds
      .map((elementId) => {
        const position = getElementPosition(elementId);
        const content = textElementContents[elementId];
        const elementStyles = textElementStyles[elementId] || {};

        // Если контент пустой, не отображаем элемент
        if (!content || content.trim() === "") {
          return null;
        }

        // Масштабируем позицию
        const scaledX = (position.x || 0) * SCALE;
        const scaledY = (position.y || 0) * SCALE;

        // Определяем размер текста в зависимости от элемента и его стилей
        let fontSize = "3px";
        let fontWeight = "normal";
        let color = "#6B7280";

        if (elementId === "title-main") {
          fontSize = "4px";
          fontWeight = "bold";
          color = "white";
        } else if (elementId === "title-sub") {
          fontSize = "2.5px";
          fontWeight = "light";
          color = "rgba(255, 255, 255, 0.8)";
        } else if (elementId === `slide-${slideNumber}-text`) {
          fontSize = "3px";
          color = "#6B7280";
        }

        // Применяем стили из store если они есть
        if (elementStyles.fontSize) {
          // Масштабируем размер шрифта для миниатюры
          const scaledFontSize = Math.max(
            2,
            (elementStyles.fontSize || 18) * SCALE
          );
          fontSize = `${scaledFontSize}px`;
        }

        if (elementStyles.color) {
          color = elementStyles.color;
        }

        if (elementStyles.fontWeight) {
          fontWeight = elementStyles.fontWeight;
        }

        console.log(`Rendering element ${elementId}:`, {
          position,
          content: content.substring(0, 20),
          scaledX,
          scaledY,
          fontSize,
          fontWeight,
          color,
          elementStyles,
        });

        return (
          <div
            key={elementId}
            className="absolute overflow-hidden leading-tight"
            style={{
              left: `${scaledX}px`,
              top: `${scaledY}px`,
              fontSize,
              fontWeight,
              color,
              maxWidth: `${Math.max(10, PREVIEW_WIDTH - scaledX)}px`,
              maxHeight: `${Math.max(10, PREVIEW_HEIGHT - scaledY)}px`,
              transform: `rotate(${elementStyles.rotation || 0}deg)`,
              transformOrigin: "top left",
            }}
          >
            {content.split("\n").map((line, index) => (
              <div key={index} className="truncate">
                {line.length > 25 ? `${line.substring(0, 25)}...` : line}
              </div>
            ))}
          </div>
        );
      })
      .filter(Boolean); // Убираем null элементы
  };

  // Рендер таблиц в миниатюре
  const renderPreviewTableElements = () => {
    const slideTableElements = tableElements[slideNumber] || {};

    return Object.entries(slideTableElements).map(([elementId, tableData]) => {
      const scaledX = (tableData.position?.x || 100) * SCALE;
      const scaledY = (tableData.position?.y || 100) * SCALE;
      const scaledWidth = Math.min(40, 200 * SCALE); // Ограничиваем размер
      const scaledHeight = Math.min(25, 120 * SCALE);

      console.log(`Rendering table ${elementId}:`, {
        originalPosition: tableData.position,
        scaledX,
        scaledY,
        scaledWidth,
        scaledHeight,
      });

      return (
        <div
          key={elementId}
          className="absolute bg-white border border-gray-300 rounded-[1px] overflow-hidden"
          style={{
            left: `${scaledX}px`,
            top: `${scaledY}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          {/* Простая сетка для отображения таблицы */}
          <div
            className="w-full h-full grid gap-[0.5px] p-[1px]"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                tableData.cols,
                3
              )}, 1fr)`,
              gridTemplateRows: `repeat(${Math.min(tableData.rows, 3)}, 1fr)`,
            }}
          >
            {Array.from(
              { length: Math.min(tableData.rows * tableData.cols, 9) },
              (_, index) => {
                const row = Math.floor(index / Math.min(tableData.cols, 3));
                const col = index % Math.min(tableData.cols, 3);
                const cellContent = tableData.cells?.[row]?.[col] || "";

                return (
                  <div
                    key={index}
                    className="bg-gray-50 text-[2px] leading-tight overflow-hidden flex items-center justify-center border-[0.5px] border-gray-200"
                  >
                    {cellContent.length > 3
                      ? cellContent.substring(0, 3)
                      : cellContent}
                  </div>
                );
              }
            )}
          </div>
        </div>
      );
    });
  };

  // Рендер изображений в миниатюре
  const renderPreviewImageElements = () => {
    const slideImageElements = imageElements[slideNumber] || {};

    return Object.entries(slideImageElements)
      .map(([elementId, imageData]) => {
        // Теперь всегда показываем изображения как редактируемые элементы
        const scaledX = (imageData.position?.x || 100) * SCALE;
        const scaledY = (imageData.position?.y || 100) * SCALE;
        const scaledWidth = Math.min(30, (imageData.width || 150) * SCALE);
        const scaledHeight = Math.min(20, (imageData.height || 100) * SCALE);

        console.log(`Rendering image ${elementId}:`, {
          originalPosition: imageData.position,
          originalSize: { width: imageData.width, height: imageData.height },
          scaledX,
          scaledY,
          scaledWidth,
          scaledHeight,
        });

        return (
          <div
            key={elementId}
            className="absolute bg-green-100 border border-green-300 rounded-[1px] flex items-center justify-center"
            style={{
              left: `${scaledX}px`,
              top: `${scaledY}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
            }}
          >
            {imageData.src ? (
              <img
                src={imageData.src}
                alt={imageData.alt || ""}
                className="w-full h-full object-cover rounded-[1px]"
              />
            ) : (
              <div className="text-[2px] text-green-600 text-center">IMG</div>
            )}
          </div>
        );
      })
      .filter(Boolean); // Убираем null элементы
  };

  // Рендер превью на основе типа слайда и реального контента
  const renderSlidePreview = () => {
    return (
      <div className="w-full h-full bg-white rounded-[4px] relative overflow-hidden border border-[#E5E7EB]">
        {/* HTML шаблон полностью убран */}

        {/* Редактируемые элементы поверх шаблона */}
        <div className="relative z-10">
          {renderPreviewTextElements()}
          {renderPreviewTableElements()}
          {renderPreviewImageElements()}
        </div>
      </div>
    );
  };

  // Не рендерим содержимое до тех пор, пока компонент не смонтирован на клиенте
  if (!isMounted) {
    return (
      <div className="w-full h-full bg-white rounded-[4px] relative overflow-hidden border border-[#E5E7EB]">
        {/* Пустой контейнер во время SSR */}
      </div>
    );
  }

  return renderSlidePreview();
};
