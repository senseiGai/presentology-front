"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { TableToolbar } from "./TableToolbar";
import { EditableTableRef } from "@/features/TablePanel/ui/EditableTable";
import PlusIcon from "../../../public/icons/PlusIcon";
import GrayPlusIcon from "../../../public/icons/GrayPlusIcon";

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
  const [tableSize, setTableSize] = useState({ width: 0, height: 0 });
  const [isInternalDragging, setIsInternalDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<EditableTableRef>(null);

  const {
    getTableElement,
    updateTableElement,
    deleteTableElement,
    selectedTableElement,
    setSelectedTableElement,
  } = usePresentationStore();

  const tableData = getTableElement(elementId);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start table dragging if clicking on row/column selection buttons
    const target = e.target as HTMLElement;
    if (
      target.closest('button[draggable="true"]') || // Row/column drag buttons
      target.closest(".cursor-col-resize") || // Column resize handles
      target.closest(".cursor-row-resize") // Row resize handles
    ) {
      return;
    }

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
    if (isDragging && !isInternalDragging && containerRef.current) {
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
  }, [isDragging, dragOffset, isInternalDragging]);

  // Update table size when container changes
  useEffect(() => {
    const updateSize = () => {
      if (tableRef.current) {
        const size = tableRef.current.getTableSize();
        setTableSize(size);
      }
    };

    updateSize();

    // Update size periodically to catch resize changes
    const interval = setInterval(updateSize, 100);

    return () => {
      clearInterval(interval);
    };
  }, [children]);

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
      onDragStart={() => setIsInternalDragging(true)}
      onDragEnd={() => setIsInternalDragging(false)}
      data-table-element
    >
      {/* Table Content */}
      <div className="relative ">
        {React.isValidElement(children) &&
          React.cloneElement(children as React.ReactElement<any>, {
            ref: tableRef,
          })}
      </div>

      {isSelected && (
        <button
          onClick={() => tableRef.current?.addRow()}
          className="absolute flex items-center justify-center border-[1px] border-[#E9E9E9] h-[24px] w-[68%] shadow-xl bg-[#FFFFFF] rounded-[8px] transition-all z-20"
          style={{
            left: "45%",
            top: `${tableSize.height + 58}px`,
            transform: "translateX(-50%)",
            width: `${Math.max(120, tableSize.width * 0.68)}px`,
          }}
        >
          <GrayPlusIcon />
        </button>
      )}

      {isSelected && (
        <button
          onClick={() => tableRef.current?.addColumn()}
          className="absolute flex items-center justify-center border-[1px] border-[#E9E9E9] w-[24px] shadow-xl bg-[#FFFFFF] rounded-[8px] transition-all z-20"
          style={{
            left: `${tableSize.width + 58}px`,
            top: "50%",
            transform: "translateY(-50%)",
            height: `${Math.max(120, tableSize.height * 0.68)}px`,
          }}
        >
          <GrayPlusIcon />
        </button>
      )}

      {/* Selection border and handles - only visible when selected */}
      {isSelected && (
        <>
          {isEditing && (
            <div
              className="absolute pointer-events-auto"
              style={{
                top: "-8px",
                left: "9%",
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
        </>
      )}
    </div>
  );
};
