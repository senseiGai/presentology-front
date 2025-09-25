import React from "react";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface TitleSlideTemplateProps {
  slideNumber: number;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export const TitleSlideTemplate: React.FC<TitleSlideTemplateProps> = ({
  slideNumber,
  title = "Заголовок презентации",
  subtitle = "Подзаголовок или описание",
  backgroundImage,
}) => {
  const {
    selectedTextElement,
    setSelectedTextElement,
    selectedImageElement,
    setSelectedImageElement,
    getTextElementContent,
    deleteTextElement,
    copyTextElement,
  } = usePresentationStore();

  const titleElementId = `slide-${slideNumber}-title`;
  const subtitleElementId = `slide-${slideNumber}-subtitle`;
  const backgroundImageElementId = `slide-${slideNumber}-background-image`;

  return (
    <div className="relative w-[759px] h-[427px] bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
      {/* Фоновое изображение */}
      <div className="absolute inset-0">
        <ResizableImageBox
          elementId={backgroundImageElementId}
          slideNumber={slideNumber}
          isSelected={selectedImageElement === backgroundImageElementId}
          onDelete={() => {}}
        />
      </div>

      {/* Заголовок */}
      <div className="absolute top-[50px] left-[50px]">
        <ResizableTextBox
          elementId={titleElementId}
          isSelected={selectedTextElement === titleElementId}
          onDelete={() => deleteTextElement(titleElementId)}
          onCopy={() => copyTextElement(titleElementId)}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
        >
          <div
            onClick={() => setSelectedTextElement(titleElementId)}
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#000000",
              fontFamily: "Arial, sans-serif",
              textAlign: "left",
              lineHeight: "1.2",
              padding: "8px",
              cursor: "text",
              outline: "none",
              border: "none",
              background: "transparent",
              wordWrap: "break-word",
              overflow: "hidden",
              minWidth: "400px",
              minHeight: "60px",
            }}
            contentEditable={selectedTextElement === titleElementId}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              // Здесь можно добавить логику сохранения изменений
              const newText = e.currentTarget.textContent || "";
              console.log(`Title changed: ${newText}`);
            }}
          >
            {getTextElementContent(titleElementId) || title}
          </div>
        </ResizableTextBox>
      </div>

      {/* Подзаголовок */}
      <div className="absolute top-[140px] left-[50px]">
        <ResizableTextBox
          elementId={subtitleElementId}
          isSelected={selectedTextElement === subtitleElementId}
          onDelete={() => deleteTextElement(subtitleElementId)}
          onCopy={() => copyTextElement(subtitleElementId)}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
        >
          <div
            onClick={() => setSelectedTextElement(subtitleElementId)}
            style={{
              fontSize: "24px",
              fontWeight: "normal",
              color: "#333333",
              fontFamily: "Arial, sans-serif",
              textAlign: "left",
              lineHeight: "1.4",
              padding: "8px",
              cursor: "text",
              outline: "none",
              border: "none",
              background: "transparent",
              wordWrap: "break-word",
              overflow: "hidden",
              minWidth: "300px",
              minHeight: "40px",
            }}
            contentEditable={selectedTextElement === subtitleElementId}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              // Здесь можно добавить логику сохранения изменений
              const newText = e.currentTarget.textContent || "";
              console.log(`Subtitle changed: ${newText}`);
            }}
          >
            {getTextElementContent(subtitleElementId) || subtitle}
          </div>
        </ResizableTextBox>
      </div>

      {/* Декоративное изображение справа (как в оригинале) */}
      <div
        className="absolute right-0 top-0 w-[400px] h-full bg-cover bg-center opacity-80"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 427">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#E8D5FF;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#FFE5F1;stop-opacity:1" />
                </linearGradient>
              </defs>
              <path d="M100 50 Q200 20 300 50 Q350 100 320 200 Q280 350 200 380 Q100 350 80 250 Q90 150 100 50 Z" 
                    fill="url(#grad1)" opacity="0.6"/>
              <circle cx="150" cy="150" r="30" fill="#DDD6FE" opacity="0.8"/>
              <circle cx="250" cy="250" r="20" fill="#FECACA" opacity="0.8"/>
              <path d="M50 300 Q150 280 250 300 Q300 320 280 360 Q200 400 120 380 Q50 360 50 300 Z" 
                    fill="#F3E8FF" opacity="0.6"/>
            </svg>
          `)})`,
        }}
      />
    </div>
  );
};

export default TitleSlideTemplate;
