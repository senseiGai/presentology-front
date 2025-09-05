import React from "react";
import clsx from "clsx";

export interface ElementOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ElementSelectorProps {
  elements: ElementOption[];
  onElementSelect: (elementId: string) => void;
  className?: string;
}

export const ElementSelector: React.FC<ElementSelectorProps> = ({
  elements,
  onElementSelect,
  className,
}) => {
  return (
    <div className={clsx("space-y-2", className)}>
      <div className="text-[14px] mb-4 font-medium text-[#6B7280] ">
        Добавить элемент
      </div>
      {elements.map((element) => (
        <button
          key={element.id}
          onClick={() => onElementSelect(element.id)}
          className={clsx(
            "w-full h-[52px] pl-[19px] cursor-pointer text-left  flex items-center gap-x-[11px] rounded-[8px] transition-all ease-in-out duration-300",
            "bg-[#F4F4F4] hover:bg-[#F3F4F6]"
          )}
        >
          <div className="flex-shrink-0 w-6 h-6 text-[#6B7280]">
            {element.icon}
          </div>
          <div className="flex-1">
            <div className="text-[18px] font-regular text-[#0B0911]">
              {element.label}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
