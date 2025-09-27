import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import MoveUpIcon from "../../../../../public/icons/MoveUpIcon";
import MoveDownIcon from "../../../../../public/icons/MoveDownIcon";
import GrayClipboardIcon from "../../../../../public/icons/GrayClipboardIcon";
import TrashIcon from "../../../../../public/icons/TrashIcon";

interface ImageToolbarProps {
  position: { x: number; y: number };
  elementId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export const ImageToolbar: React.FC<ImageToolbarProps> = ({
  position,
  elementId,
  onMoveUp,
  onMoveDown,
  onCopy,
  onDelete,
}) => {
  const { getImageElement, updateImageElement, copyImageElement } =
    usePresentationStore();

  console.log("ImageToolbar rendering at position:", position);

  // Handle duplicating image element (create immediate copy)
  const handleDuplicateImageElement = () => {
    console.log(
      "📋 ImageToolbar: Starting duplicate operation for element:",
      elementId
    );

    // Get current slide number from store
    const currentSlide = usePresentationStore.getState().currentSlide;
    console.log("📋 ImageToolbar: Current slide number:", currentSlide);

    try {
      // Use direct copyImageElement function
      const newElementId = copyImageElement(elementId, currentSlide);
      console.log(
        "✅ ImageToolbar: Element successfully duplicated with new ID:",
        newElementId
      );
    } catch (error) {
      console.error("❌ ImageToolbar: Error duplicating element:", error);
    }

    console.log("📋 ImageToolbar: Calling onCopy callback");
    onCopy();
  };

  // Handle moving element up
  const handleMoveUp = () => {
    const imageElement = getImageElement(elementId);
    if (!imageElement) return;

    const currentX = imageElement.position.x;
    const currentY = imageElement.position.y;
    const newY = Math.max(0, currentY - 10); // Move up 10px, minimum 0

    updateImageElement(elementId, {
      position: { x: currentX, y: newY },
    });
    console.log("Moving image element up from y:", currentY, "to y:", newY);
  };

  // Handle moving element down
  const handleMoveDown = () => {
    const imageElement = getImageElement(elementId);
    if (!imageElement) return;

    const currentX = imageElement.position.x;
    const currentY = imageElement.position.y;
    const newY = currentY + 10; // Move down 10px

    updateImageElement(elementId, {
      position: { x: currentX, y: newY },
    });
    console.log("Moving image element down from y:", currentY, "to y:", newY);
  };

  // Handle deleting image element
  const handleDelete = () => {
    console.log("ImageToolbar: Deleting image element:", elementId);
    deleteImageElement(elementId);
    setSelectedImageElement(null);
  };

  // Prevent toolbar from losing focus when clicking on buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent focus loss
    e.stopPropagation(); // Prevent event bubbling
  };

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    console.log(
      "ImageToolbar: Button clicked, preventing default and calling callback"
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
          console.log("ImageToolbar: Move Up button clicked");
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
          console.log("ImageToolbar: Move Down button clicked");
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
            "🖱️ ImageToolbar: Duplicate button clicked for element:",
            elementId
          );
          console.log("🖱️ ImageToolbar: Button position:", position);
          handleDuplicateImageElement();
          console.log("🖱️ ImageToolbar: Duplicate operation completed");
        })}
        onMouseDown={handleMouseDown}
        className="bg-[#f4f4f4] w-8 h-8 flex items-center justify-center hover:bg-[#e5e5e5] rounded-[8px] transition-colors p-[8px]"
        title="Дублировать изображение"
      >
        <GrayClipboardIcon />
      </button>
      <button
        onClick={handleButtonClick(() => {
          console.log("ImageToolbar: Delete button clicked");
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
