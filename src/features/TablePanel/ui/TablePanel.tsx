"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

// Import icons
import ChevronDownIcon from "../../../../public/icons/ChevronDownIcon";
import TextAlignLeftIcon from "../../../../public/icons/TextAlignLeftIcon";
import TextAlignCenterIcon from "../../../../public/icons/TextAlignCenterIcon";
import TextAlignRightIcon from "../../../../public/icons/TextAlignRightIcon";
import BoldIcon from "../../../../public/icons/BoldIcon";
import ItalicIcon from "../../../../public/icons/ItalicIcon";
import UnderlineIcon from "../../../../public/icons/UnderlineIcon";
import DotListIcon from "../../../../public/icons/DotListIcon";
import NumberListIcon from "../../../../public/icons/NumberListIcon";
import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";
import BigCheckMarkIcon from "../../../../public/icons/BigCheckMarkIcon";
import FileCsvIcon from "../../../../public/icons/FileCsvIcon";
import CheckCircleIcon from "../../../../public/icons/CheckCircleIcon";
import BigFolderIcon from "../../../../public/icons/BigFolderIcon";
import ThicknessIcon from "../../../../public/icons/ThicknessIcon";

// Define types
type TableStyle = "Обычная" | "Полосатая" | "Рамочная" | "Минимальная";
type TextAlign = "left" | "center" | "right";
type TextFormat = "bold" | "italic" | "underline";
type ListType = "bulletList" | "numberList";
type FontSize = 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32;

// Color palette
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

const borderThickness = [1, 2, 3, 4, 5];
const fontSizes: FontSize[] = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

