"use client";

import React from "react";
import { TemplateRenderer } from "@/entities/TemplateRenderer";

export interface SimpleEditableTemplateRendererProps {
  html: string;
  templateId: string;
  slideNumber: number;
  slideData: any;
  className?: string;
  onTextClick?: (text: string, element: HTMLElement) => void;
  onImageClick?: (src: string, element: HTMLElement) => void;
}

export const SimpleEditableTemplateRenderer: React.FC<
  SimpleEditableTemplateRendererProps
> = ({
  html,
  templateId,
  slideNumber,
  slideData,
  className = "",
  onTextClick,
  onImageClick,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Добавляем обработчики кликов после рендеринга
  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Добавляем обработчики для текстовых элементов
    const handleTextClick = (e: Event) => {
      const target = e.target as HTMLElement;

      // Проверяем, является ли элемент текстовым
      if (target.textContent && target.textContent.trim() && onTextClick) {
        e.preventDefault();
        e.stopPropagation();
        onTextClick(target.textContent.trim(), target);
      }
    };

    // Добавляем обработчики для изображений
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLImageElement;

      if (onImageClick) {
        e.preventDefault();
        e.stopPropagation();
        onImageClick(target.src, target);
      }
    };

    // Находим все текстовые элементы и добавляем им обработчики
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT
    );

    let node;
    while ((node = walker.nextNode())) {
      const element = node as HTMLElement;

      // Добавляем hover эффекты и клики для текстовых элементов
      if (element.textContent && element.textContent.trim()) {
        element.style.cursor = "text";
        element.style.transition = "all 0.2s ease";

        element.addEventListener("mouseenter", () => {
          element.style.backgroundColor = "rgba(79, 70, 229, 0.1)";
          element.style.outline = "1px solid rgba(79, 70, 229, 0.3)";
        });

        element.addEventListener("mouseleave", () => {
          element.style.backgroundColor = "transparent";
          element.style.outline = "none";
        });

        element.addEventListener("click", handleTextClick);
      }
    }

    // Находим все изображения и добавляем им обработчики
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      img.style.cursor = "pointer";
      img.style.transition = "all 0.2s ease";

      img.addEventListener("mouseenter", () => {
        img.style.outline = "2px solid rgba(79, 70, 229, 0.5)";
        img.style.transform = "scale(1.02)";
      });

      img.addEventListener("mouseleave", () => {
        img.style.outline = "none";
        img.style.transform = "scale(1)";
      });

      img.addEventListener("click", handleImageClick);
    });

    // Cleanup
    return () => {
      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        el.removeEventListener("click", handleTextClick);
        el.removeEventListener("click", handleImageClick);
      });
    };
  }, [html, onTextClick, onImageClick]);

  return (
    <div
      ref={containerRef}
      className={`simple-editable-template-renderer ${className}`}
      style={{ position: "relative" }}
    >
      <TemplateRenderer
        html={html}
        templateId={templateId}
        className="w-full h-full"
      />

      {/* Overlay с подсказкой */}
      <div
        className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity"
        style={{ zIndex: 1000, pointerEvents: "none" }}
      >
        Нажмите на текст или изображение для редактирования
      </div>
    </div>
  );
};
