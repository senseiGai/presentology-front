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
      className="bg-white rounded-[8px] border border-[#e9e9e9] border-solid flex items-start gap-1 p-[8px]"
      style={{
        boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={onMoveUp}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Переместить вверх"
      >
        <MoveUpIcon />
      </button>
      <button
        onClick={onMoveDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Переместить вниз"
      >
        <MoveDownIcon />
      </button>
      <button
        onClick={onCopy}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Копировать"
      >
        <GrayClipboardIcon />
      </button>
      <button
        onClick={onDelete}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#FEE2E2] rounded-[8px] transition-colors p-[8px]"
        title="Удалить"
      >
        <TrashIcon />
      </button>
    </div>
  );
};
