import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ResizableTextBox } from "@/shared/ui/ResizableTextBox";
import { ResizableImageBox } from "@/shared/ui/ResizableImageBox";
import { EditableText } from "@/shared/ui/EditableText";

interface Proto002TemplateProps {
  slideNumber: number;
}

export const Proto002Template: React.FC<Proto002TemplateProps> = ({
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

  // Позиции элементов
  const titlePosition = { left: -20, top: 95 };
  const subtitlePosition = { left: -20, top: 165 };
  const text2Position = { left: 20, top: 350 };

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
        console.log(
          `🎨 Proto002Template - Loaded slide ${slideNumber}:`,
          currentSlideData
        );
      } catch (error) {
        console.error("Error parsing generated presentation:", error);
      }
    }
  }, [slideNumber]);

  // Принудительно создаём изображение в store для работы ResizableImageBox
  React.useEffect(() => {
    const elementId = `slide-${slideNumber}-proto002-image`;
    const imageUrl = slideData?._images?.[0];

    console.log(`🔧 Proto002Template useEffect - Slide ${slideNumber}`);
    console.log(`🔧 Trying to create proto002 image: ${elementId}`);
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
                position: { x: 340, y: 0 }, // Позиция относительно слайда (не контейнера)
                width: 380, // Почти вся доступная ширина (720 - 430 - 10px отступ)
                height: 405, // Почти вся доступная высота (405 - 130 - 15px отступ)
                placeholder: false,
                alt: "Proto002 Image",
                zIndex: 2,
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
      console.log(`✅ FORCE created proto002 image in store: ${elementId}`);
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

  return (
    <div
      className="relative w-[720px]  h-[405px] bg-white rounded-lg shadow-lg overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* Title - полная ширина сверху */}
      {slideData.title && (
        <div
          style={{
            position: "absolute",
            left: `${titlePosition.left}px`,
            top: `${titlePosition.top}px`,
            width: "400px",
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-title`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-title`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-title`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-title`)}
            onMoveDown={() => handleTextMoveDown(`slide-${slideNumber}-title`)}
          >
            <EditableText
              elementId={`slide-${slideNumber}-title`}
              initialText={slideData.title}
              className="text-[22px] font-bold cursor-pointer transition-colors text-black leading-tight"
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

      {/* Subtitle - полная ширина под заголовком */}
      {slideData.subtitle && (
        <div
          style={{
            position: "absolute",
            left: `${subtitlePosition.left}px`,
            top: `${subtitlePosition.top}px`,
            width: "700px", // Расширили контейнер для движения влево
          }}
        >
          <ResizableTextBox
            elementId={`slide-${slideNumber}-subtitle`}
            isSelected={selectedTextElements.includes(
              `slide-${slideNumber}-subtitle`
            )}
            onDelete={handleTextDelete}
            onCopy={() => handleTextCopy(`slide-${slideNumber}-subtitle`)}
            onMoveUp={() => handleTextMoveUp(`slide-${slideNumber}-subtitle`)}
            onMoveDown={() =>
              handleTextMoveDown(`slide-${slideNumber}-subtitle`)
            }
          >
            <EditableText
              elementId={`slide-${slideNumber}-subtitle`}
              initialText={slideData.subtitle}
              className="text-[16px] font-medium cursor-pointer transition-colors text-gray-600 leading-relaxed"
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

      {/* Левая колонка с текстом (расширенная ширина) */}
      <div
        className="absolute w-[500px] h-[235px] space-y-4"
        style={{
          left: `${text2Position.left}px`,
          top: `${text2Position.top}px`,
        }}
      >
        {/* Text1 Block */}
        {slideData.text1?.t1 && (
          <div className="mb-6">
            <div className="mb-2">
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text1-title`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text1-title`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text1-title`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text1-title`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text1-title`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text1-title`}
                  initialText={slideData.text1.t1}
                  className="text-[16px] font-semibold cursor-pointer transition-colors text-black leading-tight"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text1-title`,
                      slideData.text1.t1,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            </div>

            {slideData.text1?.t2 && (
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text1-content`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text1-content`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text1-content`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text1-content`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text1-content`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text1-content`}
                  initialText={slideData.text1.t2}
                  className="text-[16px] cursor-pointer transition-colors text-gray-700 leading-relaxed"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text1-content`,
                      slideData.text1.t2,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}
          </div>
        )}

        {/* Text2 Block */}
        {slideData.text2?.t1 && (
          <div className="mb-6">
            <div className="mb-2">
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text2-title`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text2-title`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text2-title`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text2-title`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text2-title`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text2-title`}
                  initialText={slideData.text2.t1}
                  className="text-[16px] font-semibold cursor-pointer transition-colors text-black leading-tight"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text2-title`,
                      slideData.text2.t1,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            </div>

            {slideData.text2?.t2 && (
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text2-content`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text2-content`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text2-content`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text2-content`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text2-content`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text2-content`}
                  initialText={slideData.text2.t2}
                  className="text-[16px] cursor-pointer transition-colors text-gray-700 leading-relaxed"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text2-content`,
                      slideData.text2.t2,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}
          </div>
        )}

        {/* T2_Content Block */}
        {slideData.t2_content && (
          <div className="mb-6">
            <ResizableTextBox
              elementId={`slide-${slideNumber}-t2-content`}
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-t2-content`
              )}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-t2-content`)}
              onMoveUp={() =>
                handleTextMoveUp(`slide-${slideNumber}-t2-content`)
              }
              onMoveDown={() =>
                handleTextMoveDown(`slide-${slideNumber}-t2-content`)
              }
            >
              <EditableText
                elementId={`slide-${slideNumber}-t2-content`}
                initialText={slideData.t2_content}
                className="text-[16px] cursor-pointer transition-colors text-gray-700 leading-relaxed"
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-t2-content`,
                    slideData.t2_content,
                    e
                  );
                }}
              />
            </ResizableTextBox>
          </div>
        )}

        {/* Text2 as String Block (когда text2 - строка, а не объект) */}
        {typeof slideData.text2 === "string" && slideData.text2 && (
          <div className="mb-6">
            <ResizableTextBox
              elementId={`slide-${slideNumber}-text2-string`}
              isSelected={selectedTextElements.includes(
                `slide-${slideNumber}-text2-string`
              )}
              onDelete={handleTextDelete}
              onCopy={() => handleTextCopy(`slide-${slideNumber}-text2-string`)}
              onMoveUp={() =>
                handleTextMoveUp(`slide-${slideNumber}-text2-string`)
              }
              onMoveDown={() =>
                handleTextMoveDown(`slide-${slideNumber}-text2-string`)
              }
            >
              <EditableText
                elementId={`slide-${slideNumber}-text2-string`}
                initialText={slideData.text2}
                className="text-[16px] cursor-pointer transition-colors text-gray-700 leading-relaxed"
                onClick={(e) => {
                  handleTextClick(
                    `slide-${slideNumber}-text2-string`,
                    slideData.text2,
                    e
                  );
                }}
              />
            </ResizableTextBox>
          </div>
        )}

        {/* Text3 Block (если есть) */}
        {slideData.text3?.t1 && (
          <div className="mb-6">
            <div className="mb-2">
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text3-title`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text3-title`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text3-title`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text3-title`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text3-title`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text3-title`}
                  initialText={slideData.text3.t1}
                  className="text-[16px] font-semibold cursor-pointer transition-colors text-black leading-tight"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text3-title`,
                      slideData.text3.t1,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            </div>

            {slideData.text3?.t2 && (
              <ResizableTextBox
                elementId={`slide-${slideNumber}-text3-content`}
                isSelected={selectedTextElements.includes(
                  `slide-${slideNumber}-text3-content`
                )}
                onDelete={handleTextDelete}
                onCopy={() =>
                  handleTextCopy(`slide-${slideNumber}-text3-content`)
                }
                onMoveUp={() =>
                  handleTextMoveUp(`slide-${slideNumber}-text3-content`)
                }
                onMoveDown={() =>
                  handleTextMoveDown(`slide-${slideNumber}-text3-content`)
                }
              >
                <EditableText
                  elementId={`slide-${slideNumber}-text3-content`}
                  initialText={slideData.text3.t2}
                  className="text-[16px] cursor-pointer transition-colors text-gray-700 leading-relaxed"
                  onClick={(e) => {
                    handleTextClick(
                      `slide-${slideNumber}-text3-content`,
                      slideData.text3.t2,
                      e
                    );
                  }}
                />
              </ResizableTextBox>
            )}
          </div>
        )}
      </div>

      {/* Правая колонка с изображением (40% ширины) - только ResizableImageBox */}
      {/* ОТЛАДКА: проверяем условие рендера */}
      {(() => {
        console.log(`🔍 RENDER CHECK - slideData._images:`, slideData._images);
        console.log(
          `🔍 RENDER CHECK - slideData._images[0]:`,
          slideData._images?.[0]
        );
        console.log(`🔍 RENDER CHECK - full slideData:`, slideData);
        return null; // Временный return для отладки
      })()}

      {/* ПРИНУДИТЕЛЬНЫЙ РЕНДЕР ResizableImageBox для отладки - УБРАН */}

      {/* УСЛОВИЕ ИЗМЕНЕНО: рендерим если есть изображение в store */}
      {(() => {
        const imageElementId = `slide-${slideNumber}-proto002-image`;
        const storeImage = getImageElement(imageElementId, slideNumber);

        console.log(`🎯 About to render ResizableImageBox:`, {
          elementId: imageElementId,
          slideNumber: slideNumber,
          slideDataImages: slideData._images,
          storeImage: storeImage,
          shouldRender: !!storeImage,
        });

        // Рендерим если есть изображение в store (не зависит от slideData._images)
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
          }}
        />
      )}
    </div>
  );
};
