// Утилита для создания PPTX файлов из данных презентации
export interface SlideData {
  title: string;
  subtitle: string;
  text2?: string;
  text3?: string;
  _images?: string[];
}

export interface PresentationData {
  title: string;
  slides: SlideData[];
}

export const generatePPTXContent = (
  presentationData: PresentationData
): string => {
  // Базовая структура PPTX в XML формате
  const slides = presentationData.slides
    .map((slide, index) => {
      return `
      <slide${index + 1}>
        <title>${slide.title || ""}</title>
        <subtitle>${slide.subtitle || ""}</subtitle>
        ${slide.text2 ? `<text2>${slide.text2}</text2>` : ""}
        ${slide.text3 ? `<text3>${slide.text3}</text3>` : ""}
        ${
          slide._images && slide._images.length > 0
            ? `<image>${slide._images[0]}</image>`
            : ""
        }
      </slide${index + 1}>
    `;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<presentation>
  <metadata>
    <title>${presentationData.title || "Untitled Presentation"}</title>
    <created>${new Date().toISOString()}</created>
    <generator>Presentology</generator>
  </metadata>
  <slides>
    ${slides}
  </slides>
</presentation>`;
};

export const downloadPresentationAsPPTX = (
  presentationData: PresentationData
) => {
  try {
    // Пока что создаем XML файл, в будущем можно интегрировать библиотеку для создания настоящего PPTX
    const xmlContent = generatePPTXContent(presentationData);

    const blob = new Blob([xmlContent], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      presentationData.title || "presentation"
    }_${new Date().getTime()}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("Презентация успешно скачана в формате PPTX");
  } catch (error) {
    console.error("Ошибка при скачивании PPTX:", error);
  }
};

export const downloadPresentationAsHTML = (
  presentationData: PresentationData
) => {
  try {
    // Генерируем HTML версию презентации
    const htmlContent = generateHTMLContent(presentationData);

    const blob = new Blob([htmlContent], {
      type: "text/html",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      presentationData.title || "presentation"
    }_${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("Презентация успешно скачана в формате HTML");
  } catch (error) {
    console.error("Ошибка при скачивании HTML:", error);
  }
};

const generateHTMLContent = (presentationData: PresentationData): string => {
  const slides = presentationData.slides
    .map((slide, index) => {
      return `
    <div class="slide" id="slide-${index + 1}">
      <div class="slide-content">
        ${slide.title ? `<h1 class="slide-title">${slide.title}</h1>` : ""}
        ${
          slide.subtitle
            ? `<h2 class="slide-subtitle">${slide.subtitle}</h2>`
            : ""
        }
        ${slide.text2 ? `<p class="slide-text2">${slide.text2}</p>` : ""}
        ${slide.text3 ? `<p class="slide-text3">${slide.text3}</p>` : ""}
        ${
          slide._images && slide._images.length > 0
            ? `<div class="slide-image" style="background-image: url('${slide._images[0]}')"></div>`
            : ""
        }
      </div>
    </div>
    `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentationData.title || "Презентация"}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
    }
    .presentation {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .slide {
      width: 100%;
      height: 600px;
      background: white;
      margin-bottom: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }
    .slide-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .slide-title {
      font-size: 32px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .slide-subtitle {
      font-size: 20px;
      font-weight: 500;
      color: white;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .slide-text2, .slide-text3 {
      font-size: 18px;
      color: white;
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .slide-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-size: cover;
      background-position: center;
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="presentation">
    <h1 style="text-align: center; margin-bottom: 40px;">${
      presentationData.title || "Презентация"
    }</h1>
    ${slides}
  </div>
</body>
</html>`;
};
