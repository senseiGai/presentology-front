import React from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";
import GradientSparksIcon from "../../../../public/icons/GradientSparksIcon";
import ArrowRight from "../../../../public/icons/ArrowRight";
import MiniRightArrowIcon from "../../../../public/icons/MiniRightArrowIcon";
import GrayPlusIcon from "../../../../public/icons/GrayPlusIcon";
import GrayMinusIcon from "../../../../public/icons/GrayMinusIcon";
import AlignLeftIcon from "../../../../public/icons/AlignLeftIcon";
import AlignHorizontalCenterIcon from "../../../../public/icons/AlignHorizontalCenterIcon";
import AlignRightIcon from "../../../../public/icons/AlignRightIcon";
import AlignVerticalIcon from "../../../../public/icons/AlignVerticalIcon";
import AlignTopIcon from "../../../../public/icons/AlignTopIcon";
import AlignBottomIcon from "../../../../public/icons/AlignBottomIcon";
import XAsixIcon from "../../../../public/icons/XAsixIcon";
import YAsixIcon from "../../../../public/icons/YAsixIcon";
import AngleIcon from "../../../../public/icons/AngleIcon";
import TextAlignLeftIcon from "../../../../public/icons/TextAlignLeftIcon";
import TextAlignCenterIcon from "../../../../public/icons/TextAlignCenterIcon";
import TextAlignRightIcon from "../../../../public/icons/TextAlignRightIcon";

