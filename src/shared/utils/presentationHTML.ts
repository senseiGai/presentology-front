// Утилиты для генерации HTML контента презентаций

export interface Slide {
  title: string;
  bullets?: string[];
  content?: string;
  images?: string[];
  notes?: string;
}

export interface PresentationTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const themes: Record<string, PresentationTheme> = {
  professional: {
    name: "Профессиональный",
    primaryColor: "#2d3748",
    secondaryColor: "#4a5568",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#2d3748",
    accentColor: "#667eea",
  },
  modern: {
    name: "Современный",
    primaryColor: "#1a202c",
    secondaryColor: "#2d3748",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#1a202c",
    accentColor: "#3182ce",
  },
  creative: {
    name: "Креативный",
    primaryColor: "#553c9a",
    secondaryColor: "#805ad5",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#553c9a",
    accentColor: "#ed64a6",
  },
  minimalist: {
    name: "Минималистичный",
    primaryColor: "#2d3748",
    secondaryColor: "#4a5568",
    backgroundColor: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    textColor: "#2d3748",
    accentColor: "#4299e1",
  },
};

export const generatePresentationHTML = (
  slides: Slide[],
  title: string,
  themeName: string = "professional"
): string => {
  const theme = themes[themeName] || themes.professional;

  const slidesHTML = slides
    .map((slide, index) => {
      const bullets =
        slide.bullets?.map((bullet: string) => `<li>${bullet}</li>`).join("") ||
        "";

      const images =
        slide.images
          ?.map(
            (imageUrl: string) =>
              `<img src="${imageUrl}" alt="Slide image" class="slide-image" />`
          )
          .join("") || "";

      return `
      <div class="slide" data-slide="${index + 1}">
        <div class="slide-number">${index + 1}</div>
        <div class="slide-content">
          <h2 class="slide-title">${slide.title}</h2>
          ${
            slide.content
              ? `<div class="slide-text">${slide.content}</div>`
              : ""
          }
          ${bullets ? `<ul class="slide-bullets">${bullets}</ul>` : ""}
          ${images ? `<div class="slide-images">${images}</div>` : ""}
          ${slide.notes ? `<div class="slide-notes">${slide.notes}</div>` : ""}
        </div>
      </div>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background: ${theme.backgroundColor};
          color: ${theme.textColor};
          line-height: 1.6;
        }
        
        .presentation {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .presentation-header {
          text-align: center;
          margin-bottom: 40px;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .presentation-title {
          font-size: 3em;
          font-weight: 800;
          color: ${theme.primaryColor};
          margin-bottom: 20px;
          line-height: 1.2;
        }
        
        .presentation-meta {
          font-size: 1.1em;
          color: ${theme.secondaryColor};
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        
        .slide {
          background: white;
          border-radius: 16px;
          padding: 50px;
          margin-bottom: 40px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          position: relative;
          border-left: 6px solid ${theme.accentColor};
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .slide:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .slide-number {
          position: absolute;
          top: 20px;
          right: 20px;
          background: ${theme.accentColor};
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1em;
        }
        
        .slide-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 20px;
        }
        
        .slide-title {
          font-size: 2.8em;
          font-weight: 700;
          color: ${theme.primaryColor};
          margin-bottom: 30px;
          line-height: 1.2;
          text-align: center;
        }
        
        .slide-text {
          font-size: 1.3em;
          line-height: 1.8;
          color: ${theme.secondaryColor};
          margin-bottom: 30px;
          text-align: center;
        }
        
        .slide-bullets {
          list-style: none;
          padding: 0;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .slide-bullets li {
          font-size: 1.4em;
          line-height: 1.8;
          margin-bottom: 20px;
          padding-left: 40px;
          position: relative;
          color: ${theme.secondaryColor};
          background: ${
            theme.backgroundColor.includes("gradient")
              ? "rgba(255,255,255,0.5)"
              : "#f8f9fa"
          };
          padding: 15px 15px 15px 50px;
          border-radius: 12px;
          margin-bottom: 15px;
          border-left: 4px solid ${theme.accentColor};
        }
        
        .slide-bullets li:before {
          content: "→";
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.accentColor};
          font-weight: bold;
          font-size: 1.3em;
        }
        
        .slide-images {
          margin: 30px 0;
          text-align: center;
        }
        
        .slide-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          margin: 10px;
        }
        
        .slide-notes {
          margin-top: auto;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
          font-size: 1em;
          color: ${theme.secondaryColor};
          font-style: italic;
        }
        
        /* Адаптивность */
        @media print {
          .slide {
            page-break-after: always;
            margin-bottom: 0;
            box-shadow: none;
            transform: none;
          }
          
          .slide:hover {
            transform: none;
            box-shadow: none;
          }
        }
        
        @media (max-width: 768px) {
          .presentation {
            padding: 10px;
          }
          
          .presentation-header {
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .presentation-title {
            font-size: 2em;
          }
          
          .presentation-meta {
            flex-direction: column;
            gap: 10px;
          }
          
          .slide {
            padding: 25px;
            margin-bottom: 20px;
            min-height: 400px;
          }
          
          .slide-title {
            font-size: 2em;
          }
          
          .slide-bullets li {
            font-size: 1.2em;
            padding: 12px 12px 12px 40px;
          }
          
          .slide-bullets li:before {
            left: 15px;
          }
          
          .slide-text {
            font-size: 1.1em;
          }
        }
        
        @media (max-width: 480px) {
          .slide-title {
            font-size: 1.6em;
          }
          
          .slide-bullets li {
            font-size: 1.1em;
            padding: 10px 10px 10px 35px;
          }
          
          .slide-bullets li:before {
            left: 12px;
            font-size: 1.1em;
          }
        }
        
        /* Анимации */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .slide:nth-child(even) {
          animation-delay: 0.1s;
        }
        
        .slide:nth-child(odd) {
          animation-delay: 0.2s;
        }
        
        /* Дополнительные стили для лучшего восприятия */
        .highlight {
          background: linear-gradient(120deg, ${theme.accentColor}33 0%, ${
    theme.accentColor
  }33 100%);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .divider {
          width: 100px;
          height: 4px;
          background: ${theme.accentColor};
          margin: 30px auto;
          border-radius: 2px;
        }
      </style>
    </head>
    <body>
      <div class="presentation">
        <div class="presentation-header">
          <h1 class="presentation-title">${title}</h1>
          <div class="presentation-meta">
            <span>📊 ${slides.length} слайдов</span>
            <span>🕒 ${Math.ceil(slides.length * 2)} мин</span>
            <span>🎨 ${theme.name}</span>
            <span>📅 ${new Date().toLocaleDateString("ru-RU")}</span>
          </div>
        </div>
        ${slidesHTML}
      </div>
    </body>
    </html>
  `;
};

// Функция для генерации thumbnail (превью) презентации
export const generatePresentationThumbnail = (
  title: string,
  slideCount: number
): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg)" rx="12"/>
      <rect x="20" y="20" width="260" height="120" fill="white" rx="8" opacity="0.95"/>
      <text x="150" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2d3748">
        ${title.length > 25 ? title.substring(0, 25) + "..." : title}
      </text>
      <text x="150" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#4a5568">
        ${slideCount} слайдов
      </text>
      <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#718096">
        Создано с ИИ
      </text>
      <circle cx="260" cy="170" r="15" fill="white" opacity="0.8"/>
      <text x="260" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#667eea">
        AI
      </text>
    </svg>
  `)}`;
};
