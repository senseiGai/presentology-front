import React from "react";

// Типы для элементов слайда
export interface SlideElement {
  id: string;
  type: "text" | "image" | "link" | "static";
  pageNo: number;
  style: React.CSSProperties;
  content?: string; // для текстовых элементов
  src?: string; // для изображений
  defaultValue?: string; // исходный текст
  rawHTML?: string; // исходный HTML для восстановления
  ctmRelated?: {
    ctm: number[];
    ictm: number[];
    originalCoords: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
}

export interface ParsedPage {
  pageNo: number;
  width: number;
  height: number;
  ctm: number[];
  ictm: number[];
  elements: SlideElement[];
}

export interface HTMLTemplateParserProps {
  htmlContent: string;
  onParsed: (pages: ParsedPage[]) => void;
  className?: string;
}

// Константы из pdf2htmlEX
const CSS_CLASS_NAMES = {
  page_frame: "pf",
  page_content_box: "pc",
  page_data: "pi",
  background_image: "bi",
  link: "l",
  input_radio: "ir",
};

const EPS = 1e-6;

// Утилиты для работы с матрицами (из pdf2htmlEX)
function invert(matrix: number[]): number[] {
  const [a, b, c, d, e, f] = matrix;
  const det = a * d - b * c;
  return [
    d / det,
    -b / det,
    -c / det,
    a / det,
    (c * f - d * e) / det,
    (b * e - a * f) / det,
  ];
}

function transform(matrix: number[], point: number[]): number[] {
  const [a, b, c, d, e, f] = matrix;
  const [x, y] = point;
  return [a * x + c * y + e, b * x + d * y + f];
}

function getPageNumber(element: Element): number {
  const pageNo = element.getAttribute("data-page-no");
  return pageNo ? parseInt(pageNo, 16) : 0;
}

// Парсинг CSS transform
function parseTransform(transformStr: string): number[] | null {
  if (!transformStr || transformStr === "none") return null;

  const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(",").map((v) => parseFloat(v.trim()));
    if (values.length === 6) {
      return values;
    }
  }

  return null;
}

