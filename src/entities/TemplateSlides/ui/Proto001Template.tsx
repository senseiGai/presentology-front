import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { EditableText } from "@/shared/ui/EditableText";

interface Proto001TemplateProps {
  slideNumber: number;
}

export const Proto001Template: React.FC<Proto001TemplateProps> = ({
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
    getImageElement,
    imageElements, // Добавляем для отслеживания изменений
  } = usePresentationStore();

  // Получаем выделение области изображения для текущего слайда
  const imageAreaSelection = getImageAreaSelection(slideNumber);

  const [isDragging, setIsDragging] = React.useState(false);
  const [slideData, setSlideData] = React.useState<any>(null);
  const [titleRef, setTitleRef] = React.useState<HTMLDivElement | null>(null);
  const [isManuallyMoved, setIsManuallyMoved] = React.useState({
    title: false,
    subtitle: false,
  });

  // Позиции элементов
  const titlePosition = { left: -20, top: -20 };
  const baseSubtitlePosition = { left: -20, top: 230 };

  // Динамический расчет позиции subtitle относительно title
  const [dynamicSubtitlePosition, setDynamicSubtitlePosition] =
    React.useState(baseSubtitlePosition);

  React.useEffect(() => {
    if (titleRef && !isManuallyMoved.subtitle && !isManuallyMoved.title) {
      const titleHeight = titleRef.offsetHeight;
      const newSubtitleTop = titlePosition.top + titleHeight + 50; // 20px отступ
      setDynamicSubtitlePosition({
        left: baseSubtitlePosition.left,
        top: newSubtitleTop,
      });
    }
  }, [
    slideData?.title,
    titleRef,
    isManuallyMoved.title,
    isManuallyMoved.subtitle,
  ]);

  const subtitlePosition =
    isManuallyMoved.subtitle || isManuallyMoved.title
      ? baseSubtitlePosition
      : dynamicSubtitlePosition;

  // Загружаем данные слайда
  React.useEffect(() => {
    const generatedPresentationStr = localStorage.getItem(
      "generatedPresentation"
    );
    if (generatedPresentationStr) {
      try {
        const generatedPresentation = JSON.parse(generatedPresentationStr);
        const currentSlideData =
          generatedPresentation.data?.slides?.[slideNumber - 1];
        setSlideData(currentSlideData);
        // Сбрасываем состояние ручного перемещения при смене слайда
        setIsManuallyMoved({ title: false, subtitle: false });
        console.log(
          `🎨 Proto001Template - Loaded slide ${slideNumber}:`,
          currentSlideData
        );
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }
  }, [slideNumber]);

  // Принудительно создаём изображение в store для работы ResizableImageBox
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto001-image`;
    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto001Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto001 image: ${elementId}`);
    console.log(`Current slideData:`, slideData);
    console.log(`Image URL:`, imageUrl);

    // ПРИНУДИТЕЛЬНО создаем изображение с src из slideData
    if (imageUrl) {
      console.log(`🚀 Creating image element in store...`);
      usePresentationStore.setState((state) => {
        console.log(`📦 Current state before update:`, {
          slideImages: state.imageElements[slideNumber],
          allImages: Object.keys(state.imageElements),
        });

        const newState = {
          imageElements: {
            ...state.imageElements,
            [slideNumber]: {
              ...(state.imageElements[slideNumber] || {}),
              [elementId]: {
                id: elementId,
                position: { x: 0, y: 0 }, // Позиция на весь слайд
                width: 720, // Вся ширина слайда
                height: 405, // Вся высота слайда
                placeholder: false,
                alt: "Proto001 Background Image",
                zIndex: 1,
                src: imageUrl, // Устанавливаем src для показа в ResizableImageBox
              },
            },
          },
        };

        console.log(`📦 New state after update:`, {
          slideImages: newState.imageElements[slideNumber],
          elementToCreate: newState.imageElements[slideNumber][elementId],
        });

        return newState;
      });
      console.log(`✅ FORCE created proto001 image in store: ${elementId}`);
    } else {
      console.log(`❌ No image URL found for slide ${slideNumber}`);
    }

    // Проверим, что изображение создалось
    setTimeout(() => {
      console.log(`🔍 Verification phase - checking created image...`);
      // ИСПРАВЛЯЕМ ПОРЯДОК ПАРАМЕТРОВ: elementId, slideNumber
      const createdImage = getImageElement(elementId, slideNumber);
      console.log(`🔍 getImageElement result:`, createdImage);

      // Проверим весь store
      const allImages = usePresentationStore.getState().imageElements;
      console.log(`📦 Full store state:`, allImages);
      console.log(`📦 Current slide images:`, allImages[slideNumber]);
      console.log(
        `📦 Images for slide ${slideNumber}:`,
        allImages[slideNumber]
      );
      console.log(
        `📦 Specific image ${elementId}:`,
        allImages[slideNumber]?.[elementId]
      );

      // Добавим лог когда ResizableImageBox пытается получить изображение
      console.log(
        `🎯 ResizableImageBox should now find: ${elementId} on slide ${slideNumber}`
      );

      if (!createdImage) {
        console.error(`❌ CRITICAL: Image not found after creation!`);
      } else {
        console.log(`✅ SUCCESS: Image found after creation!`);
      }
    }, 100);
  }, [slideNumber, slideData, getImageElement]);

  // Обработчики для текста
  const handleTextClick = (
    elementId: string,
    currentText: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedTextElement(elementId);
  };

  const handleTextDelete = () => {
    // Используем selectedTextElements для удаления
    if (selectedTextElements.length > 0) {
      selectedTextElements.forEach((elementId) => {
        deleteTextElement(elementId);
      });
    }
  };

  const handleTextCopy = (elementId: string) => {
    const newElementId = copyTextElement(elementId, slideNumber);
    if (newElementId && newElementId !== elementId) {
      setSelectedTextElement(newElementId);
    }
  };

  const handleTextMoveUp = (elementId: string) => {
    moveTextElementUp(elementId);
  };

  const handleTextMoveDown = (elementId: string) => {
    moveTextElementDown(elementId);
  };

  // Обработчики для выделения области изображения
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImageAreaSelectionMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    startImageAreaSelection(slideNumber, x, y);
    e.preventDefault();
    e.stopPropagation();
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

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      finishImageAreaSelection(slideNumber);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isImageAreaSelectionMode && imageAreaSelection) {
      e.preventDefault();
      e.stopPropagation();
      clearImageAreaSelection(slideNumber);
    }
  };

  if (!slideData) {
    return (
      <div className="relative w-[720px] h-[405px] bg-white rounded-lg shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Нет данных для слайда
        </div>
      </div>
    );
  }

  // Получаем URL изображения для фона
  const backgroundImage = slideData._images?.[0];

  return (
    <div
      className="relative w-[720px] h-[405px] bg-white rounded-lg shadow-lg overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* Title */}
      {slideData.title && (
        <div
          ref={setTitleRef}
          style={{
            position: "absolute",
            left: `${titlePosition.left}px`,
            top: `${titlePosition.top}px`,
            width: "600px",
            zIndex: 15,
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-title`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => {
              handleTextMoveUp(`slide-${slideNumber}-title`);
              setIsManuallyMoved((prev) => ({ ...prev, title: true }));
            }}
            onMoveDown={() => {
              handleTextMoveDown(`slide-${slideNumber}-title`);
              setIsManuallyMoved((prev) => ({ ...prev, title: true }));
            }}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-[32px] font-bold cursor-pointer transition-colors text-white leading-tight drop-shadow-lg"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-title`,
                  slideData.title,
                  e
                );
              }}
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
            width: "600px",
            zIndex: 15,
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-subtitle`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-subtitle`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-subtitle`)}
            onMoveUp={() => {
              handleTextMoveUp(`slide-${slideNumber}-subtitle`);
              setIsManuallyMoved((prev) => ({ ...prev, subtitle: true }));
            }}
            onMoveDown={() => {
              handleTextMoveDown(`slide-${slideNumber}-subtitle`);
              setIsManuallyMoved((prev) => ({ ...prev, subtitle: true }));
            }}
          >
            <EditableText
              elementId={`slide-${slideNumber}-subtitle`}
              initialText={slideData.subtitle}
              className="text-[20px] font-medium cursor-pointer transition-colors text-white leading-relaxed drop-shadow-lg"
              onClick={(e) => {
                handleTextClick(
                  `slide-${slideNumber}-subtitle`,
                  slideData.subtitle,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      )}

      {/* Изображение на весь слайд через ResizableImageBox */}
      {(() => {
        const imageElementId = `slide-${slideNumber}-proto001-image`;
        const storeImage = getImageElement(imageElementId, slideNumber);

        console.log(`🎯 About to render ResizableImageBox:`, {
          elementId: imageElementId,
          slideNumber: slideNumber,
          slideDataImages: slideData._images,
          storeImage: storeImage,
          shouldRender: !!storeImage,
        });

        // Рендерим если есть изображение в store
        if (storeImage) {
          return (
            <ResizableImageBox
              elementId={imageElementId}
              slideNumber={slideNumber}
              isSelected={selectedImageElement === imageElementId}
              onDelete={() => {
                setSelectedImageElement(null);
              }}
            />
          );
        }
        return null;
      })()}

      {/* Выделение области изображения */}
      {isImageAreaSelectionMode && imageAreaSelection && (
        <div
          style={{
            position: "absolute",
            left: imageAreaSelection.startX,
            top: imageAreaSelection.startY,
            width: Math.abs(
              imageAreaSelection.endX - imageAreaSelection.startX
            ),
            height: Math.abs(
              imageAreaSelection.endY - imageAreaSelection.startY
            ),
            border: "2px dashed #007acc",
            backgroundColor: "rgba(0, 122, 204, 0.1)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}
    </div>
  );
};
