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
    getTextElementPosition,
    getTextElementStyle,
    updateTextElementStyle,
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
            newWidth = Math.max(100, initialDimensions.width + deltaX); // Increased minimum
            newHeight = Math.max(50, initialDimensions.height + deltaY); // Increased minimum
            break;
          case "sw": // bottom-left
            newWidth = Math.max(100, initialDimensions.width - deltaX);
            newHeight = Math.max(50, initialDimensions.height + deltaY);
            break;
          case "ne": // top-right
            newWidth = Math.max(100, initialDimensions.width + deltaX);
            newHeight = Math.max(50, initialDimensions.height - deltaY);
            break;
          case "nw": // top-left
            newWidth = Math.max(100, initialDimensions.width - deltaX);
            newHeight = Math.max(50, initialDimensions.height - deltaY);
            break;
          case "e": // right
            newWidth = Math.max(100, initialDimensions.width + deltaX);
            break;
          case "w": // left
            newWidth = Math.max(100, initialDimensions.width - deltaX);
            break;
          case "n": // top
            newHeight = Math.max(50, initialDimensions.height - deltaY);
            break;
          case "s": // bottom
            newHeight = Math.max(50, initialDimensions.height + deltaY);
            break;
        }

        // Simple resize bounds based on slide dimensions
        const slideWidth = 759;
        const slideHeight = 427;

        // Get current position to calculate max dimensions
        const currentPosition = getTextElementPosition(elementId);
        const maxWidth = slideWidth - currentPosition.x;
        const maxHeight = slideHeight - currentPosition.y;

        newWidth = Math.min(newWidth, Math.max(100, maxWidth)); // Updated minimum
        newHeight = Math.min(newHeight, Math.max(50, maxHeight)); // Updated minimum

        // Apply the new dimensions to the element and ensure text fits
        if (boxRef.current) {
          boxRef.current.style.maxWidth = `${newWidth}px`;
          boxRef.current.style.maxHeight = `${newHeight}px`;
          boxRef.current.style.width = `${newWidth}px`;
          boxRef.current.style.height = `${newHeight}px`;
          boxRef.current.style.overflow = "hidden";
          boxRef.current.style.wordWrap = "break-word";
          boxRef.current.style.overflowWrap = "break-word";
          boxRef.current.style.boxSizing = "border-box"; // Include padding and borders

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
    setIsResizing(false);
    setResizeDirection("");
  }, []);

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

  if (!isSelected) {
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
          transition: "all 0.1s ease-out",
          zIndex: elementStyle.zIndex || 1,
          minWidth: "100px", // Same minimum sizes
          minHeight: "50px",
          maxWidth: "100%",
          overflow: "hidden", // Prevent overflow in non-selected state too
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
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
          minWidth: "100px", // Minimum width for the box
          minHeight: "50px", // Minimum height for the box
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
            width: "100%", // Fill the ResizableTextBox width
            height: "100%", // Fill the ResizableTextBox height
            minWidth: "50px",
            minHeight: "30px",
            overflow: "hidden", // Prevent content from spilling out
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>

        {/* Selection border and handles - only visible when selected */}
        {isSelected && (
          <div
            className="absolute border border-[#bba2fe] border-solid"
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
            {" "}
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
            {/* Resize handles */}
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
          </div>
        )}
      </div>
    </>
  );
};
