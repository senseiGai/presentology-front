"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ImageToolbar } from "@/shared/ui/ImageToolbar";

interface ResizableImageBoxProps {
  elementId: string;
  slideNumber: number;
  isSelected: boolean;
  onDelete: () => void;
}

export const ResizableImageBox: React.FC<ResizableImageBoxProps> = ({
  elementId,
  slideNumber,
  isSelected,
  onDelete,
}) => {
  const {
    getImageElement,
    updateImageElement,
    setSelectedImageElement,
    copyImageElement,
    addToHistory,
  } = usePresentationStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [initialPosition, setInitialPosition] = useState({
    x: 0,
    y: 0,
  });
  const [initialDragPosition, setInitialDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null); // For history tracking
  const [showToolbar, setShowToolbar] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // ПРИНУДИТЕЛЬНЫЙ ЛОГ в начале
  console.log(
    `🚀 ResizableImageBox START for elementId: ${elementId}, slideNumber: ${slideNumber}`
  );

  const imageElement = getImageElement(elementId, slideNumber);

  // Временный лог для отладки proto002
  if (elementId.includes("proto002")) {
    console.log(
      `🎯 ResizableImageBox called for ${elementId} on slide ${slideNumber}, imageElement:`,
      imageElement
    );

    // Также проверим store напрямую
    const directStoreCheck =
      usePresentationStore.getState().imageElements[slideNumber]?.[elementId];
    console.log(`🔍 Direct store check for ${elementId}:`, directStoreCheck);

    if (imageElement) {
      console.log(`✅ Image element found:`, {
        src: imageElement.src,
        position: imageElement.position,
        width: imageElement.width,
        height: imageElement.height,
        placeholder: imageElement.placeholder,
      });
    } else {
      console.log(
        `❌ Image element NOT found for ${elementId} on slide ${slideNumber}`
      );
      console.log(
        `📦 All slide images:`,
        usePresentationStore.getState().imageElements[slideNumber]
      );
    }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!imageElement || !isSelected) {
        if (imageElement) {
          console.log("Selecting image element:", elementId);
          setSelectedImageElement(elementId);
          setShowToolbar(true);
        }
        return;
      }

      e.preventDefault();
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = imageElement;

      // Check if clicking on resize handles
      const handleSize = 8;
      const isRightEdge = x >= width - handleSize;
      const isBottomEdge = y >= height - handleSize;
      const isLeftEdge = x <= handleSize;
      const isTopEdge = y <= handleSize;

      if (isRightEdge && isBottomEdge) {
        setIsResizing(true);
        setResizeDirection("se");
      } else if (isLeftEdge && isTopEdge) {
        setIsResizing(true);
        setResizeDirection("nw");
      } else if (isRightEdge && isTopEdge) {
        setIsResizing(true);
        setResizeDirection("ne");
      } else if (isLeftEdge && isBottomEdge) {
        setIsResizing(true);
        setResizeDirection("sw");
      } else if (isRightEdge) {
        setIsResizing(true);
        setResizeDirection("e");
      } else if (isBottomEdge) {
        setIsResizing(true);
        setResizeDirection("s");
      } else if (isLeftEdge) {
        setIsResizing(true);
        setResizeDirection("w");
      } else if (isTopEdge) {
        setIsResizing(true);
        setResizeDirection("n");
      } else {
        setIsDragging(true);
        // Save initial position for history tracking
        setInitialDragPosition({
          x: imageElement.position.x,
          y: imageElement.position.y,
        });
      }

      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialDimensions({
        width: imageElement.width,
        height: imageElement.height,
      });
      setInitialPosition({
        x: imageElement.position.x,
        y: imageElement.position.y,
      });
    },
    [isSelected, elementId, imageElement, setSelectedImageElement]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!isDragging && !isResizing) || !imageElement) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Slide boundaries
      const slideWidth = 759;
      const slideHeight = 427;

      if (isDragging) {
        // Calculate new position with slide boundary constraints
        const newX = initialPosition.x + deltaX;
        const newY = initialPosition.y + deltaY;

        // Constrain within slide boundaries (759x427)
        const minX = 0;
        const maxX = slideWidth - imageElement.width;
        const minY = 0;
        const maxY = slideHeight - imageElement.height;

        const boundedX = Math.max(minX, Math.min(maxX, newX));
        const boundedY = Math.max(minY, Math.min(maxY, newY));

        updateImageElement(elementId, slideNumber, {
          position: { x: boundedX, y: boundedY },
        });
      } else if (isResizing) {
        let newWidth = initialDimensions.width;
        let newHeight = initialDimensions.height;
        let newX = initialPosition.x;
        let newY = initialPosition.y;

        // Calculate new dimensions based on initial values + delta
        switch (resizeDirection) {
          case "se":
            const maxWidthSE = slideWidth - initialPosition.x;
            const maxHeightSE = slideHeight - initialPosition.y;
            newWidth = Math.max(
              50,
              Math.min(initialDimensions.width + deltaX, maxWidthSE)
            );
            newHeight = Math.max(
              50,
              Math.min(initialDimensions.height + deltaY, maxHeightSE)
            );
            break;
          case "nw":
            const targetWidth = initialDimensions.width - deltaX;
            const targetHeight = initialDimensions.height - deltaY;

            newWidth = Math.max(50, targetWidth);
            newHeight = Math.max(50, targetHeight);

            // Calculate new position
            const deltaWidth = initialDimensions.width - newWidth;
            const deltaHeight = initialDimensions.height - newHeight;

            newX = Math.max(0, initialPosition.x + deltaWidth);
            newY = Math.max(0, initialPosition.y + deltaHeight);
            break;
          case "ne":
            const maxWidthNE = slideWidth - initialPosition.x;
            newWidth = Math.max(
              50,
              Math.min(initialDimensions.width + deltaX, maxWidthNE)
            );
            const targetHeightNE = initialDimensions.height - deltaY;
            newHeight = Math.max(50, targetHeightNE);

            const deltaHeightNE = initialDimensions.height - newHeight;
            newY = Math.max(0, initialPosition.y + deltaHeightNE);
            break;
          case "sw":
            const targetWidthSW = initialDimensions.width - deltaX;
            newWidth = Math.max(50, targetWidthSW);
            newHeight = Math.max(50, initialDimensions.height + deltaY);

            const deltaWidthSW = initialDimensions.width - newWidth;
            newX = Math.max(0, initialPosition.x + deltaWidthSW);
            break;
          case "e":
            const maxWidthE = slideWidth - initialPosition.x;
            newWidth = Math.max(
              50,
              Math.min(initialDimensions.width + deltaX, maxWidthE)
            );
            break;
          case "w":
            const targetWidthW = initialDimensions.width - deltaX;
            newWidth = Math.max(50, targetWidthW);

            const deltaWidthW = initialDimensions.width - newWidth;
            newX = Math.max(0, initialPosition.x + deltaWidthW);
            break;
          case "s":
            const maxHeightS = slideHeight - initialPosition.y;
            newHeight = Math.max(
              50,
              Math.min(initialDimensions.height + deltaY, maxHeightS)
            );
            break;
          case "n":
            const targetHeightN = initialDimensions.height - deltaY;
            newHeight = Math.max(50, targetHeightN);

            const deltaHeightN = initialDimensions.height - newHeight;
            newY = Math.max(0, initialPosition.y + deltaHeightN);
            break;
        }

        updateImageElement(elementId, slideNumber, {
          width: newWidth,
          height: newHeight,
          position: { x: newX, y: newY },
        });
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      imageElement,
      initialDimensions,
      initialPosition,
      resizeDirection,
      elementId,
      updateImageElement,
    ]
  );

  const handleMouseUp = useCallback(() => {
    // If we were dragging an image and have initial position, record the change
    if (isDragging && initialDragPosition && imageElement) {
      const currentPosition = {
        x: imageElement.position.x,
        y: imageElement.position.y,
      };

      // Only record if position actually changed
      if (
        currentPosition.x !== initialDragPosition.x ||
        currentPosition.y !== initialDragPosition.y
      ) {
        addToHistory({
          type: "image_position",
          elementId,
          slideNumber,
          previousValue: initialDragPosition,
          newValue: currentPosition,
          timestamp: Date.now(),
        });
        console.log("📝 Recorded image position change in history:", {
          elementId,
          slideNumber,
          from: initialDragPosition,
          to: currentPosition,
        });
      }
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection("");
    setInitialDragPosition(null);
  }, [
    isDragging,
    initialDragPosition,
    imageElement,
    elementId,
    slideNumber,
    addToHistory,
  ]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Show/hide toolbar based on selection
  useEffect(() => {
    setShowToolbar(isSelected);
  }, [isSelected]);

  // Handle toolbar actions
  const handleMoveUp = () => {
    console.log("ResizableImageBox: Move Up called for:", elementId);
    usePresentationStore.getState().moveImageElementUp(elementId, slideNumber);
  };

  const handleMoveDown = () => {
    console.log("ResizableImageBox: Move Down called for:", elementId);
    usePresentationStore
      .getState()
      .moveImageElementDown(elementId, slideNumber);
  };

  const handleCopy = () => {
    if (imageElement) {
      console.log("ResizableImageBox: Duplicating image element:", elementId);
      const newId = copyImageElement(elementId, slideNumber);
      console.log("ResizableImageBox: Copy completed, new element ID:", newId);
    } else {
      console.log(
        "ResizableImageBox: No image element found for copying:",
        elementId
      );
    }
  };

  const handleDelete = () => {
    console.log("ResizableImageBox: Deleting image element:", elementId);
    onDelete();
  };

  const getCursor = () => {
    if (!isSelected) return "pointer";
    if (isDragging) return "grabbing";
    if (isResizing) {
      switch (resizeDirection) {
        case "nw":
        case "se":
          return "nw-resize";
        case "ne":
        case "sw":
          return "ne-resize";
        case "n":
        case "s":
          return "ns-resize";
        case "e":
        case "w":
          return "ew-resize";
        default:
          return "grab";
      }
    }
    return "grab";
  };

  // Check if imageElement exists AFTER all hooks have been called
  if (!imageElement) {
    console.log(
      "❌ Image element not found:",
      elementId,
      "slideNumber:",
      slideNumber
    );
    // Проверим что есть в store для этого слайда
    const allSlideImages =
      usePresentationStore.getState().imageElements[slideNumber];
    console.log("📦 All images for slide", slideNumber, ":", allSlideImages);
    return null;
  }

  const { position, width, height, src, alt, placeholder } = imageElement;

  // Check if position exists
  if (!position) {
    console.log("Image position not found for element:", elementId);
    return null;
  }

  // Calculate toolbar position
  const toolbarPosition = {
    x: position.x,
    y: position.y - 50, // Position toolbar above the image
  };

  return (
    <>
      {/* Toolbar */}
      {showToolbar && (
        <div
          className="absolute"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y - 8}px`,
            zIndex: 10000,
          }}
        >
          <ImageToolbar
            position={toolbarPosition}
            elementId={elementId}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onCopy={handleCopy}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Image Element */}
      <div
        ref={boxRef}
        className="absolute select-none border-[#BBA2FE] border-[1px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${width}px`,
          height: `${height}px`,
          cursor: getCursor(),
          zIndex: imageElement.zIndex || 2,
        }}
        onMouseDown={handleMouseDown}
        data-image-element={elementId}
      >
        {/* Image content */}
        <div
          className={`w-full h-full border-[1px] overflow-hidden ${
            isSelected ? "border-[#BBA2FE]" : "border-[#BBA2FE]"
          } ${
            placeholder
              ? "bg-[#BBA2FE] opacity-[10%] flex items-center justify-center"
              : ""
          }`}
          style={{
            backgroundImage: src && !placeholder ? `url(${src})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* ОТЛАДОЧНЫЙ ЛОГ прямо перед рендером изображения */}
          {(() => {
            if (elementId.includes("proto002")) {
              console.log(`🖼️ IMAGE RENDER CHECK:`, {
                elementId,
                src,
                placeholder,
                shouldRenderImg: src && !placeholder,
                backgroundImage:
                  src && !placeholder ? `url(${src})` : undefined,
              });
            }
            return null;
          })()}

          {src && !placeholder && (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Selection border and resize handles */}
        {isSelected && (
          <>
            <div className="absolute w-2 h-2 bg-[#BBA2FE]  -top-1 -left-1 cursor-nw-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE] -top-1 -right-1 cursor-ne-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE]  -bottom-1 -left-1 cursor-sw-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE]  -bottom-1 -right-1 cursor-se-resize" />
          </>
        )}
      </div>
    </>
  );
};
