"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { TableToolbar } from "./TableToolbar/ui/TableToolbar";
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
    // Don't start table dragging if clicking on specific interactive elements
    const target = e.target as HTMLElement;

    // Skip dragging only for very specific elements that need their own interaction
    if (
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("button:not(.table-drag-handle)") ||
      target.closest(".resize-handle") ||
      target.closest(".column-resize") ||
      target.closest(".row-resize")
    ) {
      return;
    }

    // Always select table when clicking on it
    setSelectedTableElement(elementId);

    // Only start dragging if clicking on table-drag-handle areas
    if (target.closest(".table-drag-handle") || target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();

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

        const newX = e.clientX - slideRect.left - dragOffset.x;
        const newY = e.clientY - slideRect.top - dragOffset.y;

        // No constraints - allow free movement
        // User can position table anywhere within or even slightly outside the slide

        // Get current table data (either from store or default)
        const currentData = getTableElement(elementId) || {
          id: elementId,
          position: { x: 50, y: 250 },
          data: [
            [
              { id: "1-1", content: "Header 1", rowIndex: 0, colIndex: 0 },
              { id: "1-2", content: "Header 2", rowIndex: 0, colIndex: 1 },
              { id: "1-3", content: "Header 3", rowIndex: 0, colIndex: 2 },
            ],
            [
              { id: "2-1", content: "Data 1", rowIndex: 1, colIndex: 0 },
              { id: "2-2", content: "Data 2", rowIndex: 1, colIndex: 1 },
              { id: "2-3", content: "Data 3", rowIndex: 1, colIndex: 2 },
            ],
            [
              { id: "3-1", content: "Data 4", rowIndex: 2, colIndex: 0 },
              { id: "3-2", content: "Data 5", rowIndex: 2, colIndex: 1 },
              { id: "3-3", content: "Data 6", rowIndex: 2, colIndex: 2 },
            ],
          ],
          columnWidths: [120, 120, 120],
        };

        // Update position in store
        updateTableElement(elementId, {
          ...currentData,
          position: { x: newX, y: newY },
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

  // Ensure we always have table data - use store data or create default
  const defaultTableData = {
    id: elementId,
    position: { x: 50, y: 250 },
    data: [
      [
        { id: "1-1", content: "Header 1", rowIndex: 0, colIndex: 0 },
        { id: "1-2", content: "Header 2", rowIndex: 0, colIndex: 1 },
        { id: "1-3", content: "Header 3", rowIndex: 0, colIndex: 2 },
      ],
      [
        { id: "2-1", content: "Data 1", rowIndex: 1, colIndex: 0 },
        { id: "2-2", content: "Data 2", rowIndex: 1, colIndex: 1 },
        { id: "2-3", content: "Data 3", rowIndex: 1, colIndex: 2 },
      ],
      [
        { id: "3-1", content: "Data 4", rowIndex: 2, colIndex: 0 },
        { id: "3-2", content: "Data 5", rowIndex: 2, colIndex: 1 },
        { id: "3-3", content: "Data 6", rowIndex: 2, colIndex: 2 },
      ],
      [
        { id: "4-1", content: "Data 7", rowIndex: 3, colIndex: 0 },
        { id: "4-2", content: "Data 8", rowIndex: 3, colIndex: 1 },
        { id: "4-3", content: "Data 9", rowIndex: 3, colIndex: 2 },
      ],
    ],
    columnWidths: [120, 120, 120],
  };

  const currentTableData = tableData || defaultTableData;

  useEffect(() => {
    if (!tableData) {
      updateTableElement(elementId, defaultTableData);
    }
  }, [elementId, tableData]);

  return (
    <div
      ref={containerRef}
      className={`absolute select-none ${
        isDragging ? "cursor-move" : "cursor-pointer"
      } ${isSelected ? "z-[100]" : "z-10"}`}
      style={{
        left: currentTableData.position.x,
        top: currentTableData.position.y,
      }}
      onMouseDown={handleMouseDown}
      data-table-element
    >
      {/* Table Content */}
      <div className="relative">
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
