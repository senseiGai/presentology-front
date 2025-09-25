import React, { useState, useEffect } from "react";
import {
  HTMLTemplateParser,
  parseHTMLTemplate,
  type ParsedPage,
  type SlideElement,
} from "./HTMLTemplateParser";

export interface SlideTemplateParserProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  onParsed?: (pages: ParsedPage[]) => void;
  className?: string;
}

// Компонент-адаптер для работы с существующим API
export const SlideTemplateParser: React.FC<SlideTemplateParserProps> = ({
  slideNumber,
  slideType = "default",
  onParsed,
  className,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Получение HTML контента для слайда
  useEffect(() => {
    const fetchSlideHTML = async () => {
      setIsLoading(true);
      try {
        // Получаем данные из localStorage
        const generatedPresentationStr = localStorage.getItem(
          "generatedPresentation"
        );
        if (!generatedPresentationStr) {
          console.log(
            `🔍 No generated presentation found for slide ${slideNumber}`
          );
          return;
        }

        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const slides = generatedPresentation.data?.slides;

        if (!slides || !slides[slideNumber - 1]) {
          console.log(`🔍 No slide data found for slide ${slideNumber}`);
          return;
        }

        const slideData = slides[slideNumber - 1];

        // Получаем protoId (templateId) для слайда
        const protoId = slideData.protoId || slideData.templateId;
        if (!protoId) {
          console.log(`🔍 No protoId found for slide ${slideNumber}`);
          return;
        }

        console.log(
          `🔍 Fetching HTML template for slide ${slideNumber}, protoId: ${protoId}`
        );

        // Получаем HTML шаблон от API
        const response = await fetch(`/api/templates/${protoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.html) {
          // Заменяем плейсхолдеры в HTML на реальные данные
          let processedHtml = data.html;

          // Заменяем текстовые плейсхолдеры
          if (slideData.title) {
            processedHtml = processedHtml.replace(
              /\{\{title\}\}/g,
              slideData.title
            );
          }
          if (slideData.subtitle) {
            processedHtml = processedHtml.replace(
              /\{\{subtitle\}\}/g,
              slideData.subtitle
            );
          }
          if (slideData.text1?.t1) {
            processedHtml = processedHtml.replace(
              /\{\{text1\.t1\}\}/g,
              slideData.text1.t1
            );
          }
          if (slideData.text1?.t2) {
            processedHtml = processedHtml.replace(
              /\{\{text1\.t2\}\}/g,
              slideData.text1.t2
            );
          }
          if (slideData.text2?.t1) {
            processedHtml = processedHtml.replace(
              /\{\{text2\.t1\}\}/g,
              slideData.text2.t1
            );
          }
          if (slideData.text2?.t2) {
            processedHtml = processedHtml.replace(
              /\{\{text2\.t2\}\}/g,
              slideData.text2.t2
            );
          }
          if (slideData.text3?.t1) {
            processedHtml = processedHtml.replace(
              /\{\{text3\.t1\}\}/g,
              slideData.text3.t1
            );
          }
          if (slideData.text3?.t2) {
            processedHtml = processedHtml.replace(
              /\{\{text3\.t2\}\}/g,
              slideData.text3.t2
            );
          }

          // Заменяем изображения
          if (slideData._images && slideData._images.length > 0) {
            slideData._images.forEach((imageUrl: string, index: number) => {
              // Заменяем различные паттерны изображений в HTML
              const imgPatterns = [
                /src="[^"]*placeholder[^"]*"/gi,
                /src="[^"]*image[^"]*"/gi,
                /src="[^"]*img[^"]*"/gi,
                new RegExp(`src="[^"]*image${index + 1}[^"]*"`, "gi"),
                new RegExp(`src="[^"]*img${index + 1}[^"]*"`, "gi"),
              ];

              imgPatterns.forEach((pattern) => {
                if (processedHtml.match(pattern)) {
                  processedHtml = processedHtml.replace(
                    pattern,
                    `src="${imageUrl}"`
                  );
                }
              });
            });
          }

          setHtmlContent(processedHtml);
          console.log(`✅ HTML template loaded for slide ${slideNumber}`);
        } else {
          console.error(
            `❌ Failed to load template for slide ${slideNumber}:`,
            data.error
          );
        }
      } catch (error) {
        console.error(
          `❌ Error fetching HTML for slide ${slideNumber}:`,
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlideHTML();
  }, [slideNumber, slideType]);

  // Обработчик парсинга
  const handleParsed = (pages: ParsedPage[]) => {
    console.log(
      `🎯 Slide ${slideNumber} parsed into ${pages.length} pages with elements:`,
      pages
    );
    if (onParsed) {
      onParsed(pages);
    }
  };

  if (isLoading) {
    return (
      <div className={`slide-template-parser-loading ${className || ""}`}>
        <div>Loading slide template...</div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className={`slide-template-parser-empty ${className || ""}`}>
        <div>No template available for slide {slideNumber}</div>
      </div>
    );
  }

  return (
    <HTMLTemplateParser
      htmlContent={htmlContent}
      onParsed={handleParsed}
      className={className}
    />
  );
};

export default SlideTemplateParser;
