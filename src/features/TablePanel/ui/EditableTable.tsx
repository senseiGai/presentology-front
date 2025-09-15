"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import AddBottomRowIcon from "../../../../public/icons/AddBottomRowIcon";
import AddTopRowIcon from "../../../../public/icons/AddTopRowIcon";
import AddLeftColumnIcon from "../../../../public/icons/AddLeftColumnIcon";
import AddRightColumnIcon from "../../../../public/icons/AddRightColumnIcon";
import TrashIcon from "../../../../public/icons/TrashIcon";

// Add styles for resize cursors
const styles = `
  .cursor-col-resize {
    cursor: col-resize;
  }
  
  .cursor-row-resize {
    cursor: row-resize;
  }
`;

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

export interface EditableTableRef {
  addRow: () => void;
  addColumn: () => void;
  getTableSize: () => { width: number; height: number };
}

interface EditableTableProps {
  initialData?: TableData;
  onTableChange?: (data: TableData) => void;
  onEditingChange?: (isEditing: boolean) => void;
  onTableSelect?: (isSelected: boolean) => void;
  className?: string;
  elementId?: string;
  onDelete?: () => void;
  onCopy?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddRow?: () => void;
  onAddColumn?: () => void;
}

interface DragPreview {
  type: "row" | "column";
  index: number;
  targetIndex?: number;
  isVisible: boolean;
}

