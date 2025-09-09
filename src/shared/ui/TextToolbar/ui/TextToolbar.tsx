import React from "react";
import MoveUpIcon from "../../../../../public/icons/MoveUpIcon";
import MoveDownIcon from "../../../../../public/icons/MoveDownIcon";
import GrayClipboardIcon from "../../../../../public/icons/GrayClipboardIcon";
import TrashIcon from "../../../../../public/icons/TrashIcon";

interface TextToolbarProps {
  position: { x: number; y: number };
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export const TextToolbar: React.FC<TextToolbarProps> = ({
  position,
  onMoveUp,
  onMoveDown,
  onCopy,
  onDelete,
}) => {
  console.log("TextToolbar rendering at position:", position);

  return (
    <div
      className="fixed bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] flex items-center gap-0 p-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
    >
      <button
        onClick={onMoveUp}
        className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#F3F4F6] rounded-[8px] transition-colors"
        title="Переместить вверх"
      >
        <MoveUpIcon />
      </button>
      <button
        onClick={onMoveDown}
        className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#F3F4F6] rounded-[8px] transition-colors"
        title="Переместить вниз"
      >
        <MoveDownIcon />
      </button>
      <button
        onClick={onCopy}
        className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#F3F4F6] rounded-[8px] transition-colors"
        title="Копировать"
      >
        <GrayClipboardIcon />
      </button>
      <button
        onClick={onDelete}
        className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#FEE2E2] rounded-[8px] transition-colors"
        title="Удалить"
      >
        <TrashIcon />
      </button>
    </div>
  );
};
