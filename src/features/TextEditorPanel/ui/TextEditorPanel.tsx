import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";
import GradientSparksIcon from "../../../../public/icons/GradientSparksIcon";
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
import ChevronDownIcon from "../../../../public/icons/ChevronDownIcon";
import DotListIcon from "../../../../public/icons/DotListIcon";
import NumberListIcon from "../../../../public/icons/NumberListIcon";
import GreenCheckMarkIcon from "../../../../public/icons/GreenCheckMarkIcon";
import BoldIcon from "../../../../public/icons/BoldIcon";
import ItalicIcon from "../../../../public/icons/ItalicIcon";
import UnderlineIcon from "../../../../public/icons/UnderlineIcon";
import BigCheckMarkIcon from "../../../../public/icons/BigCheckMarkIcon";

type TextStyle =
  | "Научный"
  | "Деловой"
  | "Разговорный"
  | "Продающий"
  | "Эмоциональный"
  | "Дружелюбный"
  | "Креативный"
  | "С юмором";
type FontSize = 10 | 12 | 14 | 16 | 18 | 20 | 24 | 32 | 48 | 64;
type TextAlign = "left" | "center" | "right";
type TextFormat = "bold" | "italic" | "underline" | "bulletList" | "numberList";

const textStyles: TextStyle[] = [
  "Научный",
  "Деловой",
  "Разговорный",
  "Продающий",
  "Эмоциональный",
  "Дружелюбный",
  "Креативный",
  "С юмором",
];
const fontSizes: FontSize[] = [10, 12, 14, 16, 18, 20, 24, 32, 48, 64];

const colors = [
  "#181818",
  "#666666",
  "#BBBBBB",
  "#EBEBEC",
  "#F8F8F8",
  "#FFFFFF",
  "#C5A4FC",
  "#A4BEFE",
  "#81EEF4",
  "#68EF96",
  "#FCDC84",
  "#FBB2A4",
  "#9568F8",
  "#698CFE",
  "#2FB9DB",
  "#0DCB74",
  "#F8B633",
  "#F46769",
  "#5335B3",
  "#354EB6",
  "#186F9D",
  "#07926E",
  "#B2741A",
  "#B0334A",
];