interface DragIndicator {
  isVisible: boolean;
  type: "row" | "column";
  position: number; // Position in pixels where the indicator should appear
  targetIndex: number; // Index where the row/column will be inserted
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

export const EditableTable = forwardRef<EditableTableRef, EditableTableProps>(
  (
    {
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
      onAddRow,
      onAddColumn,
    },
    ref
  ) => {
    // Initialize table data
    const [tableData, setTableData] = useState<TableData>(() => {
      if (initialData) return initialData;

      // Create default 4x4 table to match Figma design with "Label" text
      const defaultCells: TableCell[][] = [];
      for (let row = 0; row < 4; row++) {
        defaultCells[row] = [];
        for (let col = 0; col < 4; col++) {
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
        cols: 4,
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
    const [showRowToolbar, setShowRowToolbar] = useState<number | null>(null);
    const [showColToolbar, setShowColToolbar] = useState<number | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [tableSelected, setTableSelected] = useState(false);
    const [dragPreview, setDragPreview] = useState<DragPreview>({
      type: "row",
      index: 0,
      isVisible: false,
    });
    const [dragIndicator, setDragIndicator] = useState<DragIndicator>({
      isVisible: false,
      type: "row",
      position: 0,
      targetIndex: 0,
    });
    const [tooltip, setTooltip] = useState<Tooltip>({
      text: "",
      x: 0,
      y: 0,
      visible: false,
    });

    // Resize states
    const [isResizing, setIsResizing] = useState(false);
    const [resizeType, setResizeType] = useState<"row" | "column" | null>(null);
    const [resizeIndex, setResizeIndex] = useState<number | null>(null);
    const [hoveredResizer, setHoveredResizer] = useState<{
      type: "row" | "column";
      index: number;
    } | null>(null);

    // Size states for dynamic resizing
    const [columnWidths, setColumnWidths] = useState<number[]>([
      121.66667175292969, 121.66667175292969, 121.66667175292969,
      121.66667175292969,
    ]); // Default equal widths - 4 columns
    const [rowHeights, setRowHeights] = useState<number[]>([53, 53, 53, 53]); // Default equal heights - 4 rows
    const [resizeStartPos, setResizeStartPos] = useState<{
      x: number;
      y: number;
    }>({ x: 0, y: 0 });

    // Refs
    const tableRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const rowToolbarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const colToolbarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle cell editing
    const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent drag from starting when clicking on cells
      setEditingCell({ row, col });
      setSelectedCell({ row, col });
      onTableSelect?.(true); // Select the table when cell is clicked
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
      setTableSelected(true);
      onTableSelect?.(true);
      console.log("Select all table");
    };

    const handleSelectRow = (rowIndex: number) => {
      setSelectedCell(null);
      setEditingCell(null);
      // Keep tableSelected true to show buttons
      setSelectedColumn(null); // Clear column selection
      setSelectedRow(rowIndex); // Set selected row
      console.log("Select row", rowIndex);
    };

    const handleSelectColumn = (colIndex: number) => {
      setSelectedCell(null);
      setEditingCell(null);
      // Keep tableSelected true to show buttons
      setSelectedRow(null); // Clear row selection
      setSelectedColumn(colIndex); // Set selected column
      console.log("Select column", colIndex);
    };

    // Handle mouse movement to detect row/column hover
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!tableRef.current) return;

      // Don't update hover states during drag operations
      if (dragPreview.isVisible) return;

      const rect = tableRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate which row/column the mouse is over using dynamic heights and widths
      let currentY = 0;
      let hoveredRowIndex = -1;

      for (let i = 0; i < tableData.rows; i++) {
        if (y >= currentY && y < currentY + rowHeights[i]) {
          hoveredRowIndex = i;
          break;
        }
        currentY += rowHeights[i];
      }

      let currentX = 0;
      let hoveredColIndex = -1;

      for (let i = 0; i < tableData.cols; i++) {
        if (x >= currentX && x < currentX + columnWidths[i]) {
          hoveredColIndex = i;
          break;
        }
        currentX += columnWidths[i];
      }

      // Check for row hover when table is selected
      if (tableSelected) {
        if (hoveredRowIndex >= 0 && hoveredRowIndex < tableData.rows) {
          setHoveredRow(hoveredRowIndex);
        } else {
          setHoveredRow(null);
        }

        if (hoveredColIndex >= 0 && hoveredColIndex < tableData.cols) {
          setHoveredColumn(hoveredColIndex);
        } else {
          setHoveredColumn(null);
        }
      }
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

      // Set drag image offset to cursor position
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // Use a smaller offset to keep preview close to cursor
      e.dataTransfer.setDragImage(target, offsetX, offsetY);

      setDragPreview({
        type,
        index,
        isVisible: true,
      });

      // Clear hover states during drag
      setHoveredRow(null);
      setHoveredColumn(null);
    };

    const handleDragEnd = () => {
      setDragIndicator({
        isVisible: false,
        type: "row",
        position: 0,
        targetIndex: 0,
      });
      setDragPreview({ type: "row", index: 0, isVisible: false });

      // Allow hover states to work again after drag ends
      // (hover states will be updated on next mouse move)
    };

    const handleDragOver = (
      e: React.DragEvent,
      type: "row" | "column",
      targetIndex: number
    ) => {
      e.preventDefault();

      if (!tableRef.current) return;

      let position = 0;

      if (type === "row") {
        // Calculate position for row indicator using dynamic heights
        position = rowHeights
          .slice(0, targetIndex)
          .reduce((sum, height) => sum + height, 0);
      } else {
        // Calculate position for column indicator using dynamic widths
        position = columnWidths
          .slice(0, targetIndex)
          .reduce((sum, width) => sum + width, 0);
      }

      setDragPreview((prev) => ({
        ...prev,
        targetIndex,
      }));

      setDragIndicator({
        isVisible: true,
        type,
        position,
        targetIndex,
      });
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
      setDragIndicator({
        isVisible: false,
        type: "row",
        position: 0,
        targetIndex: 0,
      });

      // Reset selection state after drag
      setSelectedRow(null);
      setSelectedColumn(null);
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
        if (rowToolbarTimeoutRef.current) {
          clearTimeout(rowToolbarTimeoutRef.current);
        }
        if (colToolbarTimeoutRef.current) {
          clearTimeout(colToolbarTimeoutRef.current);
        }
      };
    }, []);

    // Add row/column functions
    const addRow = () => {
      // Check if adding a new row would exceed slide height (427px)
      const currentTableHeight = rowHeights.reduce(
        (sum, height) => sum + height,
        0
      );
      const newRowHeight = 53; // Default height
      const slideHeight = 427;
      const maxTableHeight = slideHeight - 100; // Leave some margin

      if (currentTableHeight + newRowHeight > maxTableHeight) {
        console.log("Cannot add row: would exceed slide height");
        return;
      }

      const newCells = [...tableData.cells];
      const newRowIndex = tableData.rows; // Create new row with empty cells
      const newRow: TableCell[] = [];
      for (let col = 0; col < tableData.cols; col++) {
        newRow.push({
          id: `cell-${newRowIndex}-${col}`,
          content: "",
          rowIndex: newRowIndex,
          colIndex: col,
        });
      }

      newCells.push(newRow);

      // Add new row height
      const newRowHeights = [...rowHeights, 53]; // Default height

      const newTableData = {
        ...tableData,
        rows: tableData.rows + 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setRowHeights(newRowHeights);
      onTableChange?.(newTableData);

      // Set editing cell to first cell of new row
      setTimeout(() => {
        setEditingCell({ row: newRowIndex, col: 0 });
        setSelectedCell({ row: newRowIndex, col: 0 });
      }, 50);
    };

    const addColumn = () => {
      // Check if adding a new column would exceed slide width (759px)
      const currentTableWidth = columnWidths.reduce(
        (sum, width) => sum + width,
        0
      );
      const newColumnWidth = 121.66667175292969; // Default width
      const slideWidth = 759;
      const maxTableWidth = slideWidth - 100; // Leave some margin

      if (currentTableWidth + newColumnWidth > maxTableWidth) {
        console.log("Cannot add column: would exceed slide width");
        return;
      }

      const newCells = [...tableData.cells];
      const newColIndex = tableData.cols; // Add new cell to each existing row
      for (let row = 0; row < tableData.rows; row++) {
        newCells[row].push({
          id: `cell-${row}-${newColIndex}`,
          content: "",
          rowIndex: row,
          colIndex: newColIndex,
        });
      }

      // Add new column width
      const newColumnWidths = [...columnWidths, 121.66667175292969]; // Default width

      const newTableData = {
        ...tableData,
        cols: tableData.cols + 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setColumnWidths(newColumnWidths);
      onTableChange?.(newTableData);

      // Set editing cell to first cell of new column
      setTimeout(() => {
        setEditingCell({ row: 0, col: newColIndex });
        setSelectedCell({ row: 0, col: newColIndex });
      }, 50);
    };

    // Toolbar action functions
    const addRowAbove = (rowIndex: number) => {
      const newCells = [...tableData.cells];
      const newRow: TableCell[] = [];

      // Create new row with empty cells
      for (let col = 0; col < tableData.cols; col++) {
        newRow.push({
          id: `cell-${rowIndex}-${col}`,
          content: "",
          rowIndex: rowIndex,
          colIndex: col,
        });
      }

      // Insert new row at the specified index
      newCells.splice(rowIndex, 0, newRow);

      // Update row indices for rows after the inserted one
      for (let row = rowIndex + 1; row < newCells.length; row++) {
        for (let col = 0; col < tableData.cols; col++) {
          newCells[row][col] = {
            ...newCells[row][col],
            rowIndex: row,
            id: `cell-${row}-${col}`,
          };
        }
      }

      // Add new row height at the specified index
      const newRowHeights = [...rowHeights];
      newRowHeights.splice(rowIndex, 0, 53);

      const newTableData = {
        ...tableData,
        rows: tableData.rows + 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setRowHeights(newRowHeights);
      onTableChange?.(newTableData);
    };

    const addRowBelow = (rowIndex: number) => {
      addRowAbove(rowIndex + 1);
    };

    const addColumnLeft = (colIndex: number) => {
      const newCells = [...tableData.cells];

      // Add new cell to each row at the specified column index
      for (let row = 0; row < tableData.rows; row++) {
        const newCell: TableCell = {
          id: `cell-${row}-${colIndex}`,
          content: "",
          rowIndex: row,
          colIndex: colIndex,
        };

        newCells[row].splice(colIndex, 0, newCell);

        // Update column indices for cells after the inserted one
        for (let col = colIndex + 1; col < newCells[row].length; col++) {
          newCells[row][col] = {
            ...newCells[row][col],
            colIndex: col,
            id: `cell-${row}-${col}`,
          };
        }
      }

      // Add new column width at the specified index
      const newColumnWidths = [...columnWidths];
      newColumnWidths.splice(colIndex, 0, 121.66667175292969);

      const newTableData = {
        ...tableData,
        cols: tableData.cols + 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setColumnWidths(newColumnWidths);
      onTableChange?.(newTableData);
    };

    const addColumnRight = (colIndex: number) => {
      addColumnLeft(colIndex + 1);
    };

    const deleteRow = (rowIndex: number) => {
      if (tableData.rows <= 1) return; // Don't delete if it's the last row

      const newCells = [...tableData.cells];
      newCells.splice(rowIndex, 1);

      // Update row indices for rows after the deleted one
      for (let row = rowIndex; row < newCells.length; row++) {
        for (let col = 0; col < tableData.cols; col++) {
          newCells[row][col] = {
            ...newCells[row][col],
            rowIndex: row,
            id: `cell-${row}-${col}`,
          };
        }
      }

      // Remove row height at the specified index
      const newRowHeights = [...rowHeights];
      newRowHeights.splice(rowIndex, 1);

      const newTableData = {
        ...tableData,
        rows: tableData.rows - 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setRowHeights(newRowHeights);
      onTableChange?.(newTableData);
    };

    const deleteColumn = (colIndex: number) => {
      if (tableData.cols <= 1) return; // Don't delete if it's the last column

      const newCells = [...tableData.cells];

      // Remove cell from each row at the specified column index
      for (let row = 0; row < tableData.rows; row++) {
        newCells[row].splice(colIndex, 1);

        // Update column indices for cells after the deleted one
        for (let col = colIndex; col < newCells[row].length; col++) {
          newCells[row][col] = {
            ...newCells[row][col],
            colIndex: col,
            id: `cell-${row}-${col}`,
          };
        }
      }

      // Remove column width at the specified index
      const newColumnWidths = [...columnWidths];
      newColumnWidths.splice(colIndex, 1);

      const newTableData = {
        ...tableData,
        cols: tableData.cols - 1,
        cells: newCells,
      };

      setTableData(newTableData);
      setColumnWidths(newColumnWidths);
      onTableChange?.(newTableData);
    };

    // Expose functions to parent component via ref
    useImperativeHandle(ref, () => ({
      addRow,
      addColumn,
      getTableSize: () => ({
        width: columnWidths.reduce((sum, width) => sum + width, 0),
        height: rowHeights.reduce((sum, height) => sum + height, 0),
      }),
    }));

    // Helper function to get dynamic styles
    const getBorderStyle = () => {
      const thickness = tableData.style?.borderThickness || 1;
      const color = tableData.style?.borderColor || "#BBA2FE";
      return {
        borderWidth: `${thickness}px`,
        borderColor: color,
        borderStyle: "solid",
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

    // Helper function to get column container styles with selection highlight
    const getColumnContainerStyle = (colIndex: number) => {
      const isColumnSelected = selectedColumn === colIndex;

      if (isColumnSelected) {
        return {
          boxShadow: "0px 0px 8px 0px rgba(138, 56, 245, 0.5)",
          zIndex: 10,
        };
      }

      return {};
    };

    // Helper function to get row container styles with selection highlight
    const getRowContainerStyle = (rowIndex: number) => {
      const isRowSelected = selectedRow === rowIndex;

      if (isRowSelected) {
        return {
          boxShadow: "0px 0px 8px 0px rgba(138, 56, 245, 0.5)",
          zIndex: 10,
        };
      }

      return {};
    };

    // Helper function to get cell border style based on position
    const getCellBorderStyle = (row: number, col: number) => {
      const thickness = tableData.style?.borderThickness || 1;
      const color = tableData.style?.borderColor || "#BBA2FE";

      // Create full table border - all edges get borders
      const topBorder = row === 0 ? `${thickness}px` : "0px"; // Top border for first row
      const bottomBorder =
        row === tableData.rows - 1 ? `${thickness}px` : "0px"; // Bottom border for last row
      const leftBorder = col === 0 ? `${thickness}px` : "0px"; // Left border for first column
      const rightBorder =
        col === tableData.cols - 1 ? `${thickness}px` : `${thickness}px`; // Right border for all columns except last gets internal border

      return {
        borderWidth: `${topBorder} ${rightBorder} ${bottomBorder} ${leftBorder}`,
        borderColor: color,
        borderStyle: "solid",
      };
    };

    // Helper function to get dynamic row style
    const getRowStyle = (rowIndex: number) => ({
      height: `${rowHeights[rowIndex]}px`,
    });

    // Helper function to get dynamic column style
    const getColumnStyle = (colIndex: number) => ({
      width: `${columnWidths[colIndex]}px`,
    });

    // Resize handling functions
    const handleResizeStart = (
      e: React.MouseEvent,
      type: "row" | "column",
      index: number
    ) => {
      e.preventDefault();
      setIsResizing(true);
      setResizeType(type);
      setResizeIndex(index);
      setResizeStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || resizeType === null || resizeIndex === null) return;

      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      if (resizeType === "column") {
        // Resize columns
        const newWidths = [...columnWidths];
        const minWidth = 50; // Minimum column width
        const maxWidth = 200; // Maximum column width

        // Adjust current column width
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, newWidths[resizeIndex] + deltaX)
        );
        const widthDiff = newWidth - newWidths[resizeIndex];

        // Adjust next column width to compensate
        if (resizeIndex + 1 < newWidths.length) {
          const nextWidth = Math.max(
            minWidth,
            Math.min(maxWidth, newWidths[resizeIndex + 1] - widthDiff)
          );
          newWidths[resizeIndex] = newWidth;
          newWidths[resizeIndex + 1] = nextWidth;
        } else {
          newWidths[resizeIndex] = newWidth;
        }

        setColumnWidths(newWidths);
      } else {
        // Resize rows
        const newHeights = [...rowHeights];
        const minHeight = 30; // Minimum row height
        const maxHeight = 100; // Maximum row height

        // Adjust current row height
        const newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, newHeights[resizeIndex] + deltaY)
        );
        const heightDiff = newHeight - newHeights[resizeIndex];

        // Adjust next row height to compensate
        if (resizeIndex + 1 < newHeights.length) {
          const nextHeight = Math.max(
            minHeight,
            Math.min(maxHeight, newHeights[resizeIndex + 1] - heightDiff)
          );
          newHeights[resizeIndex] = newHeight;
          newHeights[resizeIndex + 1] = nextHeight;
        } else {
          newHeights[resizeIndex] = newHeight;
        }

        setRowHeights(newHeights);
      }

      // Update start position for next move
      setResizeStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      setResizeType(null);
      setResizeIndex(null);
    };

    // Add mouse event listeners for resize
    useEffect(() => {
      if (isResizing) {
        document.addEventListener("mousemove", handleResizeMove);
        document.addEventListener("mouseup", handleResizeEnd);

        return () => {
          document.removeEventListener("mousemove", handleResizeMove);
          document.removeEventListener("mouseup", handleResizeEnd);
        };
      }
    }, [isResizing, resizeType, resizeIndex]);

    return (
      <div className={`relative ${className}`}>
        {/* Inject resize cursor styles */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />

        {/* Extended hover area to include buttons */}
        <div
          className="relative py-12 pl-12 pr-[120px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoverRowButton(null);
            setHoverColButton(null);
            setHoveredRow(null);
            setHoveredColumn(null);
            hideTooltip();
          }}
        >
          {/* Table Container - Dynamic sizing */}
          <div
            ref={tableRef}
            className="relative rounded-[8px] cursor-move table-drag-handle"
            style={{
              width: `${columnWidths.reduce((sum, width) => sum + width, 0)}px`,
              height: `${rowHeights.reduce(
                (sum, height) => sum + height,
                0
              )}px`,
            }}
            onMouseMove={handleMouseMove}
          >
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

            {/* Vertical Drag Button - Positioned to the left of table */}
            {isHovered && !tableSelected && (
              <button
                onClick={handleSelectAllTable}
                onMouseEnter={(e) => {
                  const buttonRect = e.currentTarget.getBoundingClientRect();
                  const containerRect =
                    tableRef.current?.getBoundingClientRect();
                  if (containerRect) {
                    const relativeX =
                      buttonRect.left -
                      containerRect.left +
                      buttonRect.width / 0.35;
                    const relativeY =
                      buttonRect.bottom - containerRect.top + 55;
                    showTooltip("Выделить таблицу", relativeX, relativeY);
                  }
                }}
                onMouseLeave={hideTooltip}
                className="absolute -left-8 top-0 w-[20px] h-[32px] bg-white hover:bg-[#DDD1FF] hover:border-white group  rounded border border-[#D5D5D6] border-solid z-20"
                style={{ boxShadow: "0px 0px 4px 0px rgba(138, 56, 245, 0.2)" }}
              >
                <div className="flex flex-col gap-y-1 items-center justify-center w-full h-full">
                  <div className="w-1 h-1 top-1.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                  <div className=" w-1 h-1 top-3.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                  <div className=" w-1 h-1 top-[22px] bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                </div>
              </button>
            )}

            {tableSelected && (hoveredRow !== null || selectedRow !== null) && (
              <button
                className="absolute -left-2.5 w-[20px] h-[32px] bg-white hover:bg-[#DDD1FF] hover:border-white group rounded border border-[#D5D5D6] border-solid z-20 transition-all"
                style={{
                  top: `${
                    rowHeights
                      .slice(0, hoveredRow !== null ? hoveredRow : selectedRow!)
                      .reduce((sum, height) => sum + height, 0) +
                    rowHeights[
                      hoveredRow !== null ? hoveredRow : selectedRow!
                    ] /
                      2 -
                    16
                  }px`,
                  boxShadow:
                    selectedRow !== null &&
                    (hoveredRow === null || hoveredRow === selectedRow)
                      ? "0px 0px 8px 2px rgba(138, 56, 245, 0.6)"
                      : "0px 0px 4px 0px rgba(138, 56, 245, 0.2)",
                }}
                draggable={selectedRow !== null}
                onDragStart={(e) => {
                  e.stopPropagation();
                  selectedRow !== null &&
                    handleDragStart(e, "row", selectedRow);
                }}
                onDragOver={(e) => {
                  e.stopPropagation();
                  handleDragOver(
                    e,
                    "row",
                    hoveredRow !== null ? hoveredRow : selectedRow!
                  );
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(
                    e,
                    "row",
                    hoveredRow !== null ? hoveredRow : selectedRow!
                  );
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  handleDragEnd();
                }}
                onClick={() =>
                  handleSelectRow(
                    hoveredRow !== null ? hoveredRow : selectedRow!
                  )
                }
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  const buttonRect = e.currentTarget.getBoundingClientRect();
                  const containerRect =
                    tableRef.current?.getBoundingClientRect();
                  if (containerRect) {
                    const relativeX =
                      buttonRect.left -
                      containerRect.left +
                      buttonRect.width / 0.35;
                    const relativeY =
                      buttonRect.bottom - containerRect.top + 55;
                    showTooltip("Выделить строку", relativeX, relativeY);

                    // Clear any existing timeout
                    if (rowToolbarTimeoutRef.current) {
                      clearTimeout(rowToolbarTimeoutRef.current);
                      rowToolbarTimeoutRef.current = null;
                    }

                    setShowRowToolbar(
                      hoveredRow !== null ? hoveredRow : selectedRow!
                    );
                  }
                }}
                onMouseLeave={() => {
                  hideTooltip();

                  // Set timeout to hide toolbar after delay
                  rowToolbarTimeoutRef.current = setTimeout(() => {
                    setShowRowToolbar(null);
                  }, 300);
                }}
              >
                <div className="flex flex-col gap-y-1 items-center justify-center w-full h-full">
                  <div className="w-1 h-1 top-1.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                  <div className=" w-1 h-1 top-3.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                  <div className=" w-1 h-1 top-[22px] bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                </div>
              </button>
            )}

            {/* Column Selection Buttons */}
            {tableSelected &&
              (hoveredColumn !== null || selectedColumn !== null) && (
                <button
                  className="absolute -top-12 w-[32px] h-[20px] bg-white hover:bg-[#DDD1FF] hover:border-white group rounded border border-[#D5D5D6] border-solid z-20 transition-all"
                  style={{
                    left: `${
                      columnWidths
                        .slice(
                          0,
                          hoveredColumn !== null
                            ? hoveredColumn
                            : selectedColumn!
                        )
                        .reduce((sum, width) => sum + width, 0) +
                      columnWidths[
                        hoveredColumn !== null ? hoveredColumn : selectedColumn!
                      ] /
                        2 -
                      16
                    }px`,
                    top: `${-8}px`,
                    boxShadow:
                      selectedColumn !== null &&
                      (hoveredColumn === null ||
                        hoveredColumn === selectedColumn)
                        ? "0px 0px 8px 2px rgba(138, 56, 245, 0.6)"
                        : "0px 0px 4px 0px rgba(138, 56, 245, 0.2)",
                  }}
                  draggable={selectedColumn !== null}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    selectedColumn !== null &&
                      handleDragStart(e, "column", selectedColumn);
                  }}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    handleDragOver(
                      e,
                      "column",
                      hoveredColumn !== null ? hoveredColumn : selectedColumn!
                    );
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(
                      e,
                      "column",
                      hoveredColumn !== null ? hoveredColumn : selectedColumn!
                    );
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    handleDragEnd();
                  }}
                  onClick={() =>
                    handleSelectColumn(
                      hoveredColumn !== null ? hoveredColumn : selectedColumn!
                    )
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => {
                    const buttonRect = e.currentTarget.getBoundingClientRect();
                    const containerRect =
                      tableRef.current?.getBoundingClientRect();
                    if (containerRect) {
                      const relativeX =
                        buttonRect.left -
                        containerRect.left +
                        buttonRect.width / 0.5;
                      const relativeY =
                        buttonRect.bottom - containerRect.top + 55;
                      showTooltip("Выделить столбец", relativeX, relativeY);

                      // Clear any existing timeout
                      if (colToolbarTimeoutRef.current) {
                        clearTimeout(colToolbarTimeoutRef.current);
                        colToolbarTimeoutRef.current = null;
                      }

                      setShowColToolbar(
                        hoveredColumn !== null ? hoveredColumn : selectedColumn!
                      );
                    }
                  }}
                  onMouseLeave={() => {
                    hideTooltip();

                    // Set timeout to hide toolbar after delay
                    colToolbarTimeoutRef.current = setTimeout(() => {
                      setShowColToolbar(null);
                    }, 300);
                  }}
                >
                  <div className="flex flex-row gap-x-1 items-center justify-center w-full h-full">
                    <div className="w-1 h-1 top-1.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                    <div className=" w-1 h-1 top-3.5 bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                    <div className=" w-1 h-1 top-[22px] bg-[#8F8F92] group-hover:bg-white rounded-full"></div>
                  </div>
                </button>
              )}

            {/* Row Toolbar */}
            {showRowToolbar !== null && (
              <div
                className="row-toolbar absolute z-30 bg-white rounded-[8px] p-[8px] flex gap-1 items-center"
                style={{
                  left: `${-60}px`, // Position to the left of the table
                  top: `${
                    rowHeights
                      .slice(0, showRowToolbar)
                      .reduce((sum, height) => sum + height, 0) +
                    rowHeights[showRowToolbar] / 2 -
                    74
                  }px`,
                  border: "1px solid #e9e9e9",
                  boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={() => {
                  // Clear timeout when hovering over toolbar
                  if (rowToolbarTimeoutRef.current) {
                    clearTimeout(rowToolbarTimeoutRef.current);
                    rowToolbarTimeoutRef.current = null;
                  }
                  setShowRowToolbar(showRowToolbar);
                }}
                onMouseLeave={() => {
                  // Set timeout to hide toolbar when leaving toolbar
                  rowToolbarTimeoutRef.current = setTimeout(() => {
                    setShowRowToolbar(null);
                  }, 100);
                }}
              >
                {/* Add Bottom Row */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    addRowBelow(showRowToolbar);
                    setShowRowToolbar(null);
                  }}
                  title="Добавить строку снизу"
                >
                  <AddBottomRowIcon />
                </button>

                {/* Add Top Row */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    addRowAbove(showRowToolbar);
                    setShowRowToolbar(null);
                  }}
                  title="Добавить строку сверху"
                >
                  <AddTopRowIcon />
                </button>

                {/* Delete Row */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    deleteRow(showRowToolbar);
                    setShowRowToolbar(null);
                  }}
                  title="Удалить строку"
                >
                  <TrashIcon />
                </button>
              </div>
            )}

            {/* Drop zones for rows - invisible areas between rows */}
            {showColToolbar !== null && (
              <div
                className="col-toolbar absolute z-30 bg-white rounded-[8px] p-[8px] flex gap-1 items-center"
                style={{
                  left: `${
                    columnWidths
                      .slice(0, showColToolbar)
                      .reduce((sum, width) => sum + width, 0) +
                    columnWidths[showColToolbar] / 2 -
                    60
                  }px`,
                  top: `${-65}px`, // Position above the table
                  border: "1px solid #e9e9e9",
                  boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={() => {
                  // Clear timeout when hovering over toolbar
                  if (colToolbarTimeoutRef.current) {
                    clearTimeout(colToolbarTimeoutRef.current);
                    colToolbarTimeoutRef.current = null;
                  }
                  setShowColToolbar(showColToolbar);
                }}
                onMouseLeave={() => {
                  // Set timeout to hide toolbar when leaving toolbar
                  colToolbarTimeoutRef.current = setTimeout(() => {
                    setShowColToolbar(null);
                  }, 100);
                }}
              >
                {/* Add Left Column */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    addColumnLeft(showColToolbar);
                    setShowColToolbar(null);
                  }}
                  title="Добавить столбец слева"
                >
                  <AddLeftColumnIcon />
                </button>

                {/* Add Right Column */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    addColumnRight(showColToolbar);
                    setShowColToolbar(null);
                  }}
                  title="Добавить столбец справа"
                >
                  <AddRightColumnIcon />
                </button>

                {/* Delete Column */}
                <button
                  className="bg-[#f4f4f4] p-[8px] rounded-[8px] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
                  onClick={() => {
                    deleteColumn(showColToolbar);
                    setShowColToolbar(null);
                  }}
                  title="Удалить столбец"
                >
                  <TrashIcon />
                </button>
              </div>
            )}

            {/* Drop zones for rows - invisible areas between rows */}
            {dragPreview.isVisible && dragPreview.type === "row" && (
              <>
                {Array.from({ length: tableData.rows + 1 }, (_, i) => {
                  const topOffset = rowHeights
                    .slice(0, i)
                    .reduce((sum, height) => sum + height, 0);
                  return (
                    <div
                      key={`row-drop-${i}`}
                      className="absolute z-40"
                      style={{
                        left: "-10px",
                        top: `${topOffset - 8}px`,
                        width: "calc(100% + 20px)",
                        height: "16px",
                      }}
                      onDragOver={(e) => handleDragOver(e, "row", i)}
                      onDrop={(e) => handleDrop(e, "row", i)}
                    />
                  );
                })}
              </>
            )}

            {/* Drop zones for columns - invisible areas between columns */}
            {dragPreview.isVisible && dragPreview.type === "column" && (
              <>
                {Array.from({ length: tableData.cols + 1 }, (_, i) => {
                  const leftOffset = columnWidths
                    .slice(0, i)
                    .reduce((sum, width) => sum + width, 0);
                  return (
                    <div
                      key={`col-drop-${i}`}
                      className="absolute z-40"
                      style={{
                        left: `${leftOffset - 12}px`, // Увеличиваем область захвата
                        top: "-10px",
                        width: "24px", // Увеличиваем ширину зоны
                        height: "calc(100% + 20px)",
                      }}
                      onDragOver={(e) => handleDragOver(e, "column", i)}
                      onDrop={(e) => handleDrop(e, "column", i)}
                    />
                  );
                })}
              </>
            )}

            {/* Drag Drop Indicator */}
            {dragIndicator.isVisible && (
              <div
                className="absolute z-50 pointer-events-none"
                style={{
                  ...(dragIndicator.type === "row"
                    ? {
                        left: "0px",
                        top: `${dragIndicator.position}px`,
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#BBA2FE",
                        borderRadius: "3px",
                        boxShadow: "0px 0px 12px rgba(138, 56, 245, 0.6)",
                      }
                    : {
                        // Толстая вертикальная полоса как на фото
                        left: `${dragIndicator.position}px`,
                        top: "0px",
                        width: "6px",
                        height: "100%",
                        backgroundColor: "#BBA2FE",
                        borderRadius: "3px",
                        boxShadow: "0px 0px 12px rgba(138, 56, 245, 0.8)",
                        transform: "translateX(-3px)", // Центрируем полосу
                      }),
                }}
              />
            )}

            {/* Row Selection Overlay */}
            {selectedRow !== null && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "0px",
                  top: `${rowHeights
                    .slice(0, selectedRow)
                    .reduce((sum, height) => sum + height, 0)}px`,
                  width: "100%",
                  height: `${rowHeights[selectedRow]}px`,
                  ...getRowContainerStyle(selectedRow),
                  borderRadius:
                    selectedRow === 0
                      ? "8px 8px 0 0"
                      : selectedRow === tableData.rows - 1
                      ? "0 0 8px 8px"
                      : "0",
                }}
              />
            )}

            {/* Column Resize Handles */}
            {Array.from({ length: tableData.cols - 1 }, (_, i) => {
              const leftOffset = columnWidths
                .slice(0, i + 1)
                .reduce((sum, width) => sum + width, 0);
              return (
                <div
                  key={`col-resize-${i}`}
                  className="absolute z-40 cursor-col-resize transition-colors"
                  style={{
                    left: `${leftOffset - 2}px`,
                    top: "0px",
                    width: "4px",
                    height: "100%",
                    backgroundColor:
                      hoveredResizer?.type === "column" &&
                      hoveredResizer?.index === i
                        ? "#BBA2FE"
                        : "transparent",
                  }}
                  onMouseEnter={() =>
                    setHoveredResizer({ type: "column", index: i })
                  }
                  onMouseLeave={() => setHoveredResizer(null)}
                  onMouseDown={(e) => handleResizeStart(e, "column", i)}
                />
              );
            })}

            {/* Row Resize Handles */}
            {Array.from({ length: tableData.rows - 1 }, (_, i) => {
              const topOffset = rowHeights
                .slice(0, i + 1)
                .reduce((sum, height) => sum + height, 0);
              return (
                <div
                  key={`row-resize-${i}`}
                  className="absolute z-40 cursor-row-resize transition-colors"
                  style={{
                    left: "0px",
                    top: `${topOffset - 2}px`,
                    width: "100%",
                    height: "4px",
                    backgroundColor:
                      hoveredResizer?.type === "row" &&
                      hoveredResizer?.index === i
                        ? "#BBA2FE"
                        : "transparent",
                  }}
                  onMouseEnter={() =>
                    setHoveredResizer({ type: "row", index: i })
                  }
                  onMouseLeave={() => setHoveredResizer(null)}
                  onMouseDown={(e) => handleResizeStart(e, "row", i)}
                />
              );
            })}

            {/* Table Content - Dynamic columns */}
            <div
              className="absolute box-border flex items-start justify-start left-0 top-0"
              style={{
                height: `${rowHeights.reduce(
                  (sum, height) => sum + height,
                  0
                )}px`,
                width: `${columnWidths.reduce(
                  (sum, width) => sum + width,
                  0
                )}px`,
              }}
            >
              {/* Dynamic Columns */}
              {Array.from({ length: tableData.cols }, (_, colIndex) => (
                <div
                  key={`column-${colIndex}`}
                  className="box-border flex flex-col h-full items-start justify-start relative shrink-0"
                  style={{
                    width: `${columnWidths[colIndex]}px`,
                    ...getColumnContainerStyle(colIndex),
                  }}
                >
                  {/* Dynamic Rows in Column */}
                  {Array.from({ length: tableData.rows }, (_, rowIndex) => {
                    const isFirstRow = rowIndex === 0;
                    const isLastRow = rowIndex === tableData.rows - 1;
                    const isFirstCol = colIndex === 0;
                    const isLastCol = colIndex === tableData.cols - 1;

                    let cellClasses =
                      "min-h-px min-w-px relative shrink-0 w-full";
                    if (rowIndex % 2 === 0) {
                      cellClasses += " bg-white";
                    } else {
                      cellClasses += " bg-[#ECE6FF]";
                    }

                    // Add border radius for corner cells
                    if (isFirstRow && isFirstCol)
                      cellClasses += " rounded-tl-[8px]";
                    if (isFirstRow && isLastCol)
                      cellClasses += " rounded-tr-[8px]";
                    if (isLastRow && isFirstCol)
                      cellClasses += " rounded-bl-[8px]";
                    if (isLastRow && isLastCol)
                      cellClasses += " rounded-br-[8px]";

                    return (
                      <div
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={cellClasses}
                        style={getRowStyle(rowIndex)}
                      >
                        <div
                          className="box-border flex gap-2 items-center justify-start overflow-clip pb-[11px] pt-3 px-3 relative h-full cursor-text"
                          onClick={(e) =>
                            handleCellClick(rowIndex, colIndex, e)
                          }
                        >
                          {editingCell?.row === rowIndex &&
                          editingCell?.col === colIndex ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={
                                tableData.cells[rowIndex]?.[colIndex]
                                  ?.content || ""
                              }
                              onChange={(e) =>
                                handleCellContentChange(
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) =>
                                handleCellKeyDown(e, rowIndex, colIndex)
                              }
                              onBlur={() => setEditingCell(null)}
                              className="font-['Onest'] leading-[1.2] tracking-[-0.42px] bg-transparent outline-none w-full"
                              style={getTextStyle()}
                            />
                          ) : (
                            <div
                              className="font-['Onest'] leading-[1.2] tracking-[-0.42px]"
                              style={getTextStyle()}
                            >
                              {tableData.cells[rowIndex]?.[colIndex]?.content ||
                                ""}
                            </div>
                          )}
                        </div>
                        <div
                          className="absolute inset-0 pointer-events-none z-10"
                          style={{
                            ...getCellBorderStyle(rowIndex, colIndex),
                            ...(isFirstRow &&
                              isFirstCol && { borderTopLeftRadius: "8px" }),
                            ...(isFirstRow &&
                              isLastCol && { borderTopRightRadius: "8px" }),
                            ...(isLastRow &&
                              isFirstCol && { borderBottomLeftRadius: "8px" }),
                            ...(isLastRow &&
                              isLastCol && { borderBottomRightRadius: "8px" }),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translateX(-50%)",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    );
  }
);

EditableTable.displayName = "EditableTable";
