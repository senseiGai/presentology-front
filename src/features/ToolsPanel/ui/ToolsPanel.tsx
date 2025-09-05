import React from "react";
import {
  ElementSelector,
  type ElementOption,
} from "@/features/ElementSelector";
import { Button } from "@/shared/ui/Button";

interface ToolsPanelProps {
  isGenerating: boolean;
  generatedSlides: number[];
  totalSlides: number;
  elementOptions: ElementOption[];
  selectedElement: string;
  onElementSelect: (elementId: string) => void;
  onFeedbackClick: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isGenerating,
  generatedSlides,
  totalSlides,
  elementOptions,
  onElementSelect,
}) => {
  return (
    <div
      className="w-[274px] bg-white border-l-[1px] border-[#E9E9E9] p-4 flex-shrink-0 overflow-y-auto"
      style={{ boxShadow: "-4px 0px 4px 0px #BBA2FE1A" }}
    >
      {isGenerating && (
        <div className="mb-6">
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
        <>
          <ElementSelector
            elements={elementOptions}
            onElementSelect={onElementSelect}
          />
        </>
      )}
    </div>
  );
};
