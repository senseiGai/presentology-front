import React, { useState, useRef, useCallback, useEffect } from "react";
import { TextToolbar } from "@/shared/ui/TextToolbar";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface ResizableTextBoxProps {
  children: React.ReactNode;
  isSelected: boolean;
  elementId: string; // Add elementId to identify the text element
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onDelete: () => void;
  onCopy: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const ResizableTextBox: React.FC<ResizableTextBoxProps> = ({
  children,
  isSelected,
  elementId,
  onResize,
  onMove,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    setTextElementPosition,
    setSelectedTextElement,
    getTextElementPosition,
    getTextElementStyle,
    updateTextElementStyle,
    selectedTextElement,
    selectedTextElements,
    deletedTextElements,
  } = usePresentationStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({
    width: 0,
    height: 0,
  });
  const boxRef = useRef<HTMLDivElement>(null);

  // Get position from store instead of local state
  const position = getTextElementPosition(elementId);
  const elementStyle = getTextElementStyle(elementId);

  // Check if element is selected (either primary or in multi-selection)
  const isElementSelected = selectedTextElements.includes(elementId);
  const isInMultiSelection = selectedTextElements.length > 1;
  const isPrimaryElement = selectedTextElement === elementId;

  // Element should show selection UI if it's in the selected elements array AND not deleted
  const shouldShowSelectionUI =
    isElementSelected && !deletedTextElements.has(elementId);

  // Debug logging
  React.useEffect(() => {
    console.log(`ResizableTextBox ${elementId}:`, {
      position,
      elementStyle: {
        x: elementStyle.x,
        y: elementStyle.y,
        rotation: elementStyle.rotation,
      },
    });
  }, [
    elementId,
    position,
    elementStyle.x,
    elementStyle.y,
    elementStyle.rotation,
  ]);

  // Force re-render when deletion status changes
  React.useEffect(() => {
    console.log(
      `ResizableTextBox ${elementId}: deletedTextElements changed:`,
      deletedTextElements.has(elementId)
    );
  }, [elementId, deletedTextElements]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      console.log(
        "ResizableTextBox handleMouseDown triggered - this should NOT handle drag anymore"
      );

      // ResizableTextBox no longer handles dragging
      // Dragging is now handled by EditableText component
      return;
    },
    [isSelected]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      if (!boxRef.current) return;

      const rect = boxRef.current.getBoundingClientRect();
      setIsResizing(true);
      setResizeDirection(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialDimensions({ width: rect.width, height: rect.height });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!boxRef.current) return;

      // Remove dragging logic - now handled by EditableText
      // Only handle resizing now
      if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = initialDimensions.width;
        let newHeight = initialDimensions.height;

        // Calculate new dimensions based on resize direction
        switch (resizeDirection) {
          case "se": // bottom-right
            newWidth = Math.max(50, initialDimensions.width + deltaX); // Минимум только для видимости
            newHeight = Math.max(20, initialDimensions.height + deltaY); // Минимум только для видимости
            break;
          case "sw": // bottom-left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newHeight = Math.max(20, initialDimensions.height + deltaY);
            break;
          case "ne": // top-right
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(20, initialDimensions.height - deltaY);
            break;
          case "nw": // top-left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newHeight = Math.max(20, initialDimensions.height - deltaY);
            break;
          case "e": // right
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            break;
          case "w": // left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            break;
          case "n": // top
            newHeight = Math.max(20, initialDimensions.height - deltaY);
            break;
          case "s": // bottom
            newHeight = Math.max(20, initialDimensions.height + deltaY);
            break;
        }

        // Simple resize bounds based on slide dimensions
        const slideWidth = 759;
        const slideHeight = 427;

        // Get current position to calculate max dimensions
        const currentPosition = getTextElementPosition(elementId);
        const maxWidth = slideWidth - currentPosition.x;
        const maxHeight = slideHeight - currentPosition.y;

        newWidth = Math.min(newWidth, Math.max(50, maxWidth)); // Маленький минимум
        newHeight = Math.min(newHeight, Math.max(20, maxHeight)); // Маленький минимум

        // Apply the new dimensions to the element and ensure text fits
        if (boxRef.current) {
          // Store the dimensions in data attributes to persist across state changes
          boxRef.current.setAttribute("data-width", newWidth.toString());
          boxRef.current.setAttribute("data-height", newHeight.toString());

          boxRef.current.style.width = `${newWidth}px`;
          boxRef.current.style.height = `${newHeight}px`;
          boxRef.current.style.maxWidth = `${newWidth}px`;
          boxRef.current.style.maxHeight = `${newHeight}px`;
          boxRef.current.style.overflow = "visible"; // Keep consistent with other states
          boxRef.current.style.wordWrap = "break-word";
          boxRef.current.style.overflowWrap = "break-word";
          boxRef.current.style.boxSizing = "border-box";

          // Apply styles to child text elements
          const textElements = boxRef.current.querySelectorAll("div");
          textElements.forEach((el) => {
            (el as HTMLElement).style.overflow = "hidden";
            (el as HTMLElement).style.wordWrap = "break-word";
            (el as HTMLElement).style.overflowWrap = "break-word";
            (el as HTMLElement).style.maxWidth = "100%";
            (el as HTMLElement).style.maxHeight = "100%";
          });
        }

        onResize?.(newWidth, newHeight);
      }
    },
    [
      isResizing,
      dragStart,
      initialDimensions,
      resizeDirection,
      onResize,
      elementId,
      getTextElementPosition,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isResizing && boxRef.current) {
      // Save the final dimensions when resizing is complete
      const rect = boxRef.current.getBoundingClientRect();
      boxRef.current.setAttribute("data-width", rect.width.toString());
      boxRef.current.setAttribute("data-height", rect.height.toString());
      console.log(
        `ResizableTextBox ${elementId}: Resize completed, saved dimensions:`,
        {
          width: rect.width,
          height: rect.height,
        }
      );
    }
    setIsResizing(false);
    setResizeDirection("");
  }, [isResizing, elementId]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Apply saved dimensions when component mounts or selection state changes
  useEffect(() => {
    if (boxRef.current) {
      const savedWidth = boxRef.current.getAttribute("data-width");
      const savedHeight = boxRef.current.getAttribute("data-height");

      console.log(`ResizableTextBox ${elementId}: Applying dimensions`, {
        savedWidth,
        savedHeight,
        shouldShowSelectionUI,
        currentRect: boxRef.current.getBoundingClientRect(),
      });

      // Only apply explicit dimensions if they were manually set through resizing
      if (savedWidth && savedHeight && isResizing) {
        boxRef.current.style.width = `${savedWidth}px`;
        boxRef.current.style.height = `${savedHeight}px`;
        boxRef.current.style.maxWidth = `${savedWidth}px`;
        boxRef.current.style.maxHeight = `${savedHeight}px`;
      } else if (!isResizing) {
        // When not resizing, let it be fit-content but preserve any manual sizes
        const rect = boxRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && savedWidth && savedHeight) {
          // Use saved dimensions if they exist and are larger than content
          const contentWidth = Math.max(rect.width, parseInt(savedWidth));
          const contentHeight = Math.max(rect.height, parseInt(savedHeight));

          boxRef.current.style.width = `${contentWidth}px`;
          boxRef.current.style.height = `${contentHeight}px`;
        }
      }
    }
  }, [shouldShowSelectionUI, elementId, isResizing]); // Re-apply when selection state changes

  // Initialize dimensions on first render
  useEffect(() => {
    if (boxRef.current) {
      const savedWidth = boxRef.current.getAttribute("data-width");
      const savedHeight = boxRef.current.getAttribute("data-height");

      if (!savedWidth || !savedHeight) {
        // Wait for content to render, then set dimensions based on content
        setTimeout(() => {
          if (boxRef.current) {
            const rect = boxRef.current.getBoundingClientRect();

            // Use content dimensions or reasonable minimums
            const contentWidth = Math.max(50, rect.width || 100);
            const contentHeight = Math.max(20, rect.height || 30);

            boxRef.current.setAttribute("data-width", contentWidth.toString());
            boxRef.current.setAttribute(
              "data-height",
              contentHeight.toString()
            );
            boxRef.current.style.width = `${contentWidth}px`;
            boxRef.current.style.height = `${contentHeight}px`;
            boxRef.current.style.maxWidth = `${contentWidth}px`;
            boxRef.current.style.maxHeight = `${contentHeight}px`;
          }
        }, 100); // Small delay to let content render
      }
    }
  }, []); // Run only once on mount

  // Don't render if element is deleted
  if (deletedTextElements.has(elementId)) {
    console.log(
      "ResizableTextBox: Element",
      elementId,
      "is deleted, not rendering"
    );
    return null;
  }

  if (!shouldShowSelectionUI) {
    return (
      <div
        ref={boxRef}
        style={{
          display: "inline-block",
          position: "absolute",
          left: `${elementStyle.x || 0}px`,
          top: `${elementStyle.y || 0}px`,
          transform: `rotate(${elementStyle.rotation || 0}deg)`,
          transformOrigin: "center",
          width: "fit-content", // Подстраиваться под контент
          height: "fit-content", // Подстраиваться под контент
          minWidth: "20px", // Очень маленький минимум
          minHeight: "16px", // Очень маленький минимум
          maxWidth: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflow: "visible",
          transition: "all 0.1s ease-out",
          zIndex: elementStyle.zIndex || 1,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            minWidth: "20px", // Маленький минимум
            minHeight: "16px", // Маленький минимум
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={boxRef}
        className="relative"
        style={{
          display: "inline-block",
          position: "absolute",
          left: `${elementStyle.x || 0}px`,
          top: `${elementStyle.y || 0}px`,
          transform: `rotate(${elementStyle.rotation || 0}deg)`,
          transformOrigin: "center",
          width: "fit-content", // Подстраиваться под контент
          height: "fit-content", // Подстраиваться под контент
          minWidth: "20px", // Очень маленький минимум
          minHeight: "16px", // Очень маленький минимум
          maxWidth: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflow: "visible",
          transition: "all 0.1s ease-out",
          zIndex: elementStyle.zIndex || 1,
          boxSizing: "border-box",
        }}
      >
        {/* Text content - completely independent */}
        <div
          style={{
            pointerEvents: "auto",
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            minWidth: "20px", // Маленький минимум
            minHeight: "16px", // Маленький минимум
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>

        {/* Selection border and handles - visible when selected */}
        {shouldShowSelectionUI && (
          <div
            className="absolute border-1 border-solid border-[#bba2fe]"
            style={{
              top: "0px",
              left: "0px",
              right: "0px",
              bottom: "0px",
              zIndex: 1,
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          >
            {/* Toolbar - only show for primary selected element, not for multi-selection */}
            {isPrimaryElement && !isInMultiSelection && (
              <div
                className="absolute pointer-events-auto"
                style={{
                  top: "-60px",
                  left: "0%",
                  zIndex: 9999999,
                }}
              >
                <TextToolbar
                  position={{ x: 0, y: 0 }}
                  elementId={elementId}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onCopy={onCopy}
                  onDelete={onDelete}
                />
              </div>
            )}
            {/* Resize handles - only show for primary selected element, not for multi-selection */}
            {
              <>
                <div
                  className="absolute bg-[#bba2fe] size-2 cursor-nw-resize pointer-events-auto"
                  style={{ top: "-4px", left: "-4px", zIndex: 1000 }}
                  onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
                />
                <div
                  className="absolute bg-[#bba2fe] size-2 cursor-ne-resize pointer-events-auto"
                  style={{ top: "-4px", right: "-4px", zIndex: 1000 }}
                  onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
                />
                <div
                  className="absolute bg-[#bba2fe] size-2 cursor-sw-resize pointer-events-auto"
                  style={{ bottom: "-4px", left: "-4px", zIndex: 1000 }}
                  onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
                />
                <div
                  className="absolute bg-[#bba2fe] size-2 cursor-se-resize pointer-events-auto"
                  style={{ bottom: "-4px", right: "-4px", zIndex: 1000 }}
                  onMouseDown={(e) => handleResizeMouseDown(e, "se")}
                />
              </>
            }
          </div>
        )}
      </div>
    </>
  );
};
