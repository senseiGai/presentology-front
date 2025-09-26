import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { EditableText } from "@/shared/ui/EditableText";

interface Proto007TemplateProps {
  slideNumber: number;
}

export const Proto007Template: React.FC<Proto007TemplateProps> = ({
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
    getImageElement,
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

  // Убираем неиспользуемые переменные позиционирования

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
          `🎨 Proto007Template - Loaded slide ${slideNumber}:`,
          currentSlideData
        );
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }
  }, [slideNumber]);

  // Принудительно создаём изображение в store для работы ResizableImageBox
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto007-image`;
    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto007Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto007 image: ${elementId}`);
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
                width: 759, // Вся ширина слайда
                height: 427, // Вся высота слайда
                placeholder: false,
                alt: "Proto007 Background Image",
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
      console.log(`✅ FORCE created proto007 image in store: ${elementId}`);
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
      <div className="relative w-[759px] h-[427px] bg-white rounded-lg shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Нет данных для слайда
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-[759px] h-[427px] bg-white rounded-lg shadow-lg overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {(() => {
        const imageElementId = `slide-${slideNumber}-proto007-image`;
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
      {/* Белый блок для фона текста - уменьшаем z-index чтобы не мешал */}
      <div
        className="absolute w-[90%] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white h-[150px] z-1"
        style={{ pointerEvents: "none" }}
      ></div>

      {slideData.title && (
        <div
          ref={setTitleRef}
          style={{
            position: "absolute",
            left: 280,
            top: 106,
            zIndex: 20, // Увеличиваем z-index для title
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
              className="text-[42px] font-bold cursor-pointer transition-colors text-blue-600 leading-tight"
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

      {/* Subtitle - обычное позиционирование без трансформаций */}
      {slideData.subtitle && (
        <div
          className=""
          style={{
            position: "absolute",
            left: 230,
            top: 140,
            zIndex: 20,
          }}
        >
          <ResizableTextBox
            minWidth={300}
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
              className="text-[24px] font-medium cursor-pointer transition-colors text-gray-800 leading-relaxed"
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
