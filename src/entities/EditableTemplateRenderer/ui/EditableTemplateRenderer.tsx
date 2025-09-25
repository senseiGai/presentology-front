"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

export interface EditableTemplateRendererProps {
  html: string;
  templateId: string;
  slideNumber: number;
  slideData: any;
  className?: string;
  onTextChange?: (field: string, value: string) => void;
}

interface EditableElement {
  id: string;
  type: "text" | "image";
  content: string;
  styles: React.CSSProperties;
  bounds: DOMRect;
  element: HTMLElement;
}

export const EditableTemplateRenderer: React.FC<
  EditableTemplateRendererProps
> = ({
  html,
  templateId,
  slideNumber,
  slideData,
  className = "",
  onTextChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editableElements, setEditableElements] = useState<EditableElement[]>(
    []
  );
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  // Функция для поиска и создания редактируемых элементов
  const findEditableElements = () => {
    if (!containerRef.current) return;

    const elements: EditableElement[] = [];
    const container = containerRef.current;

    // Ищем все текстовые элементы, которые содержат наш контент
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const parentElement = textNode.parentElement;

      if (!parentElement || textNode.textContent?.trim() === "") continue;

      // Проверяем, содержит ли текст наши данные
      const textContent = textNode.textContent || "";
      let dataField: string | null = null;
      let dataValue: string | null = null;

      // Проверяем разные поля слайда
      if (slideData.title && textContent.includes(slideData.title)) {
        dataField = "title";
        dataValue = slideData.title;
      } else if (
        slideData.subtitle &&
        textContent.includes(slideData.subtitle)
      ) {
        dataField = "subtitle";
        dataValue = slideData.subtitle;
      } else if (
        slideData.text1?.t1 &&
        textContent.includes(slideData.text1.t1)
      ) {
        dataField = "text1_title";
        dataValue = slideData.text1.t1;
      } else if (
        slideData.text1?.t2 &&
        textContent.includes(slideData.text1.t2)
      ) {
        dataField = "text1_content";
        dataValue = slideData.text1.t2;
      } else if (
        slideData.text2?.t1 &&
        textContent.includes(slideData.text2.t1)
      ) {
        dataField = "text2_title";
        dataValue = slideData.text2.t1;
      } else if (
        slideData.text2?.t2 &&
        textContent.includes(slideData.text2.t2)
      ) {
        dataField = "text2_content";
        dataValue = slideData.text2.t2;
      } else if (
        slideData.text3?.t1 &&
        textContent.includes(slideData.text3.t1)
      ) {
        dataField = "text3_title";
        dataValue = slideData.text3.t1;
      } else if (
        slideData.text3?.t2 &&
        textContent.includes(slideData.text3.t2)
      ) {
        dataField = "text3_content";
        dataValue = slideData.text3.t2;
      }

      if (dataField && dataValue) {
        const bounds = parentElement.getBoundingClientRect();
        const containerBounds = container.getBoundingClientRect();

        // Вычисляем относительные координаты
        const relativeBounds = {
          ...bounds,
          left: bounds.left - containerBounds.left,
          top: bounds.top - containerBounds.top,
        } as DOMRect;

        const computedStyle = window.getComputedStyle(parentElement);

        elements.push({
          id: `${dataField}_${Date.now()}`,
          type: "text",
          content: dataValue,
          styles: {
            position: "absolute",
            left: relativeBounds.left,
            top: relativeBounds.top,
            width: relativeBounds.width,
            height: relativeBounds.height,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            fontWeight: computedStyle.fontWeight,
            color: computedStyle.color,
            textAlign: computedStyle.textAlign as any,
            lineHeight: computedStyle.lineHeight,
            backgroundColor: "transparent",
            border: "1px solid transparent",
            outline: "none",
            padding: "2px",
            zIndex: 1000,
          },
          bounds: relativeBounds,
          element: parentElement,
        });

        // Скрываем оригинальный текст
        parentElement.style.visibility = "hidden";
      }
    }

    setEditableElements(elements);
  };

  // Эффект для поиска элементов после рендеринга
  useEffect(() => {
    const timer = setTimeout(() => {
      findEditableElements();
    }, 100); // Даем время на рендеринг HTML

    return () => clearTimeout(timer);
  }, [html, slideData]);

  // Обработчик начала редактирования
  const handleStartEdit = (elementId: string, content: string) => {
    setEditingElement(elementId);
    setTempValue(content);
  };

  // Обработчик завершения редактирования
  const handleFinishEdit = (elementId: string) => {
    const element = editableElements.find((el) => el.id === elementId);
    if (!element) return;

    // Определяем поле данных по ID элемента
    const field = elementId.split("_")[0];

    if (onTextChange && tempValue !== element.content) {
      onTextChange(field, tempValue);
    }

    setEditingElement(null);
    setTempValue("");
  };

  // Обработчик изменения текста
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTempValue(e.target.value);
  };

  // Обработчик клавиш
  const handleKeyDown = (e: React.KeyboardEvent, elementId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFinishEdit(elementId);
    } else if (e.key === "Escape") {
      setEditingElement(null);
      setTempValue("");
    }
  };

  return (
    <div
      className={`editable-template-renderer ${className}`}
      style={{ position: "relative" }}
    >
      {/* Базовый HTML шаблон */}
      <div
        ref={containerRef}
        className="template-base"
        data-template-id={templateId}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />

      {/* Редактируемые элементы */}
      {editableElements.map((element) => (
        <div key={element.id} style={element.styles}>
          {editingElement === element.id ? (
            // Режим редактирования
            element.styles.height &&
            parseInt(element.styles.height as string) > 30 ? (
              <textarea
                value={tempValue}
                onChange={handleTextChange}
                onBlur={() => handleFinishEdit(element.id)}
                onKeyDown={(e) => handleKeyDown(e, element.id)}
                style={{
                  ...element.styles,
                  position: "static",
                  width: "100%",
                  height: "100%",
                  resize: "none",
                  border: "2px solid #4F46E5",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={handleTextChange}
                onBlur={() => handleFinishEdit(element.id)}
                onKeyDown={(e) => handleKeyDown(e, element.id)}
                style={{
                  ...element.styles,
                  position: "static",
                  width: "100%",
                  height: "100%",
                  border: "2px solid #4F46E5",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
                autoFocus
              />
            )
          ) : (
            // Режим просмотра
            <div
              onClick={() => handleStartEdit(element.id, element.content)}
              style={{
                ...element.styles,
                position: "static",
                cursor: "text",
                borderRadius: "4px",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-blue-50 hover:border-blue-200"
              title="Нажмите для редактирования"
            >
              {element.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
