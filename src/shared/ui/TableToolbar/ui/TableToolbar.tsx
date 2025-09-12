import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import MoveUpIcon from "../../../../../public/icons/MoveUpIcon";
import MoveDownIcon from "../../../../../public/icons/MoveDownIcon";
import GrayClipboardIcon from "../../../../../public/icons/GrayClipboardIcon";
import TrashIcon from "../../../../../public/icons/TrashIcon";

interface TableToolbarProps {
  position: { x: number; y: number };
  elementId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  position,
  elementId,
  onMoveUp,
  onMoveDown,
  onCopy,
  onDelete,
}) => {
  const { getTableElement, updateTableElement } = usePresentationStore();

  console.log("TableToolbar rendering at position:", position);

  // Handle copying table content to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const tableData = getTableElement(elementId);
      if (tableData) {
        // Convert table to tab-separated text format
        const tableText = tableData.cells
          .map((row: any) => row.map((cell: any) => cell.content).join("\t"))
          .join("\n");

        await navigator.clipboard.writeText(tableText);
        console.log("Table copied to clipboard:", tableText);
      }
    } catch (err) {
      console.error("Failed to copy table to clipboard:", err);
    }
  };

  // Handle moving element up
  const handleMoveUp = () => {
    const tableData = getTableElement(elementId);
    if (tableData) {
      const currentX = tableData.position.x || 0;
      const currentY = tableData.position.y || 0;
      const newY = Math.max(0, currentY - 10); // Move up 10px, minimum 0

      updateTableElement(elementId, {
        ...tableData,
        position: { x: currentX, y: newY },
      });
      console.log("Moving table up from y:", currentY, "to y:", newY);
    }
  };

  // Handle moving element down
  const handleMoveDown = () => {
    const tableData = getTableElement(elementId);
    if (tableData) {
      const currentX = tableData.position.x || 0;
      const currentY = tableData.position.y || 0;
      const newY = currentY + 10; // Move down 10px

      updateTableElement(elementId, {
        ...tableData,
        position: { x: currentX, y: newY },
      });
      console.log("Moving table down from y:", currentY, "to y:", newY);
    }
  };

  // Prevent toolbar from losing focus when clicking on buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent focus loss
    e.stopPropagation(); // Prevent event bubbling
  };

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    console.log(
      "TableToolbar: Button clicked, preventing default and calling callback"
    );
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div
      className="bg-white rounded-[8px] border border-[#e9e9e9] border-solid flex items-start gap-1 p-[8px]"
      role="toolbar"
      style={{
        boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.08)",
        zIndex: 9999999, // Ensure toolbar is above everything
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={handleButtonClick(() => {
          console.log("TableToolbar: Move Up button clicked");
          handleMoveUp();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Переместить вверх"
      >
        <MoveUpIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("TableToolbar: Move Down button clicked");
          handleMoveDown();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Переместить вниз"
      >
        <MoveDownIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("TableToolbar: Copy to clipboard button clicked");
          handleCopyToClipboard();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Копировать таблицу"
      >
        <GrayClipboardIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("TableToolbar: Delete button clicked");
          onDelete();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#FEE2E2] rounded-[8px] transition-colors p-[8px]"
        title="Удалить"
      >
        <TrashIcon />
      </button>
    </div>
  );
};