export const TablePanel: React.FC = () => {
  const { clearTableSelection } = usePresentationStore();

  // State for form data
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(
    null
  );
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);
  const [isFileChanged, setIsFileChanged] = useState(false);

  // State for styling options
  const [selectedBorderThickness, setSelectedBorderThickness] = useState(1);
  const [selectedBorderColor, setSelectedBorderColor] = useState("#181818");
  const [selectedTextColor, setSelectedTextColor] = useState("#181818");
  const [fontSize, setFontSize] = useState<FontSize>(14);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [textFormats, setTextFormats] = useState<Set<TextFormat>>(new Set());
  const [selectedListType, setSelectedListType] = useState<ListType | null>(
    null
  );

  // UI state
  const [showBorderColorDropdown, setShowBorderColorDropdown] = useState(false);
  const [showTextColorDropdown, setShowTextColorDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showThicknessDropdown, setShowThicknessDropdown] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Custom color picker state
  const [customBorderHue, setCustomBorderHue] = useState(0);
  const [customBorderColorPosition, setCustomBorderColorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [customTextHue, setCustomTextHue] = useState(0);
  const [customTextColorPosition, setCustomTextColorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Refs for dropdowns
  const borderColorDropdownRef = useRef<HTMLDivElement>(null);
  const textColorDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const thicknessDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial values to detect changes
  const [initialTaskDescription] = useState(taskDescription);
  const [initialFile] = useState<File | null>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        borderColorDropdownRef.current &&
        !borderColorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBorderColorDropdown(false);
      }
      if (
        textColorDropdownRef.current &&
        !textColorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTextColorDropdown(false);
      }
      if (
        fontDropdownRef.current &&
        !fontDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFontDropdown(false);
      }
      if (
        thicknessDropdownRef.current &&
        !thicknessDropdownRef.current.contains(event.target as Node)
      ) {
        setShowThicknessDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if parameters have changed
  useEffect(() => {
    setIsDescriptionChanged(taskDescription !== initialTaskDescription);
  }, [taskDescription, initialTaskDescription]);

  useEffect(() => {
    setIsFileChanged(uploadedFile !== initialFile);
  }, [uploadedFile, initialFile]);

  // Handlers
  const handleTaskDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTaskDescription(e.target.value);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Можем загрузить только один файл
    const file = files[0];
    if (
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    )
      return;

    // Если уже есть файл, заменяем его
    setUploadedFile(null);
    setFileUploadProgress(0);

    // Симулируем загрузку файла
    const simulateUpload = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setFileUploadProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);
            setUploadedFile(file);
            setFileUploadProgress(null);
            resolve();
          }
        }, 100);
      });
    };

    await simulateUpload();
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setFileUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleGenerate = () => {
    console.log("Generate table with:", {
      taskDescription,
      uploadedFile: uploadedFile?.name,
      borderThickness: selectedBorderThickness,
      borderColor: selectedBorderColor,
      textColor: selectedTextColor,
      fontSize,
      textAlign,
      textFormats: Array.from(textFormats),
      listType: selectedListType,
    });

    setIsGenerated(true);
    setIsDescriptionChanged(false);
    setIsFileChanged(false);
  };

  const handleBorderThicknessSelect = (thickness: number) => {
    setSelectedBorderThickness(thickness);
    setShowThicknessDropdown(false);
  };

  const handleColorSelect = (color: string, type: "border" | "text") => {
    if (type === "border") {
      setSelectedBorderColor(color);
      setShowBorderColorDropdown(false);
    } else {
      setSelectedTextColor(color);
      setShowTextColorDropdown(false);
    }
  };

  const handleFontSizeSelect = (size: FontSize) => {
    setFontSize(size);
    setShowFontDropdown(false);
  };

  const handleTextAlignChange = (align: TextAlign) => {
    setTextAlign(align);
  };

  const handleFormatToggle = (format: TextFormat) => {
    setTextFormats((prev) => {
      const newFormats = new Set(prev);
      if (newFormats.has(format)) {
        newFormats.delete(format);
      } else {
        newFormats.add(format);
      }
      return newFormats;
    });
  };

  const handleListTypeSelect = (listType: ListType) => {
    setSelectedListType((prev) => (prev === listType ? null : listType));
  };

  const handleDelete = () => {
    clearTableSelection();
  };

  // Helper function to check if color is light
  const isLightColor = (color: string) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
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

  // Handle custom color picker click for border
  const handleCustomBorderColorClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCustomBorderColorPosition({ x, y });

    // Convert position to HSL color
    const saturation = x;
    const lightness = 100 - y;
    const hexColor = hslToHex(customBorderHue, saturation, lightness);

    setSelectedBorderColor(hexColor);
  };

  // Handle hue slider click for border
  const handleBorderHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const hue = x * 360;

    setCustomBorderHue(hue);

    // Update color if position is set
    if (customBorderColorPosition) {
      const saturation = customBorderColorPosition.x;
      const lightness = 100 - customBorderColorPosition.y;
      const hexColor = hslToHex(hue, saturation, lightness);

      setSelectedBorderColor(hexColor);
    }
  };

  // Handle custom color picker click for text
  const handleCustomTextColorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCustomTextColorPosition({ x, y });

    // Convert position to HSL color
    const saturation = x;
    const lightness = 100 - y;
    const hexColor = hslToHex(customTextHue, saturation, lightness);

    setSelectedTextColor(hexColor);
  };

  // Handle hue slider click for text
  const handleTextHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const hue = x * 360;

    setCustomTextHue(hue);

    // Update color if position is set
    if (customTextColorPosition) {
      const saturation = customTextColorPosition.x;
      const lightness = 100 - customTextColorPosition.y;
      const hexColor = hslToHex(hue, saturation, lightness);

      setSelectedTextColor(hexColor);
    }
  };

  const isSubmitActive = taskDescription.trim().length > 0;
  const hasParameterChanges = isDescriptionChanged || isFileChanged;
  const isButtonDisabled =
    !isSubmitActive || (isGenerated && !hasParameterChanges);
  const showWarning = isGenerated && hasParameterChanges;

  return (
    <div
      className="bg-white relative w-[274px] overflow-y-auto"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* Generation Section Header */}
      <div className="w-full h-9 bg-[#F4F4F4] flex items-center px-4">
        <div className="text-[14px] font-medium text-[#0B0911] tracking-[-0.42px]">
          Генерация
        </div>
      </div>

      {/* Main Generation Content */}
      <div className="p-4 space-y-6">
        {/* AI Creation Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Image
              src="/gradient-sparks.svg"
              alt="Sparkle"
              width={24}
              height={24}
            />
            <span className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              Создать с ИИ
            </span>
          </div>

          {/* Step 1: Task Description */}
          <div className="space-y-2">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              1. Опишите задачу
            </div>
            <div
              className={`h-[112px] relative rounded-[8px] bg-white border transition-colors ${
                isTextareaFocused
                  ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE40]"
                  : "border-[#E9E9E9]"
              }`}
            >
              <textarea
                value={taskDescription}
                onChange={handleTaskDescriptionChange}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder="Сделай таблицу сравнения яблок и груш на 5 строк"
                className="w-full h-[73px] absolute top-3 left-4 pr-10 outline-none resize-none text-[14px] font-normal text-[#0B0911] tracking-[-0.42px] placeholder-[#BEBEC0]"
                maxLength={500}
              />
              <div className="absolute right-4 bottom-2 text-[12px] text-[#BEBEC0] tracking-[-0.36px]">
                {taskDescription.length} / 500 символов
              </div>
            </div>
          </div>

          {/* Step 2: File Upload */}
          <div className="space-y-2">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              2. Загрузите файл (не обязательно)
            </div>

            {uploadedFile ? (
              // Show uploaded file
              <div className="flex gap-2 items-center justify-start w-full mt-4">
                <FileCsvIcon className="shrink-0 size-6" />
                <div className="flex flex-col gap-1 grow min-w-0">
                  <div className="flex items-start justify-between w-full text-[12px] font-normal tracking-[-0.36px]">
                    <div className="text-[#0B0911] truncate">
                      {uploadedFile.name}
                    </div>
                    <div className="text-[#00CF1B] shrink-0">Загружено</div>
                  </div>
                  <div className="bg-[#F4F4F4] h-1 rounded-[8px] w-full overflow-hidden">
                    <div className="bg-[#00CF1B] h-1 rounded-[8px] w-full" />
                  </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  <CheckCircleIcon className="size-6" />
                  <button
                    onClick={handleFileRemove}
                    className="size-6 flex items-center justify-center"
                  >
                    <GrayTrashIcon />
                  </button>
                </div>
              </div>
            ) : fileUploadProgress !== null ? (
              // Show upload progress
              <div className="flex gap-2 items-center justify-start w-full">
                <FileCsvIcon className="shrink-0 size-6" />
                <div className="flex flex-col gap-1 grow min-w-0">
                  <div className="flex items-start justify-between w-full text-[12px] font-normal tracking-[-0.36px]">
                    <div className="text-[#0B0911]">Загрузка...</div>
                    <div className="text-[#8F8F92]">{fileUploadProgress}%</div>
                  </div>
                  <div className="bg-[#F4F4F4] h-1 rounded-[8px] w-full overflow-hidden">
                    <div
                      className="bg-[#00CF1B] h-1 rounded-[8px] transition-all duration-300"
                      style={{ width: `${fileUploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-1 flex-wrap">
                  <div className="bg-[#DDF3E4] w-[38px] h-[24px] flex items-center justify-center rounded-[4px]">
                    <span className="text-[12px] font-medium text-[#18794E] tracking-[-0.36px]">
                      .csv
                    </span>
                  </div>
                  <div className="bg-[#E4F7C7] w-[38px] h-[24px] flex items-center justify-center rounded-[4px]">
                    <span className="text-[12px] font-medium text-[#5D770D] tracking-[-0.36px]">
                      .xlsx
                    </span>
                  </div>
                </div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleFileInputClick}
                  className="bg-[#F3F6FF] h-[150px] rounded-[8px] border border-dashed border-[#C0C0C1] flex flex-col items-center justify-center cursor-pointer hover:bg-[#EEF2FF] transition-colors relative"
                >
                  <div className="flex flex-col gap-1.5 items-center justify-center w-[210px]">
                    <BigFolderIcon />
                    <div className="text-[14px] font-normal text-[#8F8F92] text-center tracking-[-0.42px] leading-[1.2]">
                      Перетащите сюда файлы
                      <br />
                      или нажмите для выбора
                    </div>
                  </div>
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Generate Button */}
          <div className="space-y-4">
            <button
              onClick={handleGenerate}
              disabled={isButtonDisabled}
              className={`w-full h-10 rounded-[8px] text-[18px] font-normal tracking-[-0.36px] transition-all ${
                !isButtonDisabled
                  ? "bg-[#BBA2FE] text-white hover:bg-[#A693FD] cursor-pointer"
                  : "bg-[#DDD1FF] text-white cursor-not-allowed"
              }`}
            >
              {isGenerated ? "Перегенерировать" : "Сгенерировать"}
            </button>

            {/* Warning message when parameters changed after generation */}
            {showWarning && (
              <div className="space-y-2">
                <div className="text-[14px] font-normal text-[#BBA2FE] tracking-[-0.42px]">
                  Таблица полностью обновится и заменится на новую
                </div>
                <div className="text-[14px] font-normal text-[#BBA2FE] tracking-[-0.42px]">
                  Максимальный размер таблицы - 8х8
                </div>
              </div>
            )}

            {/* Always show table size limit when no changes */}
            {!showWarning && (
              <div className="text-[14px] font-normal text-[#BBA2FE] tracking-[-0.42px]">
                Максимальный размер таблицы - 8х8
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styling Section Header */}
      <div className="w-full h-9 bg-[#F4F4F4] flex items-center px-4">
        <div className="text-[14px] font-medium text-[#0B0911] tracking-[-0.42px]">
          Стилизация
        </div>
      </div>

      {/* Styling Content */}
      <div className="space-y-4">
        {/* Border Thickness */}
        <div className="p-4 space-y-2">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Толщина границ
          </div>
          <div className="h-8 relative" ref={thicknessDropdownRef}>
            <button
              onClick={() => setShowThicknessDropdown(!showThicknessDropdown)}
              className="w-full h-8 px-2 rounded-[8px] border border-[#E9E9E9] bg-white flex items-center gap-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px]"
            >
              <ThicknessIcon />
              {selectedBorderThickness}
            </button>

            {showThicknessDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E9E9E9] rounded-[8px] shadow-lg z-50 max-h-40 overflow-y-auto">
                {borderThickness.map((thickness) => (
                  <button
                    key={thickness}
                    onClick={() => handleBorderThicknessSelect(thickness)}
                    className="w-full h-8 px-2 text-[12px] font-normal text-left hover:bg-[#F4F4F4] transition-colors flex items-center gap-2"
                  >
                    {thickness}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-0 relative">
          <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
        </div>

        {/* Border Color */}
        <div className="p-4 space-y-2" ref={borderColorDropdownRef}>
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Цвет границ
          </div>

          {showBorderColorDropdown ? (
            <div className="space-y-2">
              <div className="w-full h-[160px] mt-1 border border-[#E9E9E9] rounded-[4px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                <div
                  className="relative w-full h-[138.5px] cursor-pointer"
                  style={{
                    background: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%), linear-gradient(to right, rgba(255,255,255,1) 0%, hsl(${customBorderHue}, 100%, 50%) 100%)`,
                  }}
                  onClick={handleCustomBorderColorClick}
                >
                  {customBorderColorPosition && (
                    <div
                      className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
                      style={{
                        left: `${customBorderColorPosition.x}%`,
                        top: `${customBorderColorPosition.y}%`,
                        transform: "translate(-50%, -50%)",
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
                  onClick={handleBorderHueClick}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 h-[159px]">
              {Array.from({ length: 4 }, (_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 h-[37px]">
                  {colors
                    .slice(rowIndex * 6, (rowIndex + 1) * 6)
                    .map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color, "border")}
                        className="relative flex-1 h-[37px] rounded-[4px] transition-transform hover:scale-105"
                        style={{
                          backgroundColor: color,
                          border:
                            color === "#FFFFFF" ? "1px solid #F4F4F4" : "none",
                        }}
                      >
                        {selectedBorderColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BigCheckMarkIcon
                              fill={isLightColor(color) ? "#000000" : "#FFFFFF"}
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
              onClick={() =>
                setShowBorderColorDropdown(!showBorderColorDropdown)
              }
              className={`w-full h-full px-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-white rounded-[8px] border flex items-center justify-between ${
                showBorderColorDropdown
                  ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE]"
                  : "border-[#E9E9E9]"
              }`}
            >
              <span>Выбрать другой</span>
              <div
                className={` transition-transform ${
                  showBorderColorDropdown ? "rotate-180" : ""
                }`}
              >
                <ChevronDownIcon />
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-0 relative">
          <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
        </div>

        {/* Font */}
        <div className="p-4 space-y-2">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Шрифт
          </div>

          <div className="flex gap-2 w-full">
            {/* Font Size */}
            <div className="w-[117px] h-8 relative" ref={fontDropdownRef}>
              <button
                onClick={() => setShowFontDropdown(!showFontDropdown)}
                className="w-full h-8 px-2 rounded-[8px] border border-[#E9E9E9] bg-white flex items-center justify-between text-[12px] font-normal text-[#0B0911] tracking-[-0.36px]"
              >
                <span>{fontSize}</span>
                <ChevronDownIcon />
              </button>

              {showFontDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E9E9E9] rounded-[8px] shadow-lg z-50 max-h-40 overflow-y-auto">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeSelect(size)}
                      className="w-full h-8 px-2 text-[12px] font-normal text-left hover:bg-[#F4F4F4] transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Alignment */}
            <div className="w-[117px] flex gap-0.5">
              <button
                onClick={() => handleTextAlignChange("left")}
                className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                  textAlign === "left"
                    ? "bg-[#BBA2FE]"
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
                    ? "bg-[#BBA2FE]"
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
                    ? "bg-[#BBA2FE]"
                    : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                }`}
              >
                <TextAlignRightIcon
                  fill={textAlign === "right" ? "#FFFFFF" : "#939396"}
                />
              </button>
            </div>
          </div>

          {/* Text Formatting */}
          <div className="flex gap-2 w-full">
            {/* Text Style */}
            <div className="w-[117px] flex gap-0.5">
              <button
                onClick={() => handleFormatToggle("bold")}
                className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                  textFormats.has("bold")
                    ? "bg-[#BBA2FE]"
                    : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                }`}
              >
                <BoldIcon
                  fill={textFormats.has("bold") ? "#FFFFFF" : "#939396"}
                />
              </button>
              <button
                onClick={() => handleFormatToggle("italic")}
                className={`flex-1 h-8 flex items-center justify-center p-2 rounded-[2px] transition-colors ${
                  textFormats.has("italic")
                    ? "bg-[#BBA2FE]"
                    : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                }`}
              >
                <ItalicIcon
                  fill={textFormats.has("italic") ? "#FFFFFF" : "#939396"}
                />
              </button>
              <button
                onClick={() => handleFormatToggle("underline")}
                className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[2px] rounded-bl-[2px] rounded-tr-[8px] rounded-br-[8px] transition-colors ${
                  textFormats.has("underline")
                    ? "bg-[#BBA2FE]"
                    : "bg-[#F4F4F4] hover:bg-[#E9E9E9]"
                }`}
              >
                <UnderlineIcon
                  fill={textFormats.has("underline") ? "#FFFFFF" : "#939396"}
                />
              </button>
            </div>

            {/* List Type */}
            <div className="w-[117px] flex gap-0.5">
              <button
                onClick={() => handleListTypeSelect("bulletList")}
                className={`flex-1 h-8 flex items-center justify-center p-2 rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[2px] rounded-br-[2px] transition-colors ${
                  selectedListType === "bulletList"
                    ? "bg-[#BBA2FE]"
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
                    ? "bg-[#BBA2FE]"
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

        {/* Divider */}
        <div className="w-full h-0 relative">
          <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
        </div>

        {/* Text Color */}
        <div className="p-4 space-y-2" ref={textColorDropdownRef}>
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Цвет текста
          </div>

          {showTextColorDropdown ? (
            <div className="space-y-2">
              <div className="w-full h-[160px] mt-1 border border-[#E9E9E9] rounded-[4px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                <div
                  className="relative w-full h-[138.5px] cursor-pointer"
                  style={{
                    background: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%), linear-gradient(to right, rgba(255,255,255,1) 0%, hsl(${customTextHue}, 100%, 50%) 100%)`,
                  }}
                  onClick={handleCustomTextColorClick}
                >
                  {customTextColorPosition && (
                    <div
                      className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
                      style={{
                        left: `${customTextColorPosition.x}%`,
                        top: `${customTextColorPosition.y}%`,
                        transform: "translate(-50%, -50%)",
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
                  onClick={handleTextHueClick}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 h-[159px]">
              {Array.from({ length: 4 }, (_, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 h-[37px]">
                  {colors
                    .slice(rowIndex * 6, (rowIndex + 1) * 6)
                    .map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color, "text")}
                        className="relative flex-1 h-[37px] rounded-[4px] transition-transform hover:scale-105"
                        style={{
                          backgroundColor: color,
                          border:
                            color === "#FFFFFF" ? "1px solid #F4F4F4" : "none",
                        }}
                      >
                        {selectedTextColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BigCheckMarkIcon
                              fill={isLightColor(color) ? "#000000" : "#FFFFFF"}
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
              onClick={() => setShowTextColorDropdown(!showTextColorDropdown)}
              className={`w-full h-full px-2 text-[12px] font-normal text-[#0B0911] tracking-[-0.36px] outline-none bg-white rounded-[8px] border flex items-center justify-between ${
                showTextColorDropdown
                  ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE]"
                  : "border-[#E9E9E9]"
              }`}
            >
              <span>Выбрать другой</span>
              <div
                className={` transition-transform ${
                  showTextColorDropdown ? "rotate-180" : ""
                }`}
              >
                <ChevronDownIcon />
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-0 relative">
          <div className="absolute top-[-1px] left-0 right-0 border-t border-[#E9E9E9]" />
        </div>

        {/* Delete Object */}
        <div className="p-4 space-y-4 pb-6">
          <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
            Объект
          </div>
          <button
            onClick={handleDelete}
            className="w-full h-10 bg-[#F4F4F4] hover:bg-[#E9E9E9] rounded-[8px] flex items-center justify-center gap-2 transition-colors pl-4 pr-6 py-2"
          >
            <GrayTrashIcon />
            <span className="text-[18px] font-normal text-[#FF514F] tracking-[-0.36px]">
              Удалить
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
