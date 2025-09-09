import React from "react";
import {
  ElementSelector,
  type ElementOption,
} from "@/features/ElementSelector";
import { TextEditorPanel } from "@/features/TextEditorPanel";
import { ImagePanel } from "@/features/ImagePanel";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface ToolsPanelProps {
  elementOptions: ElementOption[];
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ elementOptions }) => {
  const {
    isGenerating,
    generatedSlides,
    totalSlides,
    setSelectedElement,
    selectedTextElement,
    selectedImageElement,
    setSelectedTextElement,
    setSelectedImageElement,
  } = usePresentationStore();
  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId);

    // Reset previous selections
    if (selectedTextElement) {
      setSelectedTextElement(null);
    }
    if (selectedImageElement) {
      setSelectedImageElement(null);
    }

    // Set new selection based on element type
    if (elementId === "text") {
      setSelectedTextElement("text-element");
    } else if (elementId === "image") {
      setSelectedImageElement("image-element");
    }
  };

  const isAnyElementSelected = selectedTextElement || selectedImageElement;

  return (
    <div
      className={`w-[274px] bg-white border-l-[1px] border-[#E9E9E9] ${
        isAnyElementSelected ? "p-0" : "p-4"
      } flex-shrink-0 flex flex-col`}
      style={{
        boxShadow: "-4px 0px 4px 0px #BBA2FE1A",
        height: "calc(100vh - 80px)",
      }}
    >
      {isGenerating && (
        <div className="mb-6 flex-shrink-0">
          <div className="text-[14px] font-regular text-[#8F8F92] mb-2">
            Генерация слайдов
          </div>
          <div className="text-[14px] text-[#6B7280] mb-4">
            <span className="text-[#BBA2FE] font-medium text-[47px]">
              {generatedSlides.length} / {totalSlides}
            </span>
          </div>
        </div>
      )}

      {!isGenerating && (
        <div className="flex-1 overflow-y-auto">
          {selectedTextElement ? (
            <TextEditorPanel />
          ) : selectedImageElement ? (
            <ImagePanel />
          ) : (
            <ElementSelector
              elements={elementOptions}
              onElementSelect={handleElementSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};
