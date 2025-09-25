"use client";

import React, { useEffect, useState } from "react";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

export interface PureTemplateRendererProps {
  html: string;
  templateId: string;
  slideNumber: number;
  slideData: any;
  className?: string;
}

interface ElementLayout {
  id: string;
  type: "text" | "image";
  field: string;
  content: string;
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  styles: {
    fontSize: number;
    fontWeight: string;
    color: string;
    textAlign: "left" | "center" | "right";
    fontFamily: string;
  };
}

export const PureTemplateRenderer: React.FC<PureTemplateRendererProps> = ({
  html,
  templateId,
  slideNumber,
  slideData,
  className = "",
}) => {
  const [elements, setElements] = useState<ElementLayout[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>("");

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

  // Функция для парсинга CSS стилей из HTML
  const parseCSS = (html: string) => {
    const styles: Record<string, any> = {};

    // Извлекаем CSS из <style> тегов
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches) {
      styleMatches.forEach((styleBlock) => {
        const cssContent = styleBlock.replace(/<\/?style[^>]*>/gi, "");

        // Парсим CSS правила
        const rules = cssContent.match(/([^{]+)\{([^}]*)\}/g);
        if (rules) {
          rules.forEach((rule) => {
            const [selector, declarations] = rule.split("{");
            const cleanSelector = selector.trim();
            const cleanDeclarations = declarations.replace("}", "").trim();

            const properties: Record<string, string> = {};
            cleanDeclarations.split(";").forEach((decl) => {
              const [prop, value] = decl.split(":");
              if (prop && value) {
                properties[prop.trim()] = value.trim();
              }
            });

            styles[cleanSelector] = properties;
          });
        }
      });
    }

    return styles;
  };

  // Функция для извлечения фонового изображения
  const extractBackgroundImage = (html: string) => {
    // Ищем img теги и background-image в стилях
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && slideData?._images?.[0]) {
      setBackgroundImage(slideData._images[0]);
      return;
    }

    const bgMatch = html.match(
      /background-image:\s*url\(["']?([^"')]+)["']?\)/i
    );
    if (bgMatch && slideData?._images?.[0]) {
      setBackgroundImage(slideData._images[0]);
    }
  };

  // Функция для парсинга реальных позиций из HTML
  const parseElementPositions = (
    html: string,
    cssStyles: Record<string, any>
  ): ElementLayout[] => {
    const layouts: ElementLayout[] = [];

    console.log(
      "🔍 [PureTemplateRenderer] Starting HTML parsing for template:",
      templateId
    );
    console.log("📄 [PureTemplateRenderer] HTML content length:", html.length);
    console.log(
      "🎨 [PureTemplateRenderer] Parsed CSS styles:",
      Object.keys(cssStyles)
    );

    // Ищем плейсхолдеры в HTML и сопоставляем их с реальным контентом
    const textElements = [
      { field: "title", placeholder: "{{title}}", content: slideData?.title },
      {
        field: "subtitle",
        placeholder: "{{subtitle}}",
        content: slideData?.subtitle,
      },
      {
        field: "text1.t1",
        placeholder: "{{text1.t1}}",
        content: slideData?.text1?.t1,
      },
      {
        field: "text1.t2",
        placeholder: "{{text1.t2}}",
        content: slideData?.text1?.t2,
      },
      {
        field: "text2.t1",
        placeholder: "{{text2.t1}}",
        content: slideData?.text2?.t1,
      },
      {
        field: "text2.t2",
        placeholder: "{{text2.t2}}",
        content: slideData?.text2?.t2,
      },
      {
        field: "text3.t1",
        placeholder: "{{text3.t1}}",
        content: slideData?.text3?.t1,
      },
      {
        field: "text3.t2",
        placeholder: "{{text3.t2}}",
        content: slideData?.text3?.t2,
      },
    ];

    textElements.forEach(({ field, placeholder, content }) => {
      if (content && content.trim()) {
        console.log(
          `🔍 [PureTemplateRenderer] Looking for placeholder: "${placeholder}" with content: "${content.substring(
            0,
            50
          )}..."`
        );

        // Ищем плейсхолдер в HTML
        const match = html.match(
          new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g")
        );

        if (match && match.length > 0) {
          const placeholderIndex = html.indexOf(placeholder);
          console.log(
            `✅ [PureTemplateRenderer] Found placeholder "${placeholder}" at index: ${placeholderIndex}`
          );

          // Дополнительные логи для title
          if (field === "title") {
            console.log(
              `🎯 [TITLE TRACKING] Title placeholder found in template at character ${placeholderIndex}`
            );
            const contextStart = Math.max(0, placeholderIndex - 50);
            const contextEnd = Math.min(
              html.length,
              placeholderIndex + placeholder.length + 50
            );
            console.log(
              `📖 [TITLE TRACKING] HTML context: "${html.substring(
                contextStart,
                contextEnd
              )}"`
            );
          }

          // Пытаемся найти HTML элемент, содержащий этот плейсхолдер
          const beforePlaceholder = html.substring(0, placeholderIndex);
          const afterPlaceholder = html.substring(
            placeholderIndex + placeholder.length
          );

          // Ищем ближайший открывающий тег перед плейсхолдером
          const tagMatch = beforePlaceholder.match(
            /<([^>\/\s]+)[^>]*>(?!.*<\/\1>.*$)/
          );
          if (tagMatch) {
            const tagName = tagMatch[1];
            console.log(
              `📍 [PureTemplateRenderer] Found containing tag: ${tagName}`
            );

            // Пытаемся извлечь стили для этого элемента
            let position = { left: 100, top: 100, width: 300, height: 50 };
            let styles = {
              fontSize: 16,
              fontWeight: "normal",
              color: "#000000",
              textAlign: "left" as const,
              fontFamily: "Arial, sans-serif",
            };

            // Ищем class или id атрибуты
            const classMatch = tagMatch[0].match(/class=["']([^"']+)["']/);
            const idMatch = tagMatch[0].match(/id=["']([^"']+)["']/);

            if (classMatch) {
              const classNames = classMatch[1].split(" ");
              console.log(
                `🎯 [PureTemplateRenderer] Found classes: ${classNames.join(
                  ", "
                )}`
              );

              // Ищем стили для всех классов и объединяем их
              let allCssProps: any = {};
              classNames.forEach((className) => {
                const classSelector = `.${className}`;
                if (cssStyles[classSelector]) {
                  console.log(
                    `🎨 [PureTemplateRenderer] Found CSS for class ${className}:`,
                    cssStyles[classSelector]
                  );
                  allCssProps = { ...allCssProps, ...cssStyles[classSelector] };
                }
              });

              if (Object.keys(allCssProps).length > 0) {
                const cssProps = allCssProps;

                // Извлекаем позицию
                if (cssProps.left) position.left = parseFloat(cssProps.left);
                if (cssProps.top) position.top = parseFloat(cssProps.top);
                if (cssProps.width) position.width = parseFloat(cssProps.width);
                if (cssProps.height)
                  position.height = parseFloat(cssProps.height);

                // Извлекаем стили текста
                if (cssProps["font-size"])
                  styles.fontSize = parseFloat(cssProps["font-size"]);
                if (cssProps["font-weight"])
                  styles.fontWeight = cssProps["font-weight"];
                if (cssProps.color) styles.color = cssProps.color;
                if (cssProps["text-align"])
                  styles.textAlign = cssProps["text-align"] as any;
                if (cssProps["font-family"])
                  styles.fontFamily = cssProps["font-family"];

                // Обрабатываем bottom координату (PDF использует систему координат снизу)
                if (cssProps.bottom && !position.top) {
                  const slideHeight = 427; // Высота слайда в пикселях
                  const bottomValue = parseFloat(cssProps.bottom);
                  position.top = slideHeight - bottomValue - position.height;
                  console.log(
                    `🔄 [PureTemplateRenderer] Converted bottom ${bottomValue} to top ${position.top} for ${field}`
                  );
                }
              }
            }

            if (idMatch) {
              const elementId = idMatch[1];
              console.log(`🆔 [PureTemplateRenderer] Found ID: ${elementId}`);

              const idSelector = `#${elementId}`;
              if (cssStyles[idSelector]) {
                console.log(
                  `🎨 [PureTemplateRenderer] Found CSS for ID ${elementId}:`,
                  cssStyles[idSelector]
                );
              }
            }

            // Проверяем, удалось ли извлечь позицию из CSS
            const hasValidPosition =
              position.left > 0 ||
              position.top > 0 ||
              position.width > 0 ||
              position.height > 0;

            if (!hasValidPosition) {
              console.log(
                `⚠️ [PureTemplateRenderer] No valid CSS position found for ${field}, skipping`
              );
              return; // Пропускаем элемент, если нет CSS позиции
            }

            console.log(
              `📐 [PureTemplateRenderer] Final position for ${field}:`,
              position
            );
            console.log(
              `🎨 [PureTemplateRenderer] Final styles for ${field}:`,
              styles
            );

            layouts.push({
              id: `template-${slideNumber}-${field.replace(".", "_")}`,
              type: "text",
              field,
              content,
              position,
              styles,
            });
          } else {
            console.warn(
              `⚠️ [PureTemplateRenderer] Could not find containing tag for text "${content.substring(
                0,
                30
              )}..."`
            );
          }
        } else {
          console.warn(
            `❌ [PureTemplateRenderer] Text content "${content.substring(
              0,
              30
            )}..." not found in HTML`
          );
        }
      }
    });

    console.log(
      `📊 [PureTemplateRenderer] Total elements parsed: ${layouts.length}`
    );
    return layouts;
  };

  // Предопределенные позиции для разных шаблонов (fallback)
  const getTemplateLayout = (templateId: string): ElementLayout[] => {
    console.log(
      "⚠️ [PureTemplateRenderer] Using fallback layout for template:",
      templateId
    );

    const layouts: ElementLayout[] = [];

    // Базовые позиции для разных типов шаблонов (используем позиции из CSS шаблона)
    if (slideData?.title) {
      console.log("📝 [PureTemplateRenderer] Adding title:", slideData.title);
      layouts.push({
        id: `template-${slideNumber}-title`,
        type: "text",
        field: "title",
        content: slideData.title,
        position: {
          left: 411, // Из CSS: .x2{left:411.669986px;}
          top: 115, // Из CSS: .ye{bottom:311.400000px;} конвертировано в top (427-311=116)
          width: 300, // Разумная ширина для title
          height: 153, // Из CSS: .h4{height:153.446400px;}
        },
        styles: {
          fontSize: 48,
          fontWeight: "bold",
          color: "#000000",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    if (slideData?.subtitle) {
      layouts.push({
        id: `template-${slideNumber}-subtitle`,
        type: "text",
        field: "subtitle",
        content: slideData.subtitle,
        position: {
          left: 50,
          top: 150,
          width: 659,
          height: 50,
        },
        styles: {
          fontSize: 24,
          fontWeight: "normal",
          color: "#333333",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    if (slideData?.text1?.t1) {
      layouts.push({
        id: `template-${slideNumber}-text1_t1`,
        type: "text",
        field: "text1.t1",
        content: slideData.text1.t1,
        position: {
          left: 50,
          top: 220,
          width: 300,
          height: 40,
        },
        styles: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#000000",
          textAlign: "left",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    if (slideData?.text1?.t2) {
      layouts.push({
        id: `template-${slideNumber}-text1_t2`,
        type: "text",
        field: "text1.t2",
        content: slideData.text1.t2,
        position: {
          left: 50,
          top: 270,
          width: 300,
          height: 100,
        },
        styles: {
          fontSize: 16,
          fontWeight: "normal",
          color: "#333333",
          textAlign: "left",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    if (slideData?.text2?.t1) {
      layouts.push({
        id: `template-${slideNumber}-text2_t1`,
        type: "text",
        field: "text2.t1",
        content: slideData.text2.t1,
        position: {
          left: 409, // правая сторона
          top: 220,
          width: 300,
          height: 40,
        },
        styles: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#000000",
          textAlign: "left",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    if (slideData?.text2?.t2) {
      layouts.push({
        id: `template-${slideNumber}-text2_t2`,
        type: "text",
        field: "text2.t2",
        content: slideData.text2.t2,
        position: {
          left: 409,
          top: 270,
          width: 300,
          height: 100,
        },
        styles: {
          fontSize: 16,
          fontWeight: "normal",
          color: "#333333",
          textAlign: "left",
          fontFamily: "Arial, sans-serif",
        },
      });
    }

    return layouts;
  };

  // Инициализация элементов
  useEffect(() => {
    if (slideData && html) {
      console.log("=".repeat(80));
      console.log(
        "🚀 [PureTemplateRenderer] Initializing elements for slide:",
        slideNumber
      );
      console.log("📊 [PureTemplateRenderer] Slide data:", slideData);

      // Детальные логи для title
      if (slideData.title) {
        console.log(
          `🎯 [TITLE TRACKING] Our title content: "${slideData.title}"`
        );
        console.log(
          `📍 [TITLE TRACKING] Looking for {{title}} placeholder in template`
        );
        const titlePlaceholderIndex = html.indexOf("{{title}}");
        console.log(
          `📍 [TITLE TRACKING] {{title}} placeholder found at index: ${titlePlaceholderIndex}`
        );

        if (titlePlaceholderIndex !== -1) {
          // Показываем контекст вокруг плейсхолдера
          const start = Math.max(0, titlePlaceholderIndex - 100);
          const end = Math.min(html.length, titlePlaceholderIndex + 200);
          console.log(`📖 [TITLE TRACKING] Context around {{title}}:`);
          console.log(html.substring(start, end));
        }
      }

      // Парсим CSS стили из HTML
      const cssStyles = parseCSS(html);
      console.log("🎨 [PureTemplateRenderer] Parsed CSS styles:", cssStyles);

      // Ищем CSS стили, которые могут относиться к title
      console.log("🎯 [TITLE TRACKING] Looking for title-related CSS:");
      Object.keys(cssStyles).forEach((selector) => {
        if (
          selector.includes("title") ||
          selector.includes("h1") ||
          selector.includes("h2")
        ) {
          console.log(
            `🎨 [TITLE TRACKING] Found relevant CSS selector "${selector}":`,
            cssStyles[selector]
          );
        }
      });

      // Используем только правильные позиции из CSS (убираем дублирование)
      console.log(
        "📋 [PureTemplateRenderer] Using template layout with CSS positions"
      );
      let layout = getTemplateLayout(templateId);

      console.log("📋 [PureTemplateRenderer] Final layout:", layout);

      // Дополнительные логи для title позиций
      const titleElement = layout.find((el) => el.field === "title");
      if (titleElement) {
        console.log(`🎯 [TITLE TRACKING] Final title position in our render:`, {
          x: titleElement.position.left,
          y: titleElement.position.top,
          width: titleElement.position.width,
          height: titleElement.position.height,
          content: titleElement.content,
        });
      }

      setElements(layout);
      extractBackgroundImage(html);

      // Регистрируем элементы в store
      layout.forEach((element) => {
        const currentContent = getTextElementContent(element.id);
        if (!currentContent) {
          setTextElementContent(element.id, element.content);
        }
      });
    }
  }, [slideData, templateId, html]);

  // Обработчик изменения текста
  const handleTextChange = (elementId: string, newText: string) => {
    setTextElementContent(elementId, newText);

    // Обновляем данные в localStorage
    const element = elements.find((el) => el.id === elementId);
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

      // Парсим путь поля
      const fieldParts = field.split(".");

      if (fieldParts.length === 1) {
        slideData[field] = value;
      } else if (fieldParts.length === 2) {
        const [mainField, subField] = fieldParts;
        if (!slideData[mainField]) slideData[mainField] = {};
        slideData[mainField][subField] = value;
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
      className={`pure-template-renderer ${className}`}
      style={{
        position: "relative",
        width: "759px",
        height: "427px",
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Рендерим только наши редактируемые компоненты */}
      {(() => {
        console.log(
          `🔥 [RENDER DEBUG] Total elements to render: ${elements.length}`,
          elements.map((el) => ({
            id: el.id,
            field: el.field,
            content: el.content.substring(0, 30),
          }))
        );
        return elements;
      })().map((element) => {
        console.log(
          `🎯 [PureTemplateRenderer] Rendering element: ${element.id}`
        );
        console.log(`📍 [PureTemplateRenderer] Position:`, element.position);
        console.log(`🎨 [PureTemplateRenderer] Styles:`, element.styles);
        console.log(`📝 [PureTemplateRenderer] Content:`, element.content);

        // Дополнительные логи для title
        if (element.field === "title") {
          console.log("=".repeat(60));
          console.log(`🎯 [TITLE TRACKING] FINAL RENDER POSITION:`);
          console.log(`📍 [TITLE TRACKING] X: ${element.position.left}px`);
          console.log(`📍 [TITLE TRACKING] Y: ${element.position.top}px`);
          console.log(`📍 [TITLE TRACKING] Width: ${element.position.width}px`);
          console.log(
            `📍 [TITLE TRACKING] Height: ${element.position.height}px`
          );
          console.log(`📝 [TITLE TRACKING] Content: "${element.content}"`);
          console.log(
            `🎨 [TITLE TRACKING] Font Size: ${element.styles.fontSize}px`
          );
          console.log("=".repeat(60));
        }

        return (
          <div
            key={element.id}
            style={{
              position: "absolute",
              left: element.position.left,
              top: element.position.top,
              width: element.position.width,
              height: element.position.height,
              border: "1px dashed rgba(255, 0, 0, 0.3)", // Временная граница для отладки
            }}
          >
            <ResizableTextBox
              elementId={element.id}
              isSelected={selectedTextElement === element.id}
              onDelete={() => deleteTextElement(element.id)}
              onCopy={() => copyTextElement(element.id)}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            >
              <div
                onClick={() => setSelectedTextElement(element.id)}
                style={{
                  fontSize: element.styles.fontSize,
                  fontWeight: element.styles.fontWeight,
                  color: element.styles.color,
                  textAlign: element.styles.textAlign,
                  fontFamily: element.styles.fontFamily,
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
                contentEditable={selectedTextElement === element.id}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newText = e.target.textContent || "";
                  const currentContent = getTextElementContent(element.id);
                  if (newText !== currentContent) {
                    handleTextChange(element.id, newText);
                  }
                }}
              >
                {(() => {
                  const storeContent = getTextElementContent(element.id);
                  const elementContent = element.content;
                  console.log(`🎯 [RENDER DEBUG] Element ${element.id}:`, {
                    storeContent,
                    elementContent,
                    willRender: storeContent || elementContent,
                  });
                  return storeContent || elementContent;
                })()}
              </div>
            </ResizableTextBox>
          </div>
        );
      })}
    </div>
  );
};
