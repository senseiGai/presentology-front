import React from "react";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { type SlideElement, type ParsedPage } from "./HTMLTemplateParser";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

export interface ParsedSlideRendererProps {
  pages: ParsedPage[];
  slideNumber: number;
  className?: string;
}

export const ParsedSlideRenderer: React.FC<ParsedSlideRendererProps> = ({
  pages,
  slideNumber,
  className,
}) => {
  const {
    selectedTextElement,
    setSelectedTextElement,
    selectedImageElement,
    setSelectedImageElement,
    setTextElementContent,
    getTextElementContent,
    deleteTextElement,
    copyTextElement,
  } = usePresentationStore();

  // Обработчик изменения текста
  const handleTextChange = (elementId: string, newText: string) => {
    console.log(`📝 Text changed for element ${elementId}:`, newText);

    // Обновляем содержимое элемента в store
    setTextElementContent(elementId, newText);

    // Также обновляем данные в localStorage
    try {
      const generatedPresentationStr = localStorage.getItem(
        "generatedPresentation"
      );
      if (!generatedPresentationStr) return;

      const generatedPresentation = JSON.parse(generatedPresentationStr);
      const slides = generatedPresentation.data?.slides;

      if (!slides || !slides[slideNumber - 1]) return;

      const slideData = slides[slideNumber - 1];

      // Определяем поле для обновления на основе ID элемента
      if (elementId.includes("title")) {
        slideData.title = newText;
      } else if (elementId.includes("subtitle")) {
        slideData.subtitle = newText;
      } else if (elementId.includes("text1")) {
        if (!slideData.text1) slideData.text1 = {};
        if (elementId.includes("t1")) {
          slideData.text1.t1 = newText;
        } else if (elementId.includes("t2")) {
          slideData.text1.t2 = newText;
        }
      } else if (elementId.includes("text2")) {
        if (!slideData.text2) slideData.text2 = {};
        if (elementId.includes("t1")) {
          slideData.text2.t1 = newText;
        } else if (elementId.includes("t2")) {
          slideData.text2.t2 = newText;
        }
      } else if (elementId.includes("text3")) {
        if (!slideData.text3) slideData.text3 = {};
        if (elementId.includes("t1")) {
          slideData.text3.t1 = newText;
        } else if (elementId.includes("t2")) {
          slideData.text3.t2 = newText;
        }
      }

      // Сохраняем обновленные данные
      localStorage.setItem(
        "generatedPresentation",
        JSON.stringify(generatedPresentation)
      );

      console.log(`✅ Updated slide data for slide ${slideNumber}`);
    } catch (error) {
      console.error("❌ Error updating slide data:", error);
    }
  };

  // Обработчик изменения позиции/размера
  const handleElementUpdate = (
    elementId: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => {
    console.log(`📐 Element ${elementId} updated:`, { position, size });

    // Здесь можно добавить логику сохранения позиций элементов
    // Возможно, стоит сохранять в отдельном store или localStorage ключе
  };

  // Обработчик изменения изображения
  const handleImageChange = (elementId: string, newImageUrl: string) => {
    console.log(`🖼️ Image changed for element ${elementId}:`, newImageUrl);

    try {
      const generatedPresentationStr = localStorage.getItem(
        "generatedPresentation"
      );
      if (!generatedPresentationStr) return;

      const generatedPresentation = JSON.parse(generatedPresentationStr);
      const slides = generatedPresentation.data?.slides;

      if (!slides || !slides[slideNumber - 1]) return;

      const slideData = slides[slideNumber - 1];

      // Определяем индекс изображения из ID элемента
      const imageIndexMatch = elementId.match(/image_\d+_(\d+)/);
      if (imageIndexMatch) {
        const imageIndex = parseInt(imageIndexMatch[1]);

        if (!slideData._images) slideData._images = [];
        slideData._images[imageIndex] = newImageUrl;

        // Сохраняем обновленные данные
        localStorage.setItem(
          "generatedPresentation",
          JSON.stringify(generatedPresentation)
        );

        console.log(`✅ Updated image ${imageIndex} for slide ${slideNumber}`);
      }
    } catch (error) {
      console.error("❌ Error updating slide image:", error);
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className={`parsed-slide-renderer-empty ${className || ""}`}>
        <div>No content to render</div>
      </div>
    );
  }

  return (
    <div className={`parsed-slide-renderer ${className || ""}`}>
      {pages.map((page, pageIndex) => (
        <div
          key={`page-${page.pageNo}-${pageIndex}`}
          className="parsed-page"
          style={{
            position: "relative",
            width: page.width,
            height: page.height,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {page.elements.map((element: SlideElement) => {
            const isSelected =
              selectedTextElement === element.id ||
              selectedImageElement === element.id;

            if (element.type === "text") {
              return (
                <ResizableTextBox
                  key={element.id}
                  elementId={element.id}
                  isSelected={isSelected}
                  onDelete={() => deleteTextElement(element.id)}
                  onCopy={() => copyTextElement(element.id)}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                >
                  <div
                    onClick={() => setSelectedTextElement(element.id)}
                    style={{
                      ...element.style,
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      padding: "4px",
                      cursor: "text",
                      outline: "none",
                      border: "none",
                      background: "transparent",
                      wordWrap: "break-word",
                      overflow: "hidden",
                    }}
                    contentEditable={isSelected}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newText = e.currentTarget.textContent || "";
                      handleTextChange(element.id, newText);
                    }}
                  >
                    {getTextElementContent(element.id) ||
                      element.content ||
                      element.defaultValue ||
                      ""}
                  </div>
                </ResizableTextBox>
              );
            }

            if (element.type === "image") {
              return (
                <ResizableImageBox
                  key={element.id}
                  elementId={element.id}
                  slideNumber={slideNumber}
                  isSelected={isSelected}
                  onDelete={() => {}}
                />
              );
            }

            // Для статических элементов и ссылок просто рендерим HTML
            if (element.type === "static" || element.type === "link") {
              return (
                <div
                  key={element.id}
                  style={{
                    ...element.style,
                    position: "absolute",
                    pointerEvents: element.type === "link" ? "auto" : "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: element.rawHTML || "" }}
                />
              );
            }

            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default ParsedSlideRenderer;