export const TextEditorPanel: React.FC = () => {
  const {
    selectedTextElement,
    setTextPosition,
    updateTextElementStyle,
    getTextElementStyle,
    deleteTextElement,
    clearTextSelection,
    setTextElementContent,
    getTextElementContent,
  } = usePresentationStore();

  // State for UI interactions
  const [aiInput, setAiInput] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<TextStyle[]>([]);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>(14);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [textFormats, setTextFormats] = useState<Set<TextFormat>>(new Set());
  const [selectedListType, setSelectedListType] = useState<
    "bulletList" | "numberList" | null
  >(null);
  const [selectedColor, setSelectedColor] = useState("#181818");
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState<
    "left" | "center" | "right" | null
  >(null);
  const [verticalAlign, setVerticalAlign] = useState<
    "top" | "center" | "bottom" | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [xPosition, setXPosition] = useState(20);
  const [yPosition, setYPosition] = useState(60);
  const [rotation, setRotation] = useState(0);
  const [customHue, setCustomHue] = useState(0);
  const [customColorPosition, setCustomColorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to detect list type from text content
  const detectListType = (text: string): "bulletList" | "numberList" | null => {
    if (!text) return null;
    const lines = text.split("\n");
    const firstLine = lines[0]?.trim();

    if (firstLine?.match(/^(•\s*|-\s*|\*\s*)/)) {
      return "bulletList";
    }
    if (firstLine?.match(/^\d+\.\s*/)) {
      return "numberList";
    }
    return null;
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fontDropdownRef.current &&
        !fontDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFontDropdown(false);
      }
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowColorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync UI with selected element styles
  useEffect(() => {
    if (selectedTextElement) {
      const elementStyle = getTextElementStyle(selectedTextElement);
      setFontSize(elementStyle.fontSize as FontSize);
      setTextAlign(elementStyle.textAlign);
      setSelectedColor(elementStyle.color);

      // Sync position values
      setXPosition(elementStyle.x || 0);
      setYPosition(elementStyle.y || 0);
      setRotation(elementStyle.rotation || 0);

      // Sync text formats
      const formats = new Set<TextFormat>();
      if (elementStyle.fontWeight === "bold") formats.add("bold");
      if (elementStyle.fontStyle === "italic") formats.add("italic");
      if (elementStyle.textDecoration === "underline") formats.add("underline");

      setTextFormats(formats);

      // Detect list type from saved content
      const savedContent = getTextElementContent(selectedTextElement);
      setSelectedListType(detectListType(savedContent || ""));
    } else {
      // Reset formatting state when no element is selected
      setTextFormats(new Set());
      setSelectedListType(null);
    }
  }, [selectedTextElement, getTextElementStyle, getTextElementContent]);

  // Early return after all hooks
  if (!selectedTextElement) {
    return null;
  }

  // Handle AI input changes
  const handleAiInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiInput(e.target.value);
  };

  // Handle element deletion
  const handleDeleteElement = () => {
    if (selectedTextElement) {
      console.log("Deleting element:", selectedTextElement);
      deleteTextElement(selectedTextElement);
    } else {
      console.log("No element selected for deletion");
    }
  };

  // Handle AI text submission
  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;

    setIsGenerating(true);
    try {
      // TODO: Implement actual AI text generation
      // For now, just use the input as-is
      if (selectedTextElement) {
        setTextElementContent(selectedTextElement, aiInput);
      }
      setAiInput("");
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }; // Handle style selection (max 3)
  const handleStyleSelect = (style: TextStyle) => {
    setSelectedStyles((prev) => {
      const newStyles = prev.includes(style)
        ? prev.filter((s) => s !== style)
        : prev.length < 3
        ? [...prev, style]
        : prev;

      setShowApplyButton(newStyles.length > 0);
      return newStyles;
    });
  };

  // Apply selected styles
  const handleApplyStyles = () => {
    if (selectedStyles.length > 0 && selectedTextElement) {
      updateTextElementStyle(selectedTextElement, {
        style: selectedStyles.join(", ") as any,
      });
      setSelectedStyles([]);
      setShowApplyButton(false);
    }
  };

  // Handle font size selection
  const handleFontSizeSelect = (size: FontSize) => {
    setFontSize(size);
    setShowFontDropdown(false);
    if (selectedTextElement) {
      updateTextElementStyle(selectedTextElement, { fontSize: size });
    }
  };

  // Handle text alignment
  const handleTextAlignChange = (align: TextAlign) => {
    setTextAlign(align);
    if (selectedTextElement) {
      updateTextElementStyle(selectedTextElement, { textAlign: align });
    }
  };

  // Handle text format toggles
  const handleFormatToggle = (format: TextFormat) => {
    setTextFormats((prev) => {
      const newFormats = new Set(prev);
      if (newFormats.has(format)) {
        newFormats.delete(format);
      } else {
        newFormats.add(format);
      }

      // Apply formatting changes to selected element
      if (selectedTextElement) {
        if (format === "bold") {
          const isBold = newFormats.has("bold");
          updateTextElementStyle(selectedTextElement, {
            fontWeight: isBold ? "bold" : "normal",
          });
        }
        if (format === "italic") {
          const isItalic = newFormats.has("italic");
          updateTextElementStyle(selectedTextElement, {
            fontStyle: isItalic ? "italic" : "normal",
          });
        }
        if (format === "underline") {
          const isUnderline = newFormats.has("underline");
          updateTextElementStyle(selectedTextElement, {
            textDecoration: isUnderline ? "underline" : "none",
          });
        }
      }

      return newFormats;
    });
  };

  // Handle list type selection (radio button behavior)
  const handleListTypeSelect = (listType: "bulletList" | "numberList") => {
    const currentListType = selectedListType === listType ? null : listType;
    setSelectedListType(currentListType);

    // Apply list formatting to the current text content
    if (selectedTextElement) {
      const currentContent = getTextElementContent(selectedTextElement) || "";
      let newContent = currentContent;

      // First, always remove existing list formatting to avoid overlapping
      const cleanContent = currentContent
        .split("\n")
        .map((line: string) => {
          return line.replace(/^(•\s*|-\s*|\*\s*|\d+\.\s*)/, "").trim();
        })
        .filter((line: string) => line)
        .join("\n");

      if (currentListType) {
        const lines = cleanContent
          .split("\n")
          .filter((line: string) => line.trim() !== "");

        if (currentListType === "bulletList") {
          newContent = lines
            .map((line: string) => {
              const trimmed = line.trim();
              return `• ${trimmed}`;
            })
            .join("\n");
        } else if (currentListType === "numberList") {
          newContent = lines
            .map((line: string, index: number) => {
              const trimmed = line.trim();
              return `${index + 1}. ${trimmed}`;
            })
            .join("\n");
        }
      } else {
        // Just use the clean content without any list formatting
        newContent = cleanContent;
      }

      setTextElementContent(selectedTextElement, newContent);
    }
  };

  // Handle horizontal alignment
  const handleHorizontalAlign = (align: "left" | "center" | "right") => {
    setHorizontalAlign((prev) => (prev === align ? null : align));

    if (selectedTextElement) {
      const slideWidth = 759;
      let newX = 0;

      if (align === "left") {
        newX = 0;
      } else if (align === "center") {
        newX = slideWidth / 2 - 100; // Approximate center, adjust as needed
      } else if (align === "right") {
        newX = slideWidth - 200; // Approximate right, adjust as needed
      }

      updateTextElementStyle(selectedTextElement, { x: newX });
    }
  };

  // Handle vertical alignment
  const handleVerticalAlign = (align: "top" | "center" | "bottom") => {
    setVerticalAlign((prev) => (prev === align ? null : align));

    if (selectedTextElement) {
      const slideHeight = 427;
      let newY = 0;

      if (align === "top") {
        newY = 0;
      } else if (align === "center") {
        newY = slideHeight / 2 - 25; // Approximate center, adjust as needed
      } else if (align === "bottom") {
        newY = slideHeight - 50; // Approximate bottom, adjust as needed
      }

      updateTextElementStyle(selectedTextElement, { y: newY });
    }
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (selectedTextElement) {
      updateTextElementStyle(selectedTextElement, { color });
    }
  };

  // Handle position changes
  const handlePositionChange = (
    field: "x" | "y" | "rotation",
    value: number
  ) => {
    if (field === "x") setXPosition(value);
    if (field === "y") setYPosition(value);
    if (field === "rotation") setRotation(value);

    setTextPosition({
      x: value,
      y: field === "y" ? value : yPosition,
      rotation: field === "rotation" ? value : rotation,
    });

    // Update element style with position changes
    if (selectedTextElement) {
      if (field === "x") {
        updateTextElementStyle(selectedTextElement, { x: value });
      } else if (field === "y") {
        updateTextElementStyle(selectedTextElement, { y: value });
      } else if (field === "rotation") {
        updateTextElementStyle(selectedTextElement, { rotation: value });
      }
    }
  };

  // Helper function to convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Helper function to determine if a color is light or dark
  const isLightColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace("#", "");
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Handle custom color picker click
  const handleCustomColorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCustomColorPosition({ x, y });

    // Convert position to HSL color
    const saturation = x;
    const lightness = 100 - y;
    const hexColor = hslToHex(customHue, saturation, lightness);

    setSelectedColor(hexColor);
    if (selectedTextElement) {
      updateTextElementStyle(selectedTextElement, { color: hexColor });
    }
  };

  // Handle hue slider click
  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const hue = x * 360;

    setCustomHue(hue);

    // Update color if position is set
    if (customColorPosition) {
      const saturation = customColorPosition.x;
      const lightness = 100 - customColorPosition.y;
      const hexColor = hslToHex(hue, saturation, lightness);

      setSelectedColor(hexColor);
      if (selectedTextElement) {
        updateTextElementStyle(selectedTextElement, { color: hexColor });
      }
    }
  };

  const isSubmitActive = aiInput.trim().length > 0;

  return (
    <div
      className="bg-white relative w-[274px]"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="w-full h-9 bg-[#F4F4F4] flex items-center px-4">
        <div className="text-[14px] font-medium text-[#0B0911] tracking-[-0.42px]">
          Генерация
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2 w-[242px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2 items-center">
              <Image
                src={"/gradient-sparks.svg"}
                alt="Gradient Sparks"
                width={24}
                height={24}
              />
              <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
                Изменить с ИИ
              </div>
            </div>
          </div>

          <div
            className={`h-[112px] relative rounded-[8px] bg-white border transition-colors ${
              isTextareaFocused
                ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE40]"
                : "border-[#E9E9E9]"
            }`}
          >
            <textarea
              value={aiInput}
              onChange={handleAiInputChange}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              placeholder="Пожелания к тексту"
              className="w-full h-[73px] absolute top-3 left-4 pr-10 outline-none resize-none text-[14px] font-normal text-[#0B0911] tracking-[-0.42px] placeholder-[#BEBEC0]"
              maxLength={500}
            />
            <div className="absolute right-[50px] bottom-2 text-[12px] text-[#BEBEC0] tracking-[-0.36px]">
              {aiInput.length} / 500 символов
            </div>
            <button
              onClick={handleAiSubmit}
              disabled={!isSubmitActive || isGenerating}
              className={`w-8 h-8 absolute right-2 bottom-2 flex items-center justify-center rounded-[8px] p-2 transition-all ${
                isSubmitActive && !isGenerating
                  ? "bg-[#BBA2FE] opacity-100 cursor-pointer"
                  : "bg-[#BBA2FE] opacity-50 cursor-not-allowed"
              }`}
            >
              <MiniRightArrowIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0 relative">
        <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
      </div>

      {/* Text Amount Section */}
      <div className="p-4">
        <div className="flex flex-col gap-2 w-[242px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2 items-center">
              <Image
                src={"/gradient-sparks.svg"}
                alt="Gradient Sparks"
                width={24}
                height={24}
              />
              <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
                Количество текста
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 h-8 w-full">
            <button className="flex-1 bg-[#F4F4F4] hover:bg-[#E9E9E9] flex gap-2 items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] text-[14px] text-[#8F8F92] font-medium tracking-[-0.42px]">
              <GrayPlusIcon />
              Больше
            </button>
            <button className="flex-1 bg-[#F4F4F4] hover:bg-[#E9E9E9] flex gap-2 items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] text-[14px] text-[#8F8F92] font-medium tracking-[-0.42px]">
              <GrayMinusIcon />
              Меньше
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0 relative">
        <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
      </div>

      {/* Style Selection Section */}
      <div className="p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2 items-center">
            <Image
              src={"/gradient-sparks.svg"}
              alt="Gradient Sparks"
              width={24}
              height={24}
            />
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              Стиль
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 max-w-[242px] mt-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            {textStyles.map((style) => (
              <button
                key={style}
                onClick={() => handleStyleSelect(style)}
                className={`flex-1 h-8 text-[14px] font-medium whitespace-nowrap rounded-[8px] flex items-center justify-center px-[53px] py-2 tracking-[-0.42px] transition-colors ${
                  selectedStyles.includes(style)
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#8F8F92] hover:bg-[#E9E9E9]"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        {showApplyButton && (
          <button
            onClick={handleApplyStyles}
            className="w-full flex flex-row items-center justify-center gap-x-2 h-[40px] bg-[#F4F4F4] text-[#0B0911] rounded-[8px] mt-2 text-[14px] font-medium tracking-[-0.42px] transition-colors hover:bg-[#F4F4F4]"
          >
            Применить стиль
            <GreenCheckMarkIcon />
          </button>
        )}
      </div>

      <div className="w-full h-9 bg-[#F4F4F4] flex items-center px-4 mt-2">
        <div className="text-[14px] font-medium text-[#0B0911] tracking-[-0.42px]">
          Стилизация
        </div>
      </div>

      {/* Position Section */}
      <div className="p-4">
        <div className="flex flex-col gap-2 w-[242px]">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Позиция
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <div className="flex-1 flex gap-0.5">
                <button
                  onClick={() => handleHorizontalAlign("left")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                    horizontalAlign === "left"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignLeftIcon
                    fill={horizontalAlign === "left" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleHorizontalAlign("center")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-[2px] transition-colors ${
                    horizontalAlign === "center"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignHorizontalCenterIcon
                    fill={horizontalAlign === "center" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleHorizontalAlign("right")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] transition-colors ${
                    horizontalAlign === "right"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignRightIcon
                    fill={horizontalAlign === "right" ? "#FFFFFF" : "#939396"}
                  />
                </button>
              </div>
              <div className="flex-1 flex gap-0.5">
                <button
                  onClick={() => handleVerticalAlign("top")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                    verticalAlign === "top"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignTopIcon
                    fill={verticalAlign === "top" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleVerticalAlign("center")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-[2px] transition-colors ${
                    verticalAlign === "center"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignVerticalIcon
                    fill={verticalAlign === "center" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleVerticalAlign("bottom")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] transition-colors ${
                    verticalAlign === "bottom"
                      ? "bg-[#BBA2FE]"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <AlignBottomIcon
                    fill={verticalAlign === "bottom" ? "#FFFFFF" : "#939396"}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex gap-2 flex-1">
                <div className="flex-1 h-8 relative rounded-[8px] border border-[#E9E9E9]">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4">
                    <XAsixIcon />
                  </div>
                  <input
                    type="number"
                    value={xPosition}
                    onChange={(e) =>
                      handlePositionChange("x", Number(e.target.value))
                    }
                    className="w-full h-full pl-6 pr-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-transparent"
                  />
                </div>
                <div className="flex-1 h-8 relative rounded-[8px] border border-[#E9E9E9]">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4">
                    <YAsixIcon />
                  </div>
                  <input
                    type="number"
                    value={yPosition}
                    onChange={(e) =>
                      handlePositionChange("y", Number(e.target.value))
                    }
                    className="w-full h-full pl-6 pr-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="w-18 h-8 relative rounded-[8px] border border-[#E9E9E9]">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4">
                  <AngleIcon />
                </div>
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) =>
                    handlePositionChange("rotation", Number(e.target.value))
                  }
                  className="w-full h-full pl-6 pr-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0 relative">
        <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
      </div>

      {/* Font Section */}
      <div className="p-4">
        <div className="flex flex-col gap-2 w-[242px]">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Шрифт
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <div className="w-[117px] h-8 relative" ref={fontDropdownRef}>
                <button
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className={`w-full h-full px-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-white rounded-[8px] border flex items-center justify-between ${
                    showFontDropdown
                      ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE]"
                      : "border-[#E9E9E9]"
                  }`}
                >
                  <span>{fontSize}</span>
                  <div
                    className={`transition-transform absolute right-2 top-1/2 -translate-y-1/2 ${
                      showFontDropdown ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDownIcon />
                  </div>
                </button>
                {showFontDropdown && (
                  <div className="absolute -top-20 left-0 mt-1 w-full bg-white border border-[#E9E9E9] rounded-[16px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] z-50 p-2 max-h-64 overflow-y-auto">
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleFontSizeSelect(size)}
                        className={`w-full h-8 px-2 text-[14px] font-medium text-left rounded-[8px] hover:bg-[#F4F4F4] transition-colors ${
                          fontSize === size ? "bg-[#F4F4F4]" : "bg-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-0.5 w-[117px]">
                <button
                  onClick={() => handleTextAlignChange("left")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                    textAlign === "left"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <TextAlignLeftIcon
                    fill={textAlign === "left" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleTextAlignChange("center")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-[2px] transition-colors ${
                    textAlign === "center"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <TextAlignCenterIcon
                    fill={textAlign === "center" ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleTextAlignChange("right")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] transition-colors ${
                    textAlign === "right"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <TextAlignRightIcon
                    fill={textAlign === "right" ? "#FFFFFF" : "#939396"}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex gap-0.5 w-[117px]">
                <button
                  onClick={() => handleFormatToggle("bold")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] font-bold transition-colors ${
                    textFormats.has("bold")
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <BoldIcon
                    fill={textFormats.has("bold") ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleFormatToggle("italic")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-[2px] italic transition-colors ${
                    textFormats.has("italic")
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <ItalicIcon
                    fill={textFormats.has("italic") ? "#FFFFFF" : "#939396"}
                  />
                </button>
                <button
                  onClick={() => handleFormatToggle("underline")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] underline transition-colors ${
                    textFormats.has("underline")
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <UnderlineIcon
                    fill={textFormats.has("underline") ? "#FFFFFF" : "#939396"}
                  />
                </button>
              </div>
              <div className="flex gap-0.5 w-[117px]">
                <button
                  onClick={() => handleListTypeSelect("bulletList")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                    selectedListType === "bulletList"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <DotListIcon
                    fill={
                      selectedListType === "bulletList" ? "#FFFFFF" : "#939396"
                    }
                  />
                </button>
                <button
                  onClick={() => handleListTypeSelect("numberList")}
                  className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] transition-colors ${
                    selectedListType === "numberList"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                  }`}
                >
                  <NumberListIcon
                    fill={
                      selectedListType === "numberList" ? "#FFFFFF" : "#939396"
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-0 relative">
        <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-2 w-[242px]" ref={colorDropdownRef}>
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Цвет
          </div>
          <div className="flex flex-col gap-2 w-full">
            {showColorDropdown ? (
              <div className="w-full h-[160px] mt-1 border border-[#E9E9E9] rounded-[4px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                <div
                  className="relative w-full h-[117px] bg-gradient-to-r  to-red-500 cursor-crosshair"
                  style={{
                    background: `linear-gradient(to bottom, 
                           rgba(0,0,0,0) 0%, 
                           rgba(0,0,0,1) 100%), 
                           linear-gradient(to right, 
                           rgba(255,255,255,1) 0%, 
                           hsla(${customHue}, 100%, 50%, 1) 100%)`,
                  }}
                  onClick={handleCustomColorClick}
                >
                  {/* Custom color picker dot */}
                  {customColorPosition && (
                    <div
                      className="absolute w-3 h-3 border-2 border-[#D9D9D9] rounded-full shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${customColorPosition.x}%`,
                        top: `${customColorPosition.y}%`,
                      }}
                    />
                  )}
                </div>

                <div
                  className="relative w-full h-[21.5px] cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)",
                  }}
                  onClick={handleHueClick}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 h-[159px] w-full">
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 h-[37px] w-full">
                    {colors
                      .slice(rowIndex * 6, (rowIndex + 1) * 6)
                      .map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className="relative flex-1 h-[37px] rounded-[4px] transition-transform hover:scale-105"
                          style={{
                            backgroundColor: color,
                            border:
                              color === "#FFFFFF"
                                ? "1px solid #F4F4F4"
                                : "none",
                          }}
                        >
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BigCheckMarkIcon
                                fill={
                                  isLightColor(color) ? "#000000" : "#FFFFFF"
                                }
                              />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}
            <div className="h-8 w-full relative">
              <button
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className={`w-full h-full px-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-white rounded-[8px] border flex items-center justify-between ${
                  showColorDropdown
                    ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE]"
                    : "border-[#E9E9E9]"
                }`}
              >
                <span>Выбрать другой</span>
                <div
                  className={` transition-transform ${
                    showColorDropdown ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0 relative">
        <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
      </div>

      {/* Delete Section */}
      <div className="p-4 pb-8">
        <div className="flex flex-col gap-2 w-[242px]">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Объект
          </div>
          <button
            onClick={handleDeleteElement}
            className="w-full h-10 bg-[#F4F4F4] text-[#FF514F] rounded-[8px] text-[18px] font-normal tracking-[-0.36px] flex items-center justify-center gap-2 pl-4 pr-6 py-2 transition-colors hover:bg-[#EFEFEF]"
          >
            <GrayTrashIcon className="w-6 h-6" />
            Удалить
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute border-[#E9E9E9] border-l inset-0 pointer-events-none"
      />
    </div>
  );
};
