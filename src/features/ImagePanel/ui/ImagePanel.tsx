import React, { useState, useRef } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import Image from "next/image";

import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";
import BigFolderIcon from "../../../../public/icons/BigFolderIcon";
import FileJpgIcon from "../../../../public/icons/FileJpgIcon";
import CheckCircleIcon from "../../../../public/icons/CheckCircleIcon";
import HourglassIcon from "../../../../public/icons/HourglassIcon";
import CheckIcon from "../../../../public/icons/CheckIcon";
import SandTimeIcon from "../../../../public/icons/SandTimeIcon";

interface ImageStyle {
  type: "photo" | "blackwhite" | "illustration";
  label: string;
}

interface GenerationModel {
  type: "flux" | "internet";
  label: string;
}

const imageStyles: ImageStyle[] = [
  { type: "photo", label: "Фото" },
  { type: "blackwhite", label: "Черно-белое фото" },
  { type: "illustration", label: "Иллюстрация" },
];

const generationModels: GenerationModel[] = [
  { type: "flux", label: "Flux (ИИ генерация)" },
  { type: "internet", label: "Из интернета" },
];

export const ImagePanel: React.FC = () => {
  const { clearImageSelection } = usePresentationStore();

  const [selectedStyle, setSelectedStyle] = useState<ImageStyle["type"]>();
  const [selectedModel, setSelectedModel] = useState<GenerationModel["type"]>();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(
    null
  );
  const [urlLoadingState, setUrlLoadingState] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");
  const [urlError, setUrlError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleSelect = (style: ImageStyle["type"]) => {
    setSelectedStyle(style);
  };

  const handleModelSelect = (model: GenerationModel["type"]) => {
    setSelectedModel(model);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setUrlError("");

    // Если пользователь вводит URL и есть загруженный файл, удаляем файл
    if (url.trim() && uploadedFiles.length > 0) {
      setUploadedFiles([]);
      setFileUploadProgress(null);
    }

    // Если поле пустое, сбрасываем состояние
    if (!url.trim()) {
      setUrlLoadingState("idle");
      return;
    }

    // Проверяем валидность URL
    try {
      new URL(url);
      setUrlLoadingState("loading");

      // Симулируем загрузку изображения
      setTimeout(() => {
        // Проверяем, что URL ведет к изображению
        if (
          url.includes("image") &&
          (url.endsWith(".jpg") ||
            url.endsWith(".png") ||
            url.endsWith(".jpeg"))
        ) {
          setUrlLoadingState("success");
        } else {
          setUrlLoadingState("error");
          setUrlError("Не удалось загрузить файл по ссылке");
        }
      }, 1500);
    } catch {
      setUrlLoadingState("invalid");
      setUrlError("Неправильная ссылка");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedStyle || !selectedModel) return;

    // Если есть загруженный файл, удаляем его при генерации
    if (uploadedFiles.length > 0) {
      setUploadedFiles([]);
    }

    setIsGenerating(true);
    try {
      // Здесь будет логика генерации изображения
      console.log("Generating image with:", {
        style: selectedStyle,
        model: selectedModel,
        prompt: prompt.trim(),
      });

      // Симуляция генерации
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // После успешной генерации обнуляем все поля
      setSelectedStyle(undefined);
      setSelectedModel(undefined);
      setPrompt("");
      setImageUrl("");
      setUrlLoadingState("idle");
      setUrlError("");
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Можем загрузить только один файл
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    // Если уже есть файл, заменяем его
    setUploadedFiles([]);
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
            setUploadedFiles([file]);
            setFileUploadProgress(null);
            resolve();
          }
        }, 100);
      });
    };

    await simulateUpload();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setUploadedFiles([]);
    setFileUploadProgress(null);
  };

  const removeUrl = () => {
    setImageUrl("");
    setUrlLoadingState("idle");
    setUrlError("");
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    clearImageSelection();
  };

  return (
    <div
      className="bg-white relative w-[274px]"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="absolute inset-0 overflow-y-auto">
        <div className="w-full h-[36px] bg-[#F4F4F4] flex items-center pl-4">
          <span className="text-[#0B0911] text-[14px] font-medium block ">
            Генерация
          </span>
        </div>
        <div className="space-y-6">
          {/* Header */}
          <div className="px-4 pt-4 flex items-center gap-2">
            <Image
              src={"/gradient-sparks.svg"}
              alt="Gradient Sparks"
              width={24}
              height={24}
            />
            <span className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              Создать с ИИ
            </span>
          </div>

          {/* Step 1: Style Selection */}
          <div className="px-4 space-y-2">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              1. Выберите стиль
            </div>
            <div className="space-y-2">
              {imageStyles.map((style) => (
                <button
                  key={style.type}
                  onClick={() => handleStyleSelect(style.type)}
                  className={`w-full h-8 rounded-[8px] text-[14px] font-medium tracking-[-0.42px] transition-colors flex items-center justify-center ${
                    selectedStyle === style.type
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] text-[#8F8F92] hover:bg-[#E9E9E9]"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Generation Model */}
          <div className="space-y-2 px-4">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              2. Выберите модель генерации
            </div>
            <div className="space-y-2">
              {generationModels.map((model) => (
                <button
                  key={model.type}
                  onClick={() => handleModelSelect(model.type)}
                  className={`w-full h-8 rounded-[8px] text-[14px] font-medium tracking-[-0.42px] transition-colors flex items-center justify-center ${
                    selectedModel === model.type
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] text-[#8F8F92] hover:bg-[#E9E9E9]"
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Task Description */}
          <div className="space-y-2 px-4">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              3. Опишите задачу
            </div>
            <div
              className={`h-[112px] relative rounded-[8px] bg-white border transition-colors ${
                isTextareaFocused
                  ? "border-[#BBA2FE] shadow-[0px_0px_5px_0px_#BBA2FE40]"
                  : "border-[#E9E9E9]"
              }`}
            >
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder="Какое изображение сгенерировать?"
                className="w-full h-[73px] absolute top-3 left-4 pr-10 outline-none resize-none text-[14px] font-normal text-[#0B0911] tracking-[-0.42px] placeholder-[#BEBEC0]"
                maxLength={500}
              />
              <div className="absolute right-4 bottom-2 text-[12px] text-[#BEBEC0] tracking-[-0.36px]">
                {prompt.length} / 500 символов
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() || !selectedStyle || !selectedModel || isGenerating
            }
            className={`w-[242px] mx-auto h-10 rounded-[8px] text-[18px] font-normal tracking-[-0.36px] transition-colors flex items-center justify-center ${
              prompt.trim() && selectedStyle && selectedModel && !isGenerating
                ? "bg-[#BBA2FE] text-white hover:bg-[#A693FD]"
                : "bg-[#DDD1FF] text-white cursor-not-allowed"
            }`}
          >
            {isGenerating ? "Генерируем..." : "Сгенерировать"}
          </button>

          {/* Divider */}
          <div className="w-full h-[36px] bg-[#F4F4F4] flex items-center pl-4">
            <span className="text-[#0B0911] text-[14px] font-medium block ">
              Загрузка
            </span>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2 px-4">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              Файл
            </div>

            {uploadedFiles.length > 0 ? (
              // Show uploaded file
              <div className="flex gap-2 items-center justify-start w-full">
                <FileJpgIcon className="shrink-0 size-6" />
                <div className="flex flex-col gap-1 grow min-w-0">
                  <div className="flex items-start justify-between w-full text-[12px] font-normal tracking-[-0.36px]">
                    <div className="text-[#0B0911] truncate">
                      {uploadedFiles[0].name}
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
                    onClick={removeFile}
                    className="size-6 flex items-center justify-center"
                  >
                    <GrayTrashIcon />
                  </button>
                </div>
              </div>
            ) : fileUploadProgress !== null ? (
              // Show upload progress
              <div className="flex gap-2 items-center justify-start w-full">
                <FileJpgIcon className="shrink-0 size-6" />
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
                <div className="flex items-center flex-row gap-x-1">
                  <div className="bg-[#D8F3F6] w-[43px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0">
                    <span className="text-[12px] font-medium text-[#0C7792] tracking-[-0.36px]">
                      .jpeg
                    </span>
                  </div>
                  <div className="bg-[#D8F3F6] w-[43px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0">
                    <span className="text-[12px] font-medium text-[#0C7792] tracking-[-0.36px]">
                      .jpg
                    </span>
                  </div>
                  <div className="bg-[#D8F3F6] w-[43px] h-[24px] flex items-center justify-center rounded-[4px] shrink-0">
                    <span className="text-[12px] font-medium text-[#0C7792] tracking-[-0.36px]">
                      .png
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
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E9E9E9]" />

          {/* URL Input Section */}
          <div className="space-y-2 px-4">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              По ссылке
            </div>

            {urlLoadingState === "success" ? (
              // Success state with delete button
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.png"
                    className="w-full h-10 px-4 py-3 pr-10 border border-[#00CF1B] rounded-[8px] focus:outline-none transition-colors text-[14px] tracking-[-0.42px] placeholder-[#BEBEC0] text-[#0B0911]"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckIcon />
                  </div>
                </div>
                <button
                  onClick={removeUrl}
                  className="size-6 flex items-center justify-center shrink-0"
                >
                  <GrayTrashIcon />
                </button>
              </div>
            ) : urlLoadingState === "error" || urlLoadingState === "invalid" ? (
              // Error state with delete button
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com/image.png"
                      className="w-full h-10 px-4 py-3 pr-10 border border-[#FF514F] rounded-[8px] focus:outline-none transition-colors text-[14px] tracking-[-0.42px] placeholder-[#BEBEC0] text-[#0B0911]"
                    />
                  </div>
                  <button
                    onClick={removeUrl}
                    className="size-6 flex items-center justify-center shrink-0"
                  >
                    <GrayTrashIcon />
                  </button>
                </div>
                <div className="text-[12px] font-medium text-[#FF514F] tracking-[-0.36px]">
                  {urlError}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.png"
                    className={`w-full h-10 px-4 py-3 pr-10 border rounded-[8px] focus:outline-none transition-colors text-[14px] tracking-[-0.42px] placeholder-[#BEBEC0] text-[#0B0911] ${
                      urlLoadingState === "loading"
                        ? "border-[#E9E9E9]"
                        : "border-[#E9E9E9] focus:border-[#BBA2FE]"
                    }`}
                  />
                  {urlLoadingState === "loading" && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <SandTimeIcon />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E9E9E9]" />

          {/* Delete Object Section */}
          <div className="space-y-2 px-4 pb-6">
            <div className="text-[14px] font-normal text-[#8F8F92] tracking-[-0.42px]">
              Объект
            </div>
            <button
              onClick={handleDelete}
              className="w-full h-10 bg-[#F4F4F4] hover:bg-[#E9E9E9] rounded-[8px] flex items-center justify-center gap-2 transition-colors"
            >
              <GrayTrashIcon />
              <span className="text-[18px] font-normal text-[#FF514F] tracking-[-0.36px]">
                Удалить
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
