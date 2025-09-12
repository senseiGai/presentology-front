"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { TableToolbar } from "./TableToolbar";

interface ResizableTableProps {
  elementId: string;
  isSelected: boolean;
  isEditing?: boolean; // Add isEditing prop
  onDelete?: () => void;
  onCopy?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
}

export const ResizableTable: React.FC<ResizableTableProps> = ({
  elementId,
  isSelected,
  isEditing = false, // Default to false
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    getTableElement,
    updateTableElement,
    deleteTableElement,
    selectedTableElement,
    setSelectedTableElement,
  } = usePresentationStore();

  const tableData = getTableElement(elementId);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".table-drag-handle")
    ) {
      e.preventDefault();
      e.stopPropagation();

      setSelectedTableElement(elementId);
      setIsDragging(true);

      const rect = containerRef.current!.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const slideContainer = containerRef.current.closest(".slide-container");
      if (slideContainer) {
        const slideRect = slideContainer.getBoundingClientRect();
        const tableRect = containerRef.current.getBoundingClientRect();

        const newX = e.clientX - slideRect.left - dragOffset.x;
        const newY = e.clientY - slideRect.top - dragOffset.y;

        // Calculate slide boundaries (759x427 is the slide size)
        const slideWidth = 759;
        const slideHeight = 427;
        const tableWidth = tableRect.width;
        const tableHeight = tableRect.height;

        // Constrain position within slide boundaries
        const constrainedX = Math.max(
          0,
          Math.min(newX, slideWidth - tableWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, slideHeight - tableHeight)
        );

        // Update position in store
        updateTableElement(elementId, {
          ...tableData,
          position: { x: constrainedX, y: constrainedY },
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!tableData) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute ${isDragging ? "cursor-move" : "cursor-pointer"} ${
        isSelected ? "z-[100]" : "z-10"
      }`}
      style={{
        left: tableData.position.x,
        top: tableData.position.y,
      }}
      onMouseDown={handleMouseDown}
      data-table-element
    >
      {/* Table Content */}
      <div className="relative ">{children}</div>

      {/* Selection border and handles - only visible when selected */}
      {isSelected && (
        <div
          className="absolute border border-[#bba2fe] rounded-[8px] border-solid"
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
          {/* Toolbar - only show when editing */}
          {isEditing && (
            <div
              className="absolute pointer-events-auto"
              style={{
                top: "-60px",
                left: "0%",
                zIndex: 9999999,
              }}
            >
              <TableToolbar
                position={{ x: 0, y: 0 }}
                elementId={elementId}
                onMoveUp={onMoveUp || (() => {})}
                onMoveDown={onMoveDown || (() => {})}
                onCopy={onCopy || (() => {})}
                onDelete={onDelete || (() => {})}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
