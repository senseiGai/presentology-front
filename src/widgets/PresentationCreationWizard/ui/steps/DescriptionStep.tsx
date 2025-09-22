import React, { useState, useRef, useEffect } from "react";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import { useExtractFiles } from "@/shared/api/presentation-generation";
import { GoalOption } from "../../model/types";
import BigFolderIcon from "../../../../../public/icons/BigFolderIcon";
import FormatsIcons from "../../../../../public/icons/FormatsIcons";
import SliderIcon from "../../../../../public/icons/SliderIcon";

interface DescriptionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const DescriptionStep: React.FC<DescriptionStepProps> = ({
  onNext,
  onBack,
}) => {
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();

  // Новый store для flow
  const {
    brief,
    setBrief,
    slideCountMode,
    setSlideCountMode,
    slideCount: storeSlideCount,
    setSlideCount: setStoreSlideCount,
    extractedFiles,
    setExtractedFiles,
    isUploadingFiles,
    setIsUploadingFiles,
    uploadError,
    setUploadError,
  } = usePresentationFlowStore();

  // API хук для загрузки файлов
  const extractFilesMutation = useExtractFiles();

  const [customGoal, setCustomGoal] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [customAudience, setCustomAudience] = useState("");
  const [keyIdea, setKeyIdea] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState("");
  const [selectedNarrative, setSelectedNarrative] = useState<string[]>([]);
  const [customNarrative, setCustomNarrative] = useState("");
  const [localSlideCount, setLocalSlideCount] = useState<"ai" | "custom">("ai");
  const [customSlideCount, setCustomSlideCount] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      const newValue = Math.round(3 + percentage * (25 - 3));
      setCustomSlideCount(newValue);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Синхронизация данных с новым store
  useEffect(() => {
    // Собираем данные брифа из локального состояния
    const currentBrief = {
      topic: presentationData.topic,
      goal: customGoal || selectedGoals.join(", "),
      audience: customAudience || selectedAudience.join(", "),
      keyIdea: keyIdea,
      expectedAction: customAction || selectedActions.join(", "),
      tones: customNarrative ? [customNarrative] : selectedNarrative,
    };

    // Обновляем store
    setBrief(currentBrief);

    // Обновляем режим слайдов
    if (localSlideCount === "ai") {
      setSlideCountMode("auto");
    } else {
      setSlideCountMode("fixed");
      setStoreSlideCount(customSlideCount);
    }
  }, [
    presentationData.topic,
    customGoal,
    selectedGoals,
    customAudience,
    selectedAudience,
    keyIdea,
    customAction,
    selectedActions,
    customNarrative,
    selectedNarrative,
    localSlideCount,
    customSlideCount,
    setBrief,
    setSlideCountMode,
    setStoreSlideCount,
  ]);

  const goalOptions: GoalOption[] = [
    { id: "sell", label: "Продать продукт, товары или услуги" },
    { id: "attract", label: "Привлечь инвестиции" },
    { id: "partner", label: "Заключить партнерство" },
    { id: "idea", label: "Представить идею или стратегию" },
    { id: "report", label: "Представить отчет или результаты работы" },
    { id: "explain", label: "Объяснить, как работает продукт или процесс" },
    { id: "training", label: "Провести обучение или инструктаж" },
    { id: "performance", label: "Выступить с темой" },
  ];

  const audienceOptions = [
    { id: "investors", label: "Инвесторы или партнеры" },
    { id: "management", label: "Руководство компании" },
    { id: "colleagues", label: "Коллеги или сотрудники" },
    { id: "clients", label: "Потенциальные клиенты или заказчики" },
    { id: "newEmployees", label: "Новые сотрудники или стажёры" },
    {
      id: "participants",
      label: "Участники вебинара, конференции или обучения",
    },
  ];

  const actionOptions = [
    { id: "decision", label: "Принять решение о сотрудничестве или вложениях" },
    { id: "purchase", label: "Купить или протестировать продукт" },
    { id: "approve", label: "Одобрить инициативу или стратегию" },
    { id: "meeting", label: "Назначить встречу или запросить детали" },
    { id: "share", label: "Поделиться презентацией с коллегами" },
    {
      id: "register",
      label: "Зарегистрироваться или подключиться к платформе",
    },
  ];

  const narrativeOptions = [
    { id: "scientific", label: "Научный" },
    { id: "business", label: "Деловой" },
    { id: "conversational", label: "Разговорный" },
    { id: "selling", label: "Продающий" },
    { id: "emotional", label: "Эмоциональный" },
    { id: "friendly", label: "Дружелюбный" },
    { id: "creative", label: "Креативный" },
    { id: "humorous", label: "С юмором" },
  ];

  const handleGoalSelect = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      // Remove goal if already selected
      const newGoals = selectedGoals.filter((id) => id !== goalId);
      setSelectedGoals(newGoals);
    } else if (selectedGoals.length < 3) {
      // Add goal if under 3 limit
      const newGoals = [...selectedGoals, goalId];
      setSelectedGoals(newGoals);
    }
  };

  const handleAudienceSelect = (audienceId: string) => {
    if (selectedAudience.includes(audienceId)) {
      const newAudience = selectedAudience.filter((id) => id !== audienceId);
      setSelectedAudience(newAudience);
    } else if (selectedAudience.length < 3) {
      const newAudience = [...selectedAudience, audienceId];
      setSelectedAudience(newAudience);
    }
  };

  const handleActionSelect = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      const newActions = selectedActions.filter((id) => id !== actionId);
      setSelectedActions(newActions);
    } else if (selectedActions.length < 3) {
      const newActions = [...selectedActions, actionId];
      setSelectedActions(newActions);
    }
  };

  const handleNarrativeSelect = (narrativeId: string) => {
    if (selectedNarrative.includes(narrativeId)) {
      const newNarrative = selectedNarrative.filter((id) => id !== narrativeId);
      setSelectedNarrative(newNarrative);
    } else if (selectedNarrative.length < 3) {
      const newNarrative = [...selectedNarrative, narrativeId];
      setSelectedNarrative(newNarrative);
    }
  };

  const handleCustomGoalChange = (value: string) => {
    setCustomGoal(value);
    updatePresentationData({ goal: value });
  };

  // Обработка загрузки файлов с API
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  // Загрузка файлов через API
  const uploadFiles = async (files: File[]) => {
    setIsUploadingFiles(true);
    setUploadError(null);

    try {
      const result = await extractFilesMutation.mutateAsync(files);

      // Добавляем файлы в локальное состояние для UI
      setUploadedFiles((prev) => [...prev, ...files]);

      // Сохраняем извлеченные данные в store
      setExtractedFiles(result.files);
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
      setUploadError("Ошибка при обработке файлов");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Drag and Drop обработчики
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const supportedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "text/csv", // .csv
      "application/pdf", // .pdf
      "text/plain", // .txt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "image/jpeg", // .jpeg, .jpg
      "image/png", // .png
      "image/webp", // .webp
    ];

    const validFiles = files.filter(
      (file) =>
        supportedTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".jpg") ||
        file.name.toLowerCase().endsWith(".jpeg")
    );

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    } else {
      setUploadError(
        "Поддерживаются только файлы: docx, csv, pdf, txt, pptx, xls, xlsx, jpeg, jpg, png, webp"
      );
    }
  };

  const removeFile = (index: number) => {
    const removedFile = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    // Также удаляем из extractedFiles по имени файла
    if (extractedFiles) {
      const updatedExtracted = extractedFiles.filter(
        (ef) => ef.name !== removedFile.name
      );
      setExtractedFiles(updatedExtracted);
    }
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current || isDragging) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const newValue = Math.round(3 + percentage * (25 - 3));
    setCustomSlideCount(newValue);
  };

  const canProceed =
    presentationData.topic.trim() &&
    (selectedGoals.length > 0 || customGoal.trim()) &&
    (selectedAudience.length > 0 || customAudience.trim()) &&
    keyIdea.trim();

  return (
    <div className="h-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 px-10 pt-8 overflow-y-auto">
        <div className="flex flex-col gap-10 w-full max-w-[356px]">
          {/* Topic Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Тема
            </h2>
            <div className="flex flex-col gap-3">
              <textarea
                value={presentationData.topic}
                onChange={(e) =>
                  updatePresentationData({ topic: e.target.value })
                }
                placeholder="Стратегия развития компании на 2024 год"
                className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                maxLength={500}
              />
              <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px]">
                {presentationData.topic.length} / 500 символов
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Цель
              </h2>
              <p className="text-[#bebec0] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                максимум 3
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Goal options grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoalSelect("sell")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("sell")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Продать продукт, товары или услуги
                </button>
                <button
                  onClick={() => handleGoalSelect("attract")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("attract")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Привлечь
                  <br />
                  инвестиции
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoalSelect("partner")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("partner")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Заключить
                  <br />
                  партнерство
                </button>
                <button
                  onClick={() => handleGoalSelect("idea")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("idea")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Представить идею или стратегию
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoalSelect("report")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("report")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Представить отчет или результаты работы
                </button>
                <button
                  onClick={() => handleGoalSelect("explain")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("explain")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Объяснить, как работает продукт или процесс
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoalSelect("training")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("training")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Провести обучение или инструктаж
                </button>
                <button
                  onClick={() => handleGoalSelect("performance")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    selectedGoals.includes("performance")
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Выступить с темой
                </button>
              </div>

              {/* Custom goal input */}
              <div className="flex flex-col">
                <textarea
                  value={customGoal}
                  onChange={(e) => handleCustomGoalChange(e.target.value)}
                  placeholder="Свой ответ"
                  className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                  maxLength={500}
                />
                <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                  {customGoal.length} / 500 символов
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Целевая аудитория
              </h2>
              <p className="text-[#bebec0] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                максимум 3
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {audienceOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAudienceSelect(option.id)}
                    className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      selectedAudience.includes(option.id)
                        ? "bg-[#bba2fe] text-white"
                        : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom audience input */}
              <div className="flex flex-col">
                <textarea
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  placeholder="Свой ответ"
                  className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                  maxLength={500}
                />
                <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                  {customAudience.length} / 500 символов
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Ключевая идея
            </h2>

            <div className="flex flex-col">
              <textarea
                value={keyIdea}
                onChange={(e) => setKeyIdea(e.target.value)}
                placeholder="Наш продукт решает проблему X быстрее и дешевле"
                className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                maxLength={500}
              />
              <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                {keyIdea.length} / 500 символов
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Целевое действие аудитории
              </h2>
              <p className="text-[#bebec0] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                максимум 3
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {actionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleActionSelect(option.id)}
                    className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      selectedActions.includes(option.id)
                        ? "bg-[#bba2fe] text-white"
                        : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom action input */}
              <div className="flex flex-col">
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Свой ответ"
                  className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                  maxLength={500}
                />
                <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                  {customAction.length} / 500 символов
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Стиль повествования
              </h2>
              <p className="text-[#bebec0] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                максимум 3
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {narrativeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleNarrativeSelect(option.id)}
                    className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      selectedNarrative.includes(option.id)
                        ? "bg-[#bba2fe] text-white"
                        : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom narrative input */}
              <div className="flex flex-col">
                <textarea
                  value={customNarrative}
                  onChange={(e) => setCustomNarrative(e.target.value)}
                  placeholder="Свой ответ"
                  className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                  maxLength={500}
                />
                <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                  {customNarrative.length} / 500 символов
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Количество слайдов
            </h2>

            <div className="flex flex-col gap-20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLocalSlideCount("ai")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    localSlideCount === "ai"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  На усмотрение ИИ
                </button>
                <button
                  onClick={() => setLocalSlideCount("custom")}
                  className={`h-[90px] px-4  rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                    localSlideCount === "custom"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Выбрать свое
                </button>
              </div>

              {localSlideCount === "custom" && (
                <div className="flex items-center gap-4">
                  <span className="text-[#bebec0] text-[14px] font-medium">
                    3
                  </span>
                  <div
                    ref={sliderRef}
                    className="flex-1 relative cursor-pointer"
                    onClick={handleSliderClick}
                  >
                    <div className="h-2 bg-[#f4f4f4] rounded-lg relative">
                      {/* Progress Fill */}
                      <div
                        className="h-2 bg-[#fed1a2] rounded-lg transition-all duration-200"
                        style={{
                          width: `${
                            ((customSlideCount - 3) / (25 - 3)) * 100
                          }%`,
                        }}
                      />
                      {/* Orange markers at 15 and 25 */}
                      <div
                        className="absolute w-1 h-2 bg-[#fed1a2] top-0"
                        style={{ left: `${((15 - 3) / (25 - 3)) * 100}%` }}
                      />
                      <div className="absolute w-1 h-2 bg-[#fed1a2] top-0 rounded-tr-lg rounded-br-lg right-0" />
                      {/* Slider Handle with Icon */}
                      <div
                        className={`absolute -top-7 transform -translate-y-1/2 -translate-x-1/2 cursor-grab transition-all duration-200 hover:scale-105 ${
                          isDragging ? "cursor-grabbing scale-105" : ""
                        }`}
                        style={{
                          left: `${((customSlideCount - 3) / (25 - 3)) * 100}%`,
                        }}
                        onMouseDown={handleSliderMouseDown}
                      >
                        <div className="relative select-none">
                          <SliderIcon />
                          <span className="absolute top-[11px] left-1/2 transform -translate-x-1/2 text-white text-[18px] font-semibold leading-[1.2] tracking-[-0.36px] pointer-events-none">
                            {customSlideCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#fda345] text-[14px] font-medium">
                    25
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Загрузите файлы
              </h2>
              <p className="text-[#0b0911] text-[18px] font-normal leading-[1.2] tracking-[-0.36px]">
                Если хотите что-то добавить
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-[#e6edfe] px-2 py-1 rounded text-[#3451b2] text-[12px] font-medium leading-[1.3] tracking-[-0.36px] flex items-center gap-2"
                    >
                      {file.name}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-[#3451b2] hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div className="flex gap-1 flex-wrap">
                <FormatsIcons />
              </div>
              <div
                className={`bg-[#F3F6FF] h-[150px] rounded-[8px] border border-dashed transition-colors relative cursor-pointer ${
                  isDragging
                    ? "border-[#bba2fe] bg-[#EEF2FF]"
                    : "border-[#C0C0C1] hover:bg-[#EEF2FF]"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="flex flex-col gap-1.5 items-center justify-center w-[210px] mx-auto h-full">
                  <BigFolderIcon />
                  <div className="text-[14px] font-normal text-[#8F8F92] text-center tracking-[-0.42px] leading-[1.2]">
                    {isUploadingFiles ? (
                      "Обработка файлов..."
                    ) : (
                      <>
                        Перетащите сюда файлы
                        <br />
                        или нажмите для выбора
                      </>
                    )}
                  </div>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".docx,.csv,.pdf,.txt,.pptx,.xls,.xlsx,.jpeg,.jpg,.png,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Ошибка загрузки */}
              {uploadError && (
                <div className="text-red-500 text-sm mt-2">{uploadError}</div>
              )}

              {/* Показать информацию об извлеченных данных */}
              {extractedFiles && extractedFiles.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Извлечен текст из {extractedFiles.length} файла(ов)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-[#f0f0f0] rounded-t-2xl shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] mx-[11px] px-10 py-6">
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 h-[52px] bg-white border border-[#c0c0c1] rounded-lg flex items-center justify-center text-[#0b0911] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex-1 h-[52px] rounded-lg flex items-center justify-center text-[18px] leading-[1.2] tracking-[-0.36px] font-normal transition-colors ${
              canProceed
                ? "bg-[#bba2fe] text-white hover:bg-[#a991fe]"
                : "bg-[#f4f4f4] text-[#bebec0] cursor-not-allowed"
            }`}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );
};