export const TextEditorPanel: React.FC = () => {
  const {
    selectedTextElement,
    textEditorContent,
    textPosition,
    textStyle,
    setTextEditorContent,
    setTextPosition,
    setTextStyle,
    clearTextSelection,
  } = usePresentationStore();

  if (!selectedTextElement) {
    return null;
  }

  const handleStyleChange = (newStyle: string) => {
    setTextStyle({ style: newStyle as any });
  };

  const handlePositionChange = (
    field: "x" | "y" | "rotation",
    value: number
  ) => {
    setTextPosition({
      ...textPosition,
      [field]: value,
    });
  };

  const handleTextAlignChange = (align: "left" | "center" | "right") => {
    setTextStyle({ textAlign: align });
  };

  const handleFontSizeChange = (size: number) => {
    setTextStyle({ fontSize: size });
  };

  const handleColorChange = (color: string) => {
    setTextStyle({ color });
  };

  const handleDeleteElement = () => {
    clearTextSelection();
  };

  const styles = [
    { id: "normal", label: "Научный" },
    { id: "business", label: "Деловой" },
    { id: "conversational", label: "Разговорный" },
    { id: "selling", label: "Продающий" },
    { id: "emotional", label: "Эмоциональный" },
    { id: "friendly", label: "Дружелюбный" },
    { id: "creative", label: "Креативный" },
    { id: "humorous", label: "С юмором" },
  ];

  const alignmentOptions = [
    { id: "left", icon: <AlignLeftIcon /> }, // Left align icon placeholder
    { id: "center", icon: <AlignHorizontalCenterIcon /> }, // Center align icon placeholder
    { id: "right", icon: <AlignRightIcon /> }, // Right align icon placeholder
    { id: "justify", icon: <AlignVerticalIcon /> }, // Justify icon placeholder
    { id: "top-left", icon: <AlignTopIcon /> }, // Top-left icon placeholder
    { id: "top-right", icon: <AlignBottomIcon /> }, // Top-right icon placeholder
  ];

  const colorOptions = [
    // Black and gray colors
    "#000000",
    "#4A4A4A",
    "#9E9E9E",
    "#BDBDBD",
    "#E0E0E0",
    // Purple colors
    "#BBA2FE",
    "#A78BFA",
    "#7C3AED",
    "#5B21B6",
    // Cyan colors
    "#67E8F9",
    "#22D3EE",
    "#0891B2",
    "#0E7490",
    // Green colors
    "#86EFAC",
    "#4ADE80",
    "#16A34A",
    "#15803D",
    // Yellow colors
    "#FDE68A",
    "#FBBF24",
    "#D97706",
    "#92400E",
    // Red colors
    "#FCA5A5",
    "#F87171",
    "#DC2626",
    "#991B1B",
    // Blue colors
    "#93C5FD",
    "#3B82F6",
    "#1D4ED8",
    "#1E3A8A",
    // More colors
    "#A78BFA",
    "#C084FC",
    "#D946EF",
    "#E11D48",
    "#10B981",
    "#059669",
    "#047857",
    "#065F46",
  ];

  return (
    <div>
      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="text-[14px] font-normal text-[#8F8F92]">
              Изменить с ИИ
            </div>
            <div className="h-[112px] mt-2 relative focus:outline-none border-[#E9E9E9] focus:border-[#BBA2FE] rounded-[8px]  border-[1px]">
              <textarea
                value={textEditorContent}
                onChange={(e) => setTextEditorContent(e.target.value)}
                placeholder="Пожелания к тексту"
                className="w-full max-h-[85px] absolute mb-10 pt-3 px-4 outline-none resize-none text-[14px]"
                maxLength={500}
              />
              <div className="bottom-2 right-12 absolute text-[12px] text-[#BEBEC0] mt-1">
                {textEditorContent.length} / 500 символов
              </div>
              <button className="w-[32px] h-[32px] absolute right-2 bottom-2 bg-[#BBA2FE] flex items-center justify-center text-white rounded-[8px] text-[14px] font-medium mt-3 hover:bg-[#A693FD] transition-colors">
                <MiniRightArrowIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[1px] border-[#E9E9E9] w-full mt-2" />

      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="text-[14px] font-normal text-[#8F8F92] mb-2">
              Количество текста
            </div>
            <div className="flex gap-0.5">
              <button className="flex-1 gap-x-2.5 h-[32px] bg-[#F4F4F4] rounded-tr-[2px] rounded-br-[2px] rounded-tl-[8px] rounded-bl-[8px] text-[14px] text-[#8F8F92] hover:text-[#0B0911] hover:bg-[#E5E7EB] cursor-pointer transition-colors flex items-center justify-center">
                <GrayPlusIcon /> Больше
              </button>
              <button className="flex-1 gap-x-2.5 h-[32px] bg-[#F4F4F4] rounded-tl-[2px] cursor-pointer rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] text-[14px] text-[#8F8F92] hover:text-[#0B0911] hover:bg-[#E5E7EB] transition-colors flex items-center justify-center">
                <GrayMinusIcon /> Меньше
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[1px] border-[#E9E9E9] w-full mt-2" />

      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="text-[14px] font-normal text-[#8F8F92] mb-2">
              Стиль
            </div>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`h-[32px] text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center justify-center ${
                    textStyle.style === style.id
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] text-[#8F8F92] hover:text-[#0B0911] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[1px] border-[#E9E9E9] w-full mt-2" />

      <div className="p-4">
        <div className="text-[14px] font-normal text-[#8F8F92] mb-2">
          Позиция
        </div>
        <div className="flex flex-row w-full gap-x-2">
          <div className="grid grid-cols-3 gap-1 flex-1">
            {alignmentOptions.slice(0, 3).map((option, index) => (
              <button
                key={index}
                className={`flex-1 h-[32px] cursor-pointer bg-[#F4F4F4] flex items-center justify-center text-[12px] hover:bg-[#E5E7EB] transition-colors ${
                  index === 0 && "rounded-l-[8px] rounded-r-[2px]"
                } ${index === 1 && "rounded-[2px]"}
                ${index === 2 && "rounded-r-[8px] rounded-l-[2px]"} 
                `}
              >
                {option.icon}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 flex-1">
            {alignmentOptions.slice(3, 6).map((option, index) => (
              <button
                key={index}
                className={`flex-1 h-[32px] cursor-pointer bg-[#F4F4F4] flex items-center justify-center text-[12px] hover:bg-[#E5E7EB] transition-colors ${
                  index === 0 && "rounded-l-[8px] rounded-r-[2px]"
                } ${index === 1 && "rounded-[2px]"}
                ${index === 2 && "rounded-r-[8px] rounded-l-[2px]"} 
                `}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-row justify-between gap-2 mt-2">
          <div className="h-[32px] w-[86.5px] relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <XAsixIcon />
            </div>
            <input
              type="number"
              value={textPosition.x}
              onChange={(e) =>
                handlePositionChange("x", Number(e.target.value))
              }
              className="w-full h-full absolute pl-6 pr-2 border-[1px] border-[#E9E9E9] rounded-[8px] text-[12px] focus:outline-none focus:border-[#BBA2FE]"
            />
          </div>
          <div className="h-[32px] w-[86.5px] relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <YAsixIcon />
            </div>
            <input
              type="number"
              value={textPosition.y}
              onChange={(e) =>
                handlePositionChange("y", Number(e.target.value))
              }
              className="w-full h-full absolute pl-6 pr-2 border-[1px] border-[#E9E9E9] rounded-[8px] text-[12px] focus:outline-none focus:border-[#BBA2FE]"
            />
          </div>
          <div className="h-[32px] w-[53px] relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <AngleIcon />
            </div>
            <input
              type="number"
              value={textPosition.rotation}
              onChange={(e) =>
                handlePositionChange("rotation", Number(e.target.value))
              }
              className="w-full h-full absolute pl-6.5 border-[1px] border-[#E9E9E9] rounded-[8px] text-[12px] focus:outline-none focus:border-[#BBA2FE]"
            />
          </div>
        </div>
      </div>

      <div className="border-t-[1px] border-[#E9E9E9] w-full mt-2" />

      <div className="p-4">
        <div className="text-[14px] font-normal text-[#8F8F92] mb-2">Шрифт</div>
        <div className="flex flex-row w-full gap-x-2">
          <select
            value={textStyle.fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-full h-[32px] px-2 border-[1px] border-[#E9E9E9] rounded-[8px] text-[14px] focus:outline-none focus:border-[#BBA2FE] bg-white"
          >
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="32">32</option>
            <option value="48">48</option>
          </select>

          <div className="flex w-full gap-2">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                onClick={() => handleTextAlignChange(align as any)}
                className={`flex-1 h-[32px] rounded-[4px] text-[14px] transition-colors flex items-center justify-center ${
                  textStyle.textAlign === align
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E5E7EB]"
                }`}
              >
                {align === "left" ? (
                  <TextAlignLeftIcon />
                ) : align === "center" ? (
                  <TextAlignCenterIcon />
                ) : (
                  <TextAlignRightIcon />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 h-[32px] bg-[#F4F4F4] rounded-[4px] text-[14px] font-bold hover:bg-[#E5E7EB] transition-colors flex items-center justify-center">
            B
          </button>
          <button className="flex-1 h-[32px] bg-[#F4F4F4] rounded-[4px] text-[14px] italic hover:bg-[#E5E7EB] transition-colors flex items-center justify-center">
            I
          </button>
          <button className="flex-1 h-[32px] bg-[#F4F4F4] rounded-[4px] text-[14px] underline hover:bg-[#E5E7EB] transition-colors flex items-center justify-center">
            U
          </button>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-3">
        <div className="text-[14px] font-medium text-[#0B0911]">Цвет</div>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color, index) => (
            <button
              key={`color-${index}-${color}`}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-[4px] border-2 transition-all ${
                textStyle.color === color
                  ? "border-[#BBA2FE] scale-110"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-2">
          <select className="w-full h-[32px] px-2 border border-[#E5E7EB] rounded-[4px] text-[14px] focus:outline-none focus:border-[#BBA2FE] bg-white">
            <option>Выбрать другой</option>
          </select>
        </div>
      </div>

      {/* Object */}
      <div className="space-y-3">
        <div className="text-[14px] font-medium text-[#0B0911]">Объект</div>
        <button
          onClick={handleDeleteElement}
          className="w-full h-[40px] bg-[#F4F4F4] text-[#DC2626] rounded-[8px] text-[14px] font-medium hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2"
        >
          <GrayTrashIcon className="w-4 h-4" />
          Удалить
        </button>
      </div>
    </div>
  );
};
