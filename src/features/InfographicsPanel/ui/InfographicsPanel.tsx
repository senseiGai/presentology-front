"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import {
  useInfographicsGeneration,
  convertTableToCSV,
  buildInfographicPrompt,
} from "@/shared/api/infographics";

// Import icons
import FileCsvIcon from "../../../../public/icons/FileCsvIcon";
import CheckCircleIcon from "../../../../public/icons/CheckCircleIcon";
import BigFolderIcon from "../../../../public/icons/BigFolderIcon";
import GrayTrashIcon from "../../../../public/icons/GrayTrashIcon";

export const InfographicsPanel: React.FC = () => {
  const {
    clearInfographicsSelection,
    selectedInfographicsElement,
    setSelectedInfographicsElement,
  } = usePresentationStore();

  // Infographics generation mutation
  const infographicsMutation = useInfographicsGeneration();

  // State for form data
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(
    null
  );
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);
  const [isFileChanged, setIsFileChanged] = useState(false);

  // UI state
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial values to detect changes
  const [initialTaskDescription] = useState(taskDescription);
  const [initialFile] = useState<File | null>(null);

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

  const handleGenerate = async () => {
    if (!taskDescription.trim()) return;

    try {
      console.log("Generating infographics with:", {
        taskDescription,
        uploadedFile: uploadedFile?.name,
      });

      // Читаем файл CSV если он загружен
      let csvData = "";
      if (uploadedFile) {
        csvData = await readFileAsText(uploadedFile);
      } else {
        // Используем примерные данные, если файл не загружен
        csvData = '"Категория","Значение"\\n"A",120\\n"B",90\\n"C",150';
      }

      // Строим промпт для генерации
      const enhancedPrompt = buildInfographicPrompt(taskDescription.trim());

      // Готовим данные для API
      const requestData = {
        deckTitle: "Presentation", // Можно сделать настраиваемым
        slides: [
          {
            userPrompt: enhancedPrompt,
            slideContext: "Слайд с инфографикой",
            csv: csvData,
            orientation: "horizontal",
            format: "svg",
            response: "json",
          },
        ],
      };

      // Отправляем запрос
      const result = await infographicsMutation.mutateAsync(requestData);

      if (result?.success && result.data?.slides?.[0]?.infographic?.dataUrl) {
        const dataUrl = result.data.slides[0].infographic.dataUrl;
        console.log("Infographic generated successfully:", dataUrl);

        // Здесь можно добавить логику для обновления элемента инфографики на слайде
        // if (selectedInfographicsElement) {
        //   // Обновить элемент с новой инфографикой
        // }

        setIsGenerated(true);
        setIsDescriptionChanged(false);
        setIsFileChanged(false);
      } else {
        console.error("Invalid response format:", result);
      }
    } catch (error) {
      console.error("Infographics generation failed:", error);
    }
  };

  // Вспомогательная функция для чтения файла
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleDelete = () => {
    clearInfographicsSelection();
  };

  const isSubmitActive = taskDescription.trim().length > 0;
  const hasParameterChanges = isDescriptionChanged || isFileChanged;
  const isButtonDisabled =
    !isSubmitActive ||
    infographicsMutation.isPending ||
    (isGenerated && !hasParameterChanges);
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
              {infographicsMutation.isPending
                ? "Генерируем..."
                : isGenerated
                ? "Перегенерировать"
                : "Сгенерировать"}
            </button>

            {/* Warning message when parameters changed after generation */}
            {showWarning && (
              <div className="text-[14px] font-normal text-[#BBA2FE] tracking-[-0.42px]">
                График полностью обновится и заменится на новый
              </div>
            )}
          </div>
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
  );
};
