import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import MoveUpIcon from "../../../../../public/icons/MoveUpIcon";
import MoveDownIcon from "../../../../../public/icons/MoveDownIcon";
import GrayClipboardIcon from "../../../../../public/icons/GrayClipboardIcon";
import TrashIcon from "../../../../../public/icons/TrashIcon";

interface TextToolbarProps {
  position: { x: number; y: number };
  elementId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export const TextToolbar: React.FC<TextToolbarProps> = ({
  position,
  elementId,
  onMoveUp,
  onMoveDown,
  onCopy,
  onDelete,
}) => {
  const { getTextElementStyle, updateTextElementStyle, copyTextElement } =
    usePresentationStore();

  console.log("TextToolbar rendering at position:", position);

  // Handle duplicating text element (create immediate copy)
  const handleDuplicateTextElement = () => {
    console.log(
      "📋 TextToolbar: Starting duplicate operation for element:",
      elementId
    );

    // Get current slide number from store
    const currentSlide = usePresentationStore.getState().currentSlide;
    console.log("📋 TextToolbar: Current slide number:", currentSlide);

    try {
      // Use direct copyTextElement function (same as images)
      const newElementId = copyTextElement(elementId, currentSlide);
      console.log(
        "✅ TextToolbar: Element successfully duplicated with new ID:",
        newElementId
      );
    } catch (error) {
      console.error("❌ TextToolbar: Error duplicating element:", error);
    }

    console.log("📋 TextToolbar: Calling onCopy callback");
    onCopy();
  };

  // Prevent toolbar from losing focus when clicking on buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent focus loss
    e.stopPropagation(); // Prevent event bubbling
  };

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    console.log(
      "TextToolbar: Button clicked, preventing default and calling callback"
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
          console.log("TextToolbar: Move Up button clicked");
          onMoveUp();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="На передний план"
      >
        <MoveUpIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("TextToolbar: Move Down button clicked");
          onMoveDown();
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="На задний план"
      >
        <MoveDownIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log(
            "🖱️ TextToolbar: Duplicate button clicked for element:",
            elementId
          );
          console.log("🖱️ TextToolbar: Button position:", position);
          handleDuplicateTextElement();
          console.log("🖱️ TextToolbar: Duplicate operation completed");
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Дублировать объект"
      >
        <GrayClipboardIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("TextToolbar: Delete button clicked");
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
