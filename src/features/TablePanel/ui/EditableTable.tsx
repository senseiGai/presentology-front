"use client";

import React, { useState, useRef, useEffect } from "react";
import { TableToolbar } from "@/shared/ui/TableToolbar";

// Types
interface TableCell {
  id: string;
  content: string;
  rowIndex: number;
  colIndex: number;
}

interface TableData {
  id: string;
  rows: number;
  cols: number;
  cells: TableCell[][];
  style?: {
    borderThickness: number;
    borderColor: string;
    textColor: string;
    fontSize: number;
    textAlign: "left" | "center" | "right";
    textFormats: string[];
  };
}

interface EditableTableProps {
  initialData?: TableData;
  onTableChange?: (data: TableData) => void;
  onEditingChange?: (isEditing: boolean) => void; // Add callback for editing state
  onTableSelect?: () => void; // Add callback for table selection
  className?: string;
  elementId?: string;
  onDelete?: () => void;
  onCopy?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

interface DragPreview {
  type: "row" | "column";
  index: number;
  targetIndex?: number;
  isVisible: boolean;
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  initialData,
  onTableChange,
  onEditingChange,
  onTableSelect,
  className = "",
  elementId = `table-${Date.now()}`,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown,
}) => {
  // Initialize table data
  const [tableData, setTableData] = useState<TableData>(() => {
    if (initialData) return initialData;

    // Create default 4x3 table to match Figma design with "Label" text
    const defaultCells: TableCell[][] = [];
    for (let row = 0; row < 4; row++) {
      defaultCells[row] = [];
      for (let col = 0; col < 3; col++) {
        defaultCells[row][col] = {
          id: `cell-${row}-${col}`,
          content: "Label",
          rowIndex: row,
          colIndex: col,
        };
      }
    }

    return {
      id: `table-${Date.now()}`,
      rows: 4,
      cols: 3,
      cells: defaultCells,
      style: {
        borderThickness: 1,
        borderColor: "#BBA2FE",
        textColor: "#0B0911",
        fontSize: 14,
        textAlign: "left",
        textFormats: [],
      },
    };
  });

  // Update table data when initialData changes (from store updates)
  useEffect(() => {
    if (initialData) {
      setTableData(initialData);
    }
  }, [initialData]);

  // UI state
  const [isHovered, setIsHovered] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [hoverRowButton, setHoverRowButton] = useState<number | null>(null);
  const [hoverColButton, setHoverColButton] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview>({
    type: "row",
    index: 0,
    isVisible: false,
  });
  const [tooltip, setTooltip] = useState<Tooltip>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle cell editing
  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting when clicking on cells
    setEditingCell({ row, col });
    setSelectedCell({ row, col });
    onTableSelect?.(); // Select the table when cell is clicked
  };

  const handleCellContentChange = (
    row: number,
    col: number,
    content: string
  ) => {
    const newCells = [...tableData.cells];
    newCells[row][col] = {
      ...newCells[row][col],
      content,
    };

    const newTableData = {
      ...tableData,
      cells: newCells,
    };

    setTableData(newTableData);
    onTableChange?.(newTableData);
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    row: number,
    col: number
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setEditingCell(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const nextCol = col + 1;
      const nextRow = nextCol >= tableData.cols ? row + 1 : row;
      const finalCol = nextCol >= tableData.cols ? 0 : nextCol;

      if (nextRow < tableData.rows) {
        setEditingCell({ row: nextRow, col: finalCol });
        setSelectedCell({ row: nextRow, col: finalCol });
      } else {
        setEditingCell(null);
      }
    }
  };

  // Handle table selection
  const handleSelectAllTable = () => {
    setSelectedCell(null);
    setEditingCell(null);
    console.log("Select all table");
  };

  // Tooltip handling
  const showTooltip = (text: string, x: number, y: number) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({
        text,
        x,
        y,
        visible: true,
      });
    }, 500);
  };

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setTooltip({ ...tooltip, visible: false });
  };

  // Handle row/column dragging
  const handleDragStart = (
    e: React.DragEvent,
    type: "row" | "column",
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", `${type}-${index}`);
    setDragPreview({
      type,
      index,
      isVisible: true,
    });
  };

  const handleDragOver = (
    e: React.DragEvent,
    type: "row" | "column",
    targetIndex: number
  ) => {
    e.preventDefault();
    setDragPreview((prev) => ({
      ...prev,
      targetIndex,
    }));
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "row" | "column",
    targetIndex: number
  ) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData("text/plain");
    const [dragType, dragIndexStr] = dragData.split("-");
    const dragIndex = parseInt(dragIndexStr);

    if (dragType === type && dragIndex !== targetIndex) {
      const newCells = [...tableData.cells];

      if (type === "row") {
        // Move row
        const rowToMove = newCells.splice(dragIndex, 1)[0];
        newCells.splice(targetIndex, 0, rowToMove);

        // Update row indices
        newCells.forEach((row, rowIndex) => {
          row.forEach((cell) => {
            cell.rowIndex = rowIndex;
          });
        });
      } else {
        // Move column
        newCells.forEach((row) => {
          const cellToMove = row.splice(dragIndex, 1)[0];
          row.splice(targetIndex, 0, cellToMove);

          // Update column indices
          row.forEach((cell, colIndex) => {
            cell.colIndex = colIndex;
          });
        });
      }

      const newTableData = {
        ...tableData,
        cells: newCells,
      };

      setTableData(newTableData);
      onTableChange?.(newTableData);
    }

    setDragPreview({ type: "row", index: 0, isVisible: false });
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Notify parent about editing state changes
  useEffect(() => {
    const isEditing = editingCell !== null || selectedCell !== null;
    onEditingChange?.(isEditing);
  }, [editingCell, selectedCell, onEditingChange]);

  // Cleanup tooltip on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to get dynamic styles
  const getBorderStyle = () => {
    const thickness = tableData.style?.borderThickness || 1;
    const color = tableData.style?.borderColor || "#BBA2FE";
    return {
      borderWidth: `${thickness}px`,
      borderColor: color,
    };
  };

  const getTextStyle = () => {
    const style = tableData.style;
    return {
      color: style?.textColor || "#0B0911",
      fontSize: `${style?.fontSize || 14}px`,
      textAlign: style?.textAlign || "left",
      fontWeight: style?.textFormats?.includes("bold") ? "bold" : "normal",
      fontStyle: style?.textFormats?.includes("italic") ? "italic" : "normal",
      textDecoration: style?.textFormats?.includes("underline")
        ? "underline"
        : "none",
    } as React.CSSProperties;
  };

  // Helper function to get cell border style based on position
  const getCellBorderStyle = (row: number, col: number) => {
    const thickness = tableData.style?.borderThickness || 1;
    const color = tableData.style?.borderColor || "#BBA2FE";

    // Determine which borders to show based on cell position
    let borderWidths = "0px";

    if (row === 0 && col === 0) {
      // Top-left corner
      borderWidths = `${thickness}px ${thickness}px 0px`;
    } else if (row === 0 && col === tableData.cols - 1) {
      // Top-right corner
      borderWidths = `${thickness}px ${thickness}px 0px`;
    } else if (row === tableData.rows - 1 && col === 0) {
      // Bottom-left corner
      borderWidths = `0px ${thickness}px ${thickness}px`;
    } else if (row === tableData.rows - 1 && col === tableData.cols - 1) {
      // Bottom-right corner
      borderWidths = `0px ${thickness}px ${thickness}px`;
    } else if (row === 0) {
      // Top row (middle)
      borderWidths = `${thickness}px ${thickness}px 0px`;
    } else if (row === tableData.rows - 1) {
      // Bottom row (middle)
      borderWidths = `0px ${thickness}px ${thickness}px`;
    } else if (col === 0) {
      // Left column (middle)
      borderWidths = `0px ${thickness}px`;
    } else if (col === tableData.cols - 1) {
      // Right column (middle)
      borderWidths = `0px ${thickness}px`;
    } else {
      // Middle cells
      borderWidths = `0px ${thickness}px`;
    }

    return {
      borderWidth: borderWidths,
      borderColor: color,
    };
  };

  return (
    <div className={`relative ${className}`}>
      {/* Table Container - Exact Figma design */}
      <div
        ref={tableRef}
        className="relative bg-[#FBFBFB] rounded-[8px] w-[363px] h-[212px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverRowButton(null);
          setHoverColButton(null);
          hideTooltip();
        }}
      >
        <div
          className="absolute border-solid inset-0 rounded-[8px] cursor-move table-drag-handle"
          style={getBorderStyle()}
        />
        {editingCell && (
          <>
            <div
              className="absolute left-[-4px] w-2 h-2 top-[-4px] cursor-move table-drag-handle"
              style={{
                backgroundColor: tableData.style?.borderColor || "#BBA2FE",
              }}
            />
            <div
              className="absolute bottom-[-4px] left-[-4px] w-2 h-2 cursor-move table-drag-handle"
              style={{
                backgroundColor: tableData.style?.borderColor || "#BBA2FE",
              }}
            />
            <div
              className="absolute right-[-4px] w-2 h-2 top-[-4px] cursor-move table-drag-handle"
              style={{
                backgroundColor: tableData.style?.borderColor || "#BBA2FE",
              }}
            />
            <div
              className="absolute bottom-[-4px] right-[-4px] w-2 h-2 cursor-move table-drag-handle"
              style={{
                backgroundColor: tableData.style?.borderColor || "#BBA2FE",
              }}
            />
          </>
        )}

        {/* {isHovered && (
          <button
            className="absolute -top-10 -left-10 px-3 py-1 bg-black text-white text-xs rounded shadow-lg z-10 transition-all hover:bg-gray-800 whitespace-nowrap"
            onClick={handleSelectAllTable}
            onMouseEnter={(e) =>
              showTooltip("Выделить таблицу", e.clientX, e.clientY)
            }
            onMouseLeave={hideTooltip}
          >
            Выделить таблицу
          </button>
        )} */}

        {/* Table Content - 3 columns */}
        <div className="absolute box-border flex h-[212px] items-center justify-start left-0 pl-0 pr-px py-0 top-0 w-[363px]">
          {/* Column 1 */}
          <div className="basis-0 box-border flex flex-col grow h-full items-start justify-start min-h-px min-w-px mr-[-1px] relative shrink-0">
            {/* Row 1 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-tl-[8px] shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(0, 0, e)}
              >
                {editingCell?.row === 0 && editingCell?.col === 0 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[0]?.[0]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(0, 0, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 0, 0)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[0]?.[0]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none rounded-tl-[8px]"
                style={getCellBorderStyle(0, 0)}
              />
            </div>

            {/* Row 2 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-2.5 pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(1, 0, e)}
              >
                {editingCell?.row === 1 && editingCell?.col === 0 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[1]?.[0]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(1, 0, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 1, 0)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[1]?.[0]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(1, 0)}
              />
            </div>

            {/* Row 3 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(2, 0, e)}
              >
                {editingCell?.row === 2 && editingCell?.col === 0 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[2]?.[0]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(2, 0, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 2, 0)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[2]?.[0]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(2, 0)}
              />
            </div>

            {/* Row 4 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative rounded-bl-[8px] shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(3, 0, e)}
              >
                {editingCell?.row === 3 && editingCell?.col === 0 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[3]?.[0]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(3, 0, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 3, 0)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[3]?.[0]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none rounded-bl-[8px]"
                style={getCellBorderStyle(3, 0)}
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="basis-0 box-border flex flex-col grow h-full items-start justify-start min-h-px min-w-px mr-[-1px] relative shrink-0">
            {/* Row 1 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(0, 1, e)}
              >
                {editingCell?.row === 0 && editingCell?.col === 1 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[0]?.[1]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(0, 1, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 0, 1)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[0]?.[1]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(0, 1)}
              />
            </div>

            {/* Row 2 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-2.5 pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(1, 1, e)}
              >
                {editingCell?.row === 1 && editingCell?.col === 1 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[1]?.[1]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(1, 1, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 1, 1)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[1]?.[1]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(1, 1)}
              />
            </div>

            {/* Row 3 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(2, 1, e)}
              >
                {editingCell?.row === 2 && editingCell?.col === 1 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[2]?.[1]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(2, 1, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 2, 1)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[2]?.[1]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(2, 1)}
              />
            </div>

            {/* Row 4 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(3, 1, e)}
              >
                {editingCell?.row === 3 && editingCell?.col === 1 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[3]?.[1]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(3, 1, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 3, 1)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[3]?.[1]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(3, 1)}
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="basis-0 box-border flex flex-col grow h-full items-start justify-start min-h-px min-w-px mr-[-1px] relative shrink-0">
            {/* Row 1 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-tr-[8px] shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(0, 2, e)}
              >
                {editingCell?.row === 0 && editingCell?.col === 2 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[0]?.[2]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(0, 2, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 0, 2)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[0]?.[2]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none rounded-tr-[8px]"
                style={getCellBorderStyle(0, 2)}
              />
            </div>

            {/* Row 2 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-2.5 pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(1, 2, e)}
              >
                {editingCell?.row === 1 && editingCell?.col === 2 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[1]?.[2]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(1, 2, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 1, 2)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[1]?.[2]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(1, 2)}
              />
            </div>

            {/* Row 3 - White */}
            <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(2, 2, e)}
              >
                {editingCell?.row === 2 && editingCell?.col === 2 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[2]?.[2]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(2, 2, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 2, 2)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[2]?.[2]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none"
                style={getCellBorderStyle(2, 2)}
              />
            </div>

            {/* Row 4 - Purple */}
            <div className="basis-0 bg-[#ECE6FF] grow min-h-px min-w-px relative rounded-br-[8px] shrink-0 w-full">
              <div
                className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                onClick={(e) => handleCellClick(3, 2, e)}
              >
                {editingCell?.row === 3 && editingCell?.col === 2 ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tableData.cells[3]?.[2]?.content || ""}
                    onChange={(e) =>
                      handleCellContentChange(3, 2, e.target.value)
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, 3, 2)}
                    onBlur={() => setEditingCell(null)}
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                    style={getTextStyle()}
                  />
                ) : (
                  <div
                    className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                    style={getTextStyle()}
                  >
                    {tableData.cells[3]?.[2]?.content || ""}
                  </div>
                )}
              </div>
              <div
                className="absolute border-solid inset-0 pointer-events-none rounded-br-[8px]"
                style={getCellBorderStyle(3, 2)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