// Извлечение числового значения из CSS
function extractNumericValue(value: string): number {
  if (!value) return 0;
  const match = value.match(/([-\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// Проверка близости элементов для объединения текста
function areElementsClose(el1: Element, el2: Element, threshold = 5): boolean {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  // Проверяем вертикальную близость (одна строка)
  const verticalDistance = Math.abs(rect1.top - rect2.top);
  if (verticalDistance > threshold) return false;

  // Проверяем горизонтальную близость
  const horizontalGap = Math.min(
    Math.abs(rect1.right - rect2.left),
    Math.abs(rect2.right - rect1.left)
  );

  return horizontalGap < threshold * 3;
}

// Проверка совместимости стилей для объединения
function areStylesCompatible(el1: Element, el2: Element): boolean {
  const style1 = window.getComputedStyle(el1);
  const style2 = window.getComputedStyle(el2);

  return (
    style1.fontSize === style2.fontSize &&
    style1.fontFamily === style2.fontFamily &&
    style1.color === style2.color &&
    style1.fontWeight === style2.fontWeight
  );
}

// Классификация контейнера
function classifyContainer(
  container: Element
): "text" | "image" | "link" | "static" {
  // Проверяем наличие изображений
  if (
    container.querySelector("img") ||
    container.classList.contains(CSS_CLASS_NAMES.background_image)
  ) {
    return "image";
  }

  // Проверяем наличие ссылок
  if (
    container.querySelector("a") ||
    container.hasAttribute("data-dest-detail")
  ) {
    return "link";
  }

  // Проверяем наличие только текстовых span-ов
  const spans = container.querySelectorAll("span");
  const hasOnlyText =
    spans.length > 0 &&
    Array.from(container.children).every(
      (child) =>
        child.tagName.toLowerCase() === "span" ||
        (child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
    );

  if (hasOnlyText) {
    return "text";
  }

  return "static";
}

// Объединение соседних span-ов в текстовые блоки
function mergeTextSpans(spans: Element[]): Element[][] {
  if (spans.length === 0) return [];

  const groups: Element[][] = [];
  let currentGroup: Element[] = [spans[0]];

  for (let i = 1; i < spans.length; i++) {
    const current = spans[i];
    const previous = spans[i - 1];

    if (
      areElementsClose(previous, current) &&
      areStylesCompatible(previous, current)
    ) {
      currentGroup.push(current);
    } else {
      groups.push([...currentGroup]);
      currentGroup = [current];
    }
  }

  groups.push(currentGroup);
  return groups;
}

// Извлечение стилей элемента
function extractElementStyle(element: Element): React.CSSProperties {
  const computedStyle = window.getComputedStyle(element);
  const style: React.CSSProperties = {};

  // Позиционирование
  if (computedStyle.position) style.position = computedStyle.position as any;
  if (computedStyle.left) style.left = extractNumericValue(computedStyle.left);
  if (computedStyle.top) style.top = extractNumericValue(computedStyle.top);
  if (computedStyle.width)
    style.width = extractNumericValue(computedStyle.width);
  if (computedStyle.height)
    style.height = extractNumericValue(computedStyle.height);

  // Шрифт и текст
  if (computedStyle.fontSize) style.fontSize = computedStyle.fontSize;
  if (computedStyle.fontFamily) style.fontFamily = computedStyle.fontFamily;
  if (computedStyle.fontWeight) style.fontWeight = computedStyle.fontWeight;
  if (computedStyle.color) style.color = computedStyle.color;
  if (computedStyle.textAlign) style.textAlign = computedStyle.textAlign as any;
  if (computedStyle.lineHeight) style.lineHeight = computedStyle.lineHeight;

  // Фон и границы
  if (computedStyle.backgroundColor)
    style.backgroundColor = computedStyle.backgroundColor;
  if (computedStyle.border) style.border = computedStyle.border;

  // Трансформации
  if (computedStyle.transform && computedStyle.transform !== "none") {
    style.transform = computedStyle.transform;
  }

  return style;
}

// Основная функция парсинга
export function parseHTMLTemplate(htmlContent: string): ParsedPage[] {
  // Создаем временный DOM для парсинга
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const pages: ParsedPage[] = [];

  // Находим все страницы
  const pageFrames = doc.querySelectorAll(`.${CSS_CLASS_NAMES.page_frame}`);

  pageFrames.forEach((pageFrame) => {
    const pageNo = getPageNumber(pageFrame);
    const pageContentBox = pageFrame.querySelector(
      `.${CSS_CLASS_NAMES.page_content_box}`
    );
    const pageDataElement = pageFrame.querySelector(
      `.${CSS_CLASS_NAMES.page_data}`
    );

    if (!pageContentBox || !pageDataElement) return;

    // Извлекаем данные страницы
    let pageData: any = {};
    try {
      const dataAttr = pageDataElement.getAttribute("data-data");
      if (dataAttr) {
        pageData = JSON.parse(dataAttr);
      }
    } catch (e) {
      console.warn("Failed to parse page data:", e);
    }

    const ctm = pageData.ctm || [1, 0, 0, 1, 0, 0];
    const ictm = invert(ctm);

    const page: ParsedPage = {
      pageNo,
      width:
        pageFrame.clientWidth ||
        extractNumericValue(
          pageFrame.getAttribute("style")?.match(/width:\s*([^;]+)/)?.[1] || "0"
        ),
      height:
        pageFrame.clientHeight ||
        extractNumericValue(
          pageFrame.getAttribute("style")?.match(/height:\s*([^;]+)/)?.[1] ||
            "0"
        ),
      ctm,
      ictm,
      elements: [],
    };

    // Находим все абсолютно позиционированные контейнеры
    const absoluteContainers = Array.from(
      pageContentBox.querySelectorAll("div")
    ).filter((div) => {
      const style = window.getComputedStyle(div);
      return style.position === "absolute";
    });

    absoluteContainers.forEach((container, index) => {
      const containerType = classifyContainer(container);
      const elementStyle = extractElementStyle(container);

      // Сохраняем исходные координаты для CTM
      const originalCoords = {
        left: extractNumericValue(container.style.left),
        top: extractNumericValue(container.style.top),
        width:
          extractNumericValue(container.style.width) || container.clientWidth,
        height:
          extractNumericValue(container.style.height) || container.clientHeight,
      };

      if (containerType === "text") {
        // Обрабатываем текстовые элементы
        const spans = Array.from(container.querySelectorAll("span"));
        const spanGroups = mergeTextSpans(spans);

        spanGroups.forEach((group, groupIndex) => {
          const combinedText = group
            .map((span) => span.textContent || "")
            .join("");
          const firstSpan = group[0];
          const lastSpan = group[group.length - 1];

          // Вычисляем общие границы группы
          const firstRect = firstSpan.getBoundingClientRect();
          const lastRect = lastSpan.getBoundingClientRect();

          const groupStyle = extractElementStyle(firstSpan);
          groupStyle.position = "absolute";
          groupStyle.left = Math.min(firstRect.left, lastRect.left);
          groupStyle.top = Math.min(firstRect.top, lastRect.top);
          groupStyle.width =
            Math.max(firstRect.right, lastRect.right) - groupStyle.left!;
          groupStyle.height =
            Math.max(firstRect.bottom, lastRect.bottom) - groupStyle.top!;

          const element: SlideElement = {
            id: `text_${pageNo}_${index}_${groupIndex}`,
            type: "text",
            pageNo,
            style: groupStyle,
            content: combinedText,
            defaultValue: combinedText,
            rawHTML: group.map((span) => span.outerHTML).join(""),
            ctmRelated: {
              ctm,
              ictm,
              originalCoords: {
                left: groupStyle.left as number,
                top: groupStyle.top as number,
                width: groupStyle.width as number,
                height: groupStyle.height as number,
              },
            },
          };

          page.elements.push(element);
        });
      } else if (containerType === "image") {
        // Обрабатываем изображения
        const img = container.querySelector("img");
        const element: SlideElement = {
          id: `image_${pageNo}_${index}`,
          type: "image",
          pageNo,
          style: elementStyle,
          src: img?.src || "",
          rawHTML: container.outerHTML,
          ctmRelated: {
            ctm,
            ictm,
            originalCoords,
          },
        };

        page.elements.push(element);
      } else if (containerType === "link") {
        // Обрабатываем ссылки
        const link = container.querySelector("a");
        const destDetail =
          container.getAttribute("data-dest-detail") ||
          link?.getAttribute("href");

        const element: SlideElement = {
          id: `link_${pageNo}_${index}`,
          type: "link",
          pageNo,
          style: elementStyle,
          content: destDetail || "",
          defaultValue: container.textContent || "",
          rawHTML: container.outerHTML,
          ctmRelated: {
            ctm,
            ictm,
            originalCoords,
          },
        };

        page.elements.push(element);
      } else {
        // Статические элементы (фон, декоративные)
        const element: SlideElement = {
          id: `static_${pageNo}_${index}`,
          type: "static",
          pageNo,
          style: elementStyle,
          rawHTML: container.outerHTML,
          ctmRelated: {
            ctm,
            ictm,
            originalCoords,
          },
        };

        page.elements.push(element);
      }
    });

    pages.push(page);
  });

  return pages;
}

// React компонент для парсинга HTML
export const HTMLTemplateParser: React.FC<HTMLTemplateParserProps> = ({
  htmlContent,
  onParsed,
  className,
}) => {
  React.useEffect(() => {
    if (htmlContent) {
      try {
        const parsedPages = parseHTMLTemplate(htmlContent);
        onParsed(parsedPages);
      } catch (error) {
        console.error("Error parsing HTML template:", error);
      }
    }
  }, [htmlContent, onParsed]);

  return (
    <div className={className} style={{ display: "none" }}>
      {/* Скрытый контейнер для парсинга */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default HTMLTemplateParser;
