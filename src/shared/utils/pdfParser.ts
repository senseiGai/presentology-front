// Динамический импорт для избежания SSR проблем
let pdfjs: any = null;

const initPdfjs = async () => {
  if (pdfjs) return pdfjs;

  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in browser environment");
  }

  try {
    // Импортируем PDF.js модуль
    const pdfjsModule = await import("pdfjs-dist");

    // Пробуем разные пути к worker файлу
    const workerPaths = [
      "/pdf.worker.min.js",
      "/pdf.worker.mjs",
      `${window.location.origin}/pdf.worker.min.js`,
      "https://unpkg.com/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs",
    ];

    let workerSrc = workerPaths[0];

    // Устанавливаем worker
    pdfjsModule.GlobalWorkerOptions.workerSrc = workerSrc;

    console.log("PDF.js loaded successfully, worker:", workerSrc);

    pdfjs = pdfjsModule;
    return pdfjs;
  } catch (error) {
    console.error("Failed to load PDF.js:", error);
    throw new Error("Failed to initialize PDF parser");
  }
};

export interface ParsedPDFFile {
  name: string;
  type: string;
  size: number;
  text: string;
}

export const parsePDFFile = async (file: File): Promise<ParsedPDFFile> => {
  try {
    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        text: "[Файл слишком большой для парсинга на клиенте. Максимальный размер: 10MB]",
      };
    }

    // Инициализируем PDF.js
    const pdfjsLib = await initPdfjs();

    // Читаем файл как ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Загружаем PDF документ
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    // Ограничиваем количество обрабатываемых страниц (максимум 50)
    const maxPages = Math.min(pdf.numPages, 50);

    if (pdf.numPages > 50) {
      fullText +=
        "[Обрабатываются только первые 50 страниц из " + pdf.numPages + "]\n\n";
    }

    // Извлекаем текст из каждой страницы
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += `Страница ${i}:\n${pageText}\n\n`;
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      text: fullText.trim() || "[Не удалось извлечь текст из PDF]",
    };
  } catch (error) {
    console.error("Ошибка при парсинге PDF:", error);

    // Более информативные сообщения об ошибках
    let errorMessage = "[Ошибка при парсинге PDF файла]";
    if (error instanceof Error) {
      if (error.message.includes("PDF parsing is only available in browser")) {
        errorMessage = "[PDF парсинг доступен только в браузере]";
      } else if (error.message.includes("Failed to initialize PDF parser")) {
        errorMessage =
          "[Не удалось загрузить PDF парсер. Попробуйте перезагрузить страницу]";
      } else if (error.message.includes("Invalid PDF")) {
        errorMessage = "[Поврежденный или недействительный PDF файл]";
      }
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      text: errorMessage,
    };
  }
};

// Проверяем, является ли файл PDF
export const isPDFFile = (file: File): boolean => {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
};
