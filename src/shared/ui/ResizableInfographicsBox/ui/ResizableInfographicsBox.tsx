import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface ResizableInfographicsBoxProps {
  elementId: string;
  isSelected: boolean;
  onDelete: () => void;
  slideNumber: number;
}

export const ResizableInfographicsBox: React.FC<
  ResizableInfographicsBoxProps
> = ({ elementId, isSelected, onDelete, slideNumber }) => {
  const {
    getInfographicsElement,
    updateInfographicsElement,
    setSelectedInfographicsElement,
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

  const infographicsElement = getInfographicsElement(slideNumber, elementId);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!infographicsElement) return;

      // Если элемент не выбран, выбираем его
      if (!isSelected) {
        setSelectedInfographicsElement(elementId);
        setShowToolbar(true);
        return; // Возвращаемся, чтобы при следующем клике можно было перетаскивать
      }

      e.preventDefault();
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = infographicsElement;

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
        width: infographicsElement.width,
        height: infographicsElement.height,
      });
      setInitialPosition({
        x: infographicsElement.position.x,
        y: infographicsElement.position.y,
      });
    },
    [isSelected, elementId, infographicsElement, setSelectedInfographicsElement]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!isDragging && !isResizing) || !infographicsElement) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Slide boundaries
      const slideWidth = 759;
      const slideHeight = 427;

      if (isDragging) {
        // Use initial position + delta for smooth dragging
        const newX = Math.max(
          0,
          Math.min(
            initialPosition.x + deltaX,
            slideWidth - infographicsElement.width
          )
        );
        const newY = Math.max(
          0,
          Math.min(
            initialPosition.y + deltaY,
            slideHeight - infographicsElement.height
          )
        );
        updateInfographicsElement(slideNumber, elementId, {
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

        updateInfographicsElement(slideNumber, elementId, {
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
      initialPosition,
      initialDimensions,
      resizeDirection,
      infographicsElement,
      slideNumber,
      elementId,
      updateInfographicsElement,
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

  // Early return after all hooks
  if (!infographicsElement) {
    return null;
  }

  const { dataUrl, svgContent, position, width, height } = infographicsElement;

  const getCursor = () => {
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

  const handleCopy = () => {
    // TODO: Implement copy functionality for infographics
    console.log("Copy infographics element:", elementId);
  };

  const handleMoveUp = () => {
    // TODO: Implement move up functionality for infographics
    console.log("Move up infographics element:", elementId);
  };

  const handleMoveDown = () => {
    // TODO: Implement move down functionality for infographics
    console.log("Move down infographics element:", elementId);
  };

  const handleDelete = () => {
    onDelete();
    setShowToolbar(false);
  };

  // Render SVG content
  const renderContent = () => {
    const content = dataUrl || svgContent;
    if (!content) return null;

    // Handle base64 SVG
    if (content.startsWith("data:image/svg+xml;base64,")) {
      return (
        <img
          src={content}
          alt="Infographic"
          className="w-full h-full object-contain"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
          }}
          onLoad={() => console.log("SVG image loaded successfully")}
          onError={(e) => console.error("SVG image failed to load:", e)}
        />
      );
    }

    // Handle other data:image/svg+xml formats
    if (content.startsWith("data:image/svg+xml")) {
      return (
        <img
          src={content}
          alt="Infographic"
          className="w-full h-full object-contain"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
          onLoad={() => console.log("SVG data URL loaded successfully")}
          onError={(e) => console.error("SVG data URL failed to load:", e)}
        />
      );
    }

    // Handle raw SVG HTML - convert to data URL
    if (content.includes("<svg")) {
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(
        unescape(encodeURIComponent(content))
      )}`;

      return (
        <img
          src={svgDataUrl}
          alt="Infographic"
          className="w-full h-full object-contain"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
          }}
          onLoad={() => console.log("SVG from raw HTML loaded successfully")}
          onError={(e) => console.error("SVG from raw HTML failed to load:", e)}
        />
      );
    }

    // Handle other images
    if (content.startsWith("data:image/")) {
      return (
        <img
          src={content}
          alt="Infographic"
          className="w-full h-full object-contain"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
          onLoad={() => console.log("Generic image loaded successfully")}
          onError={(e) => console.error("Generic image failed to load:", e)}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* Infographics Element */}
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
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            setSelectedInfographicsElement(elementId);
          }
        }}
        data-infographics-element={elementId}
      >
        {/* Content */}
        <div
          className={`w-full h-full border-[1px] overflow-hidden ${
            isSelected ? "border-[#BBA2FE]" : "border-[#BBA2FE]"
          } bg-white rounded-lg`}
        >
          {renderContent()}
        </div>

        {/* Selection border and resize handles */}
        {isSelected && (
          <>
            <div className="absolute w-2 h-2 bg-[#BBA2FE] -top-1 -left-1 cursor-nw-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE] -top-1 -right-1 cursor-ne-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE] -bottom-1 -left-1 cursor-sw-resize" />
            <div className="absolute w-2 h-2 bg-[#BBA2FE] -bottom-1 -right-1 cursor-se-resize" />
          </>
        )}

        {/* Delete button */}
        {isSelected && (
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};
