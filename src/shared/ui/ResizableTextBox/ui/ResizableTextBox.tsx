import React, { useState, useRef, useCallback, useEffect } from "react";
import { TextToolbar } from "@/shared/ui/TextToolbar";

interface ResizableTextBoxProps {
  children: React.ReactNode;
  isSelected: boolean;
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
  onResize,
  onMove,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const updateToolbarPosition = useCallback(() => {
    if (boxRef.current && isSelected) {
      const rect = boxRef.current.getBoundingClientRect();

      // Простое позиционирование: точно над элементом, по центру
      const x = rect.left + rect.width / 2;
      const y = rect.top - 70; // 70px выше элемента

      console.log("Toolbar position:", { x, y, rect });
      setToolbarPosition({ x, y });
    }
  }, [isSelected]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelected) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
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

      if (isDragging) {
        // Handle element movement - in a real implementation, you would update the element's position
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        onMove?.(deltaX, deltaY);
        updateToolbarPosition();
      }

      if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = initialDimensions.width;
        let newHeight = initialDimensions.height;

        // Calculate new dimensions based on resize direction
        switch (resizeDirection) {
          case "se": // bottom-right
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(30, initialDimensions.height + deltaY);
            break;
          case "sw": // bottom-left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newHeight = Math.max(30, initialDimensions.height + deltaY);
            break;
          case "ne": // top-right
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(30, initialDimensions.height - deltaY);
            break;
          case "nw": // top-left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newHeight = Math.max(30, initialDimensions.height - deltaY);
            break;
          case "e": // right
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            break;
          case "w": // left
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            break;
          case "n": // top
            newHeight = Math.max(30, initialDimensions.height - deltaY);
            break;
          case "s": // bottom
            newHeight = Math.max(30, initialDimensions.height + deltaY);
            break;
        }

        // Get slide container bounds to limit resizing within slide
        const slideContainer = boxRef.current.closest(
          '[class*="w-[759px]"], [class*="w-[640px]"]'
        );
        if (slideContainer) {
          const slideRect = slideContainer.getBoundingClientRect();
          const boxRect = boxRef.current.getBoundingClientRect();
          const maxWidth =
            slideRect.width - (boxRect.left - slideRect.left) - 20; // 20px margin
          const maxHeight =
            slideRect.height - (boxRect.top - slideRect.top) - 20; // 20px margin

          newWidth = Math.min(newWidth, maxWidth);
          newHeight = Math.min(newHeight, maxHeight);
        }

        // Apply the new dimensions to the element and ensure text fits
        if (boxRef.current) {
          boxRef.current.style.maxWidth = `${newWidth}px`;
          boxRef.current.style.maxHeight = `${newHeight}px`;
          boxRef.current.style.width = `${newWidth}px`;
          boxRef.current.style.height = `${newHeight}px`;
          boxRef.current.style.overflow = "hidden";
          boxRef.current.style.wordWrap = "break-word";
          boxRef.current.style.overflowWrap = "break-word";

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
        updateToolbarPosition();
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      initialDimensions,
      resizeDirection,
      onMove,
      onResize,
      updateToolbarPosition,
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

  useEffect(() => {
    updateToolbarPosition();

    // Update toolbar position on scroll or resize
    const handleUpdate = () => updateToolbarPosition();
    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isSelected, updateToolbarPosition]);

  if (!isSelected) {
    return <div ref={boxRef}>{children}</div>;
  }

  return (
    <>
      <div
        ref={boxRef}
        className="relative"
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          display: "inline-block",
          position: "relative",
          maxWidth: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflow: "visible", // Изменено с hidden на visible для видимости рамки
        }}
      >
        {children}

        {/* Selection border and handles */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-4px",
            left: "-4px",
            right: "-4px",
            bottom: "-4px",
            border: "3px solid #BBA2FE !important",
            borderRadius: "6px",
            backgroundColor: "transparent",
            zIndex: 999,
            boxSizing: "border-box",
          }}
        >
          {/* Corner resize handles */}
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-nw-resize pointer-events-auto"
            style={{ top: "-5px", left: "-5px", zIndex: 1000 }}
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-ne-resize pointer-events-auto"
            style={{ top: "-5px", right: "-5px", zIndex: 1000 }}
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-sw-resize pointer-events-auto"
            style={{ bottom: "-5px", left: "-5px", zIndex: 1000 }}
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-se-resize pointer-events-auto"
            style={{ bottom: "-5px", right: "-5px", zIndex: 1000 }}
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />

          {/* Side resize handles */}
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-w-resize pointer-events-auto"
            style={{
              top: "50%",
              left: "-5px",
              transform: "translateY(-50%)",
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-e-resize pointer-events-auto"
            style={{
              top: "50%",
              right: "-5px",
              transform: "translateY(-50%)",
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-n-resize pointer-events-auto"
            style={{
              top: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
          <div
            className="absolute w-[10px] h-[10px] bg-[#BBA2FE] rounded-sm cursor-s-resize pointer-events-auto"
            style={{
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
        </div>
      </div>

      {/* Toolbar */}
      <TextToolbar
        position={toolbarPosition}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onCopy={onCopy}
        onDelete={onDelete}
      />
    </>
  );
};
