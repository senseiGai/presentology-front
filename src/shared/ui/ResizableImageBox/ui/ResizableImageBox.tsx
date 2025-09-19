import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { ImageToolbar } from "@/shared/ui/ImageToolbar";

interface ResizableImageBoxProps {
  elementId: string;
  isSelected: boolean;
  onDelete: () => void;
}

export const ResizableImageBox: React.FC<ResizableImageBoxProps> = ({
  elementId,
  isSelected,
  onDelete,
}) => {
  const {
    getImageElement,
    updateImageElement,
    setSelectedImageElement,
    copyImageElement,
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
  const [showToolbar, setShowToolbar] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const imageElement = getImageElement(elementId);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!imageElement || !isSelected) {
        if (imageElement) {
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
        // Use initial position + delta for smooth dragging
        const newX = Math.max(
          0,
          Math.min(initialPosition.x + deltaX, slideWidth - imageElement.width)
        );
        const newY = Math.max(
          0,
          Math.min(
            initialPosition.y + deltaY,
            slideHeight - imageElement.height
          )
        );
        updateImageElement(elementId, {
          position: { x: newX, y: newY },
        });
      } else if (isResizing) {
        let newWidth = initialDimensions.width;
        let newHeight = initialDimensions.height;
        let newX = initialPosition.x;
        let newY = initialPosition.y;

        // Calculate new dimensions based on initial values + delta
        switch (resizeDirection) {
          case "se":
            newWidth = Math.max(
              50,
              Math.min(
                initialDimensions.width + deltaX,
                slideWidth - initialPosition.x
              )
            );
            newHeight = Math.max(
              50,
              Math.min(
                initialDimensions.height + deltaY,
                slideHeight - initialPosition.y
              )
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
            newWidth = Math.max(
              50,
              Math.min(
                initialDimensions.width + deltaX,
                slideWidth - initialPosition.x
              )
            );
            const targetHeightNE = initialDimensions.height - deltaY;
            newHeight = Math.max(50, targetHeightNE);

            const deltaHeightNE = initialDimensions.height - newHeight;
            newY = Math.max(0, initialPosition.y + deltaHeightNE);
            break;
          case "sw":
            const targetWidthSW = initialDimensions.width - deltaX;
            newWidth = Math.max(50, targetWidthSW);
            newHeight = Math.max(
              50,
              Math.min(
                initialDimensions.height + deltaY,
                slideHeight - initialPosition.y
              )
            );

            const deltaWidthSW = initialDimensions.width - newWidth;
            newX = Math.max(0, initialPosition.x + deltaWidthSW);
            break;
          case "e":
            newWidth = Math.max(
              50,
              Math.min(
                initialDimensions.width + deltaX,
                slideWidth - initialPosition.x
              )
            );
            break;
          case "w":
            const targetWidthW = initialDimensions.width - deltaX;
            newWidth = Math.max(50, targetWidthW);

            const deltaWidthW = initialDimensions.width - newWidth;
            newX = Math.max(0, initialPosition.x + deltaWidthW);
            break;
          case "s":
            newHeight = Math.max(
              50,
              Math.min(
                initialDimensions.height + deltaY,
                slideHeight - initialPosition.y
              )
            );
            break;
          case "n":
            const targetHeightN = initialDimensions.height - deltaY;
            newHeight = Math.max(50, targetHeightN);

            const deltaHeightN = initialDimensions.height - newHeight;
            newY = Math.max(0, initialPosition.y + deltaHeightN);
            break;
        }

        updateImageElement(elementId, {
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
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection("");
  }, []);

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
    if (!imageElement) return;
    const currentY = imageElement.position.y;
    const newY = Math.max(0, currentY - 10);
    updateImageElement(elementId, {
      position: { x: imageElement.position.x, y: newY },
    });
  };

  const handleMoveDown = () => {
    if (!imageElement) return;
    const slideHeight = 427;
    const currentY = imageElement.position.y;
    const newY = Math.min(currentY + 10, slideHeight - imageElement.height);
    updateImageElement(elementId, {
      position: { x: imageElement.position.x, y: newY },
    });
  };

  const handleCopy = () => {
    if (imageElement) {
      console.log("ResizableImageBox: Duplicating image element:", elementId);
      copyImageElement(elementId);
    }
  };

  const handleDelete = () => {
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
    console.log("Image element not found:", elementId);
    return null;
  }

  const { position, width, height, src, alt, placeholder } = imageElement;

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
        className={`absolute select-none border-[#BBA2FE] border-[1px] ${
          isSelected ? "z-[100]" : "z-10"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${width}px`,
          height: `${height}px`,
          cursor: getCursor(),
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
