import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { EditableText } from "@/shared/ui/EditableText";

interface Proto006TemplateProps {
  slideNumber: number;
}

export const Proto006Template: React.FC<Proto006TemplateProps> = ({
  slideNumber,
}) => {
  const {
    selectedTextElements,
    setSelectedTextElement,
    deleteTextElement,
    copyTextElement,
    moveTextElementUp,
    moveTextElementDown,
    selectedImageElement,
    setSelectedImageElement,
    isImageAreaSelectionMode,
    startImageAreaSelection,
    updateImageAreaSelection,
    finishImageAreaSelection,
    clearImageAreaSelection,
    getImageAreaSelection,
    // Image store functions
    addImageElement,
    updateImageElement,
    getImageElement,
    imageElements,
    deleteImageElement,
  } = usePresentationStore();

  // Получаем выделение области изображения для текущего слайда
  const imageAreaSelection = getImageAreaSelection(slideNumber);

  const [isDragging, setIsDragging] = React.useState(false);
  const [slideData, setSlideData] = React.useState<any>({
    title: "{{title}}",
    subtitle: "{{subtitle}}",
  });
  const [titleRef, setTitleRef] = React.useState<HTMLDivElement | null>(null);
  const [isManuallyMoved, setIsManuallyMoved] = React.useState({
    title: false,
    subtitle: false,
  });

  // Позиции элементов как на скриншоте
  const titlePosition = { left: 250, top: 0 }; // Заголовок по центру
  const baseSubtitlePosition = { left: 170, top: 30 }; // Подзаголовок по центру ниже

  // Позиции для трех изображений в ряд внизу слайда (200x200 каждое)
  // Равномерное распределение: (759 - 3*200) / 4 = ~40px отступы
  const imagePositions = [
    { left: 40, top: 180, width: 200, height: 200 }, // Левое изображение
    { left: 280, top: 180, width: 200, height: 200 }, // Центральное изображение
    { left: 520, top: 180, width: 200, height: 200 }, // Правое изображение
  ];

  // Динамический расчет позиции subtitle относительно title
  const getSubtitlePosition = React.useCallback(() => {
    if (!titleRef || isManuallyMoved.subtitle) {
      return baseSubtitlePosition;
    }

    const titleRect = titleRef.getBoundingClientRect();
    const slideContainer = titleRef.closest(".slide-container");
    const containerRect = slideContainer?.getBoundingClientRect();

    if (!containerRect) {
      return baseSubtitlePosition;
    }

    const titleBottom = titleRect.bottom - containerRect.top;
    return {
      left: baseSubtitlePosition.left,
      top: Math.max(titleBottom + 20, baseSubtitlePosition.top),
    };
  }, [titleRef, isManuallyMoved.subtitle, baseSubtitlePosition]);

  const subtitlePosition = getSubtitlePosition();

  // Обработчики для area selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isImageAreaSelectionMode) {
      const slideContainer = e.currentTarget as HTMLDivElement;
      const rect = slideContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDragging(true);
      startImageAreaSelection(slideNumber, x, y);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      !isImageAreaSelectionMode ||
      !isDragging ||
      !imageAreaSelection?.isSelecting
    )
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateImageAreaSelection(slideNumber, x, y);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isImageAreaSelectionMode || !isDragging) return;

    setIsDragging(false);
    finishImageAreaSelection(slideNumber);
    e.preventDefault();
    e.stopPropagation();
  };

  // Инициализация изображений для этого слайда
  React.useEffect(() => {
    const currentSlideImages = imageElements[slideNumber] || {};
    const existingImages = Object.entries(currentSlideImages);
    const existingImageCount = existingImages.length;

    // Если нет изображений, создаем три пустых изображения
    if (existingImageCount === 0) {
      imagePositions.forEach((position, index) => {
        addImageElement(
          slideNumber,
          { x: position.left, y: position.top },
          { width: position.width, height: position.height }
        );
      });
    } else {
      // Обновляем позиции существующих изображений для соответствия новой схеме
      existingImages.forEach(([elementId, imageData], index) => {
        if (index < 3 && imageData && imageData.position) {
          const targetPosition = imagePositions[index];
          const needsUpdate =
            imageData.position.x !== targetPosition.left ||
            imageData.position.y !== targetPosition.top ||
            imageData.width !== targetPosition.width ||
            imageData.height !== targetPosition.height;

          if (needsUpdate) {
            updateImageElement(elementId, slideNumber, {
              position: { x: targetPosition.left, y: targetPosition.top },
              width: targetPosition.width,
              height: targetPosition.height,
            });
          }
        }
      });
    }
  }, [slideNumber, imageElements, addImageElement, updateImageElement]);

  // Рендер изображений - всегда показываем 3 изображения в ряд
  const renderImageElements = () => {
    const currentSlideImages = imageElements[slideNumber] || {};
    const existingImages = Object.entries(currentSlideImages);

    // Создаем массив из 3 элементов
    const imagesToRender = [];

    for (let i = 0; i < 3; i++) {
      const position = imagePositions[i];
      const existingImage = existingImages[i];

      if (existingImage && existingImage[1] && existingImage[1].position) {
        // Рендерим существующее изображение
        imagesToRender.push(
          <ResizableImageBox
            key={existingImage[0]}
            elementId={existingImage[0]}
            slideNumber={slideNumber}
            isSelected={selectedImageElement === existingImage[0]}
            onDelete={() => {
              deleteImageElement(existingImage[0], slideNumber);
              setSelectedImageElement(null);
            }}
          />
        );
      } else {
        // Рендерим placeholder для будущего изображения
        imagesToRender.push(
          <div
            key={`placeholder-${i}`}
            style={{
              position: "absolute",
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
              height: `${position.height}px`,
              border: "2px dashed #ccc",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={() => {
              addImageElement(
                slideNumber,
                { x: position.left, y: position.top },
                { width: position.width, height: position.height }
              );
            }}
          ></div>
        );
      }
    }

    return imagesToRender;
  };

  return (
    <div
      className="slide-container relative w-full h-full rounded-[12px] bg-white overflow-hidden"
      style={{ width: "759px", height: "427px" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Title */}
      {slideData.title && (
        <div
          style={{
            position: "absolute",
            left: `${titlePosition.left}px`,
            top: `${titlePosition.top}px`,
            width: "400px",
            zIndex: 15,
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-title`
            )}
            onDelete={() => deleteTextElement(`slide-${slideNumber}-title`)}
            onCopy={() => copyTextElement(`slide-${slideNumber}-title`)}
            onMoveUp={() => {
              moveTextElementUp(`slide-${slideNumber}-title`);
              setIsManuallyMoved((prev) => ({ ...prev, title: true }));
            }}
            onMoveDown={() => {
              moveTextElementDown(`slide-${slideNumber}-title`);
              setIsManuallyMoved((prev) => ({ ...prev, title: true }));
            }}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-4xl font-bold text-center"
            />
          </ResizableTextBox>
        </div>
      )}

      {/* Subtitle */}
      {slideData.subtitle && (
        <div
          style={{
            position: "absolute",
            left: `${subtitlePosition.left}px`,
            top: `${subtitlePosition.top}px`,
            width: "400px",
            zIndex: 15,
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-subtitle`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-subtitle`
            )}
            onDelete={() => deleteTextElement(`slide-${slideNumber}-subtitle`)}
            onCopy={() => copyTextElement(`slide-${slideNumber}-subtitle`)}
            onMoveUp={() => {
              moveTextElementUp(`slide-${slideNumber}-subtitle`);
              setIsManuallyMoved((prev) => ({ ...prev, subtitle: true }));
            }}
            onMoveDown={() => {
              moveTextElementDown(`slide-${slideNumber}-subtitle`);
              setIsManuallyMoved((prev) => ({ ...prev, subtitle: true }));
            }}
          >
            <EditableText
              elementId={`slide-${slideNumber}-subtitle`}
              initialText={slideData.subtitle}
              className="text-xl text-center"
            />
          </ResizableTextBox>
        </div>
      )}

      {/* Images */}
      {renderImageElements()}
    </div>
  );
};
