import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { EditableText } from "@/shared/ui/EditableText";

interface Proto003TemplateProps {
  slideNumber: number;
}

export const Proto003Template: React.FC<Proto003TemplateProps> = ({
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
    text3: false,
  });

  // Позиции элементов (соответствуют slide_003.html)
  // Center the title horizontally and position it near the top
  const titlePosition = { left: 220, top: 30 }; // 720 is slide width, 680 is assumed title box width
  const baseSubtitlePosition = { left: 220, top: 230 };
  const baseText3Position = { left: 220, top: 330 };

  // Динамический расчет позиции subtitle относительно title
  const [dynamicSubtitlePosition, setDynamicSubtitlePosition] =
    React.useState(baseSubtitlePosition);
  const [dynamicText3Position, setDynamicText3Position] =
    React.useState(baseText3Position);

  React.useEffect(() => {
    if (titleRef && !isManuallyMoved.subtitle && !isManuallyMoved.title) {
      const titleHeight = titleRef.offsetHeight;
      const newSubtitleTop = titlePosition.top + titleHeight + 50;
      setDynamicSubtitlePosition({
        left: baseSubtitlePosition.left,
        top: newSubtitleTop,
      });

      const newText3Top = newSubtitleTop + 60;
      setDynamicText3Position({
        left: baseText3Position.left,
        top: newText3Top,
      });
    }
  }, [
    slideData?.title,
    titleRef,
    isManuallyMoved.title,
    isManuallyMoved.subtitle,
    isManuallyMoved.text3,
  ]);

  const subtitlePosition =
    isManuallyMoved.subtitle || isManuallyMoved.title
      ? baseSubtitlePosition
      : dynamicSubtitlePosition;

  const text3Position =
    isManuallyMoved.text3 || isManuallyMoved.title || isManuallyMoved.subtitle
      ? baseText3Position
      : dynamicText3Position;

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
        setIsManuallyMoved({ title: false, subtitle: false, text3: false });
        console.log(
          `🎨 Proto003Template - Loaded slide ${slideNumber}:`,
          currentSlideData
        );
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }
  }, [slideNumber]);

  // Принудительно создаём изображение в store для работы ResizableImageBox
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto003-image`;
    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto003Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto003 image: ${elementId}`);
    console.log(`Current slideData:`, slideData);
    console.log(`Image URL:`, imageUrl);

    // ПРИНУДИТЕЛЬНО создаем изображение с src из slideData
    if (imageUrl) {
      console.log(`🚀 Creating image element in store...`);
      usePresentationStore.setState((state: any) => {
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
                alt: "Proto003 Background Image",
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
      console.log(`✅ FORCE created proto003 image in store: ${elementId}`);
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
      selectedTextElements.forEach((elementId: string) => {
        deleteTextElement(elementId);
      });
    }
  };

  const handleTextCopy = (elementId: string) => {
    copyTextElement(elementId);
  };

  const handleTextMoveUp = (elementId: string) => {
    moveTextElementUp(elementId);
  };

  const handleTextMoveDown = (elementId: string) => {
    moveTextElementDown(elementId);
  };

  // Обработчики для области изображения
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isImageAreaSelectionMode) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startImageAreaSelection(slideNumber, x, y);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isImageAreaSelectionMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateImageAreaSelection(slideNumber, x, y);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      finishImageAreaSelection(slideNumber);
    }
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
            left: titlePosition.left,
            top: titlePosition.top,
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
              onClick={(e: any) => {
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
            left: subtitlePosition.left,
            top: subtitlePosition.top,
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
              onClick={(e: any) => {
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

      {/* Text3 - Дополнительный текст */}
      {slideData.text3 && (
        <div
          style={{
            position: "absolute",
            left: text3Position.left,
            top: text3Position.top,
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-text3`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-text3`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-text3`)}
            onMoveUp={() => {
              handleTextMoveUp(`slide-${slideNumber}-text3`);
              setIsManuallyMoved((prev) => ({ ...prev, text3: true }));
            }}
            onMoveDown={() => {
              handleTextMoveDown(`slide-${slideNumber}-text3`);
              setIsManuallyMoved((prev) => ({ ...prev, text3: true }));
            }}
          >
            <EditableText
              elementId={`slide-${slideNumber}-text3`}
              initialText={slideData.text3}
              className="text-[16px] font-normal cursor-pointer transition-colors text-white leading-relaxed drop-shadow-lg"
              onClick={(e: any) => {
                handleTextClick(
                  `slide-${slideNumber}-text3`,
                  slideData.text3,
                  e
                );
              }}
            />
          </ResizableTextBox>
        </div>
      )}

      {/* Изображение на весь слайд через ResizableImageBox */}
      {(() => {
        const imageElementId = `slide-${slideNumber}-proto003-image`;
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
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};
