import React, { useState, useRef, useEffect } from "react";
import { usePresentationCreationStore } from "../../model/useImproveFileWizard";
import SliderIcon from "../../../../../public/icons/SliderIcon";

interface GoalOption {
  id: string;
  label: string;
}

interface DescriptionStepProps {
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  isCompleted?: boolean;
}

export const DescriptionStep: React.FC<DescriptionStepProps> = ({
  onNext,
  onBack,
  canProceed = true,
  isCompleted = false,
}) => {
  // Store для ImprovingFileWizard
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();
  // State for form data - initialized from store
  const [topic, setTopic] = useState(presentationData.topic || "");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [customAudience, setCustomAudience] = useState("");
  const [keyIdea, setKeyIdea] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState("");

  // Text modification options
  const [textModification, setTextModification] = useState<
    "keep" | "update" | "regenerate"
  >("keep");

  const [selectedNarrative, setSelectedNarrative] = useState<string[]>([]);
  const [customNarrative, setCustomNarrative] = useState("");
  const [textVolume, setTextVolume] = useState<"minimal" | "medium" | "large">(
    "medium"
  );
  const [imageSource, setImageSource] = useState<"flux" | "internet" | "mixed">(
    "mixed"
  );
  const [slideCountMode, setSlideCountMode] = useState<"auto" | "custom">(
    "auto"
  );
  const [customSlideCount, setCustomSlideCount] = useState(3);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Slider state
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update store whenever form data changes
  useEffect(() => {
    const goals = selectedGoals.length > 0 ? selectedGoals.join(", ") : customGoal;
    const audience = selectedAudience.length > 0 ? selectedAudience.join(", ") : customAudience;
    
    updatePresentationData({
      topic,
      goal: goals,
      audience,
      context: keyIdea, // Store keyIdea as context since it's the key idea
      textVolume,
      imageSource,
      slideCount: slideCountMode === "auto" ? 8 : customSlideCount,
    });
  }, [topic, selectedGoals, customGoal, selectedAudience, customAudience, keyIdea, textVolume, imageSource, slideCountMode, customSlideCount, updatePresentationData]);

  // Options data
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
    { id: "investors", label: "Инвесторы или заказчики" },
    { id: "management", label: "Руководство компании" },
    { id: "colleagues", label: "Коллеги или сотрудники" },
    { id: "clients", label: "Потенциальные клиенты или партнёры" },
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

  // Slider handlers
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

  // Selection handlers
  const handleGoalSelect = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleAudienceSelect = (audienceId: string) => {
    if (selectedAudience.includes(audienceId)) {
      setSelectedAudience(selectedAudience.filter((id) => id !== audienceId));
    } else if (selectedAudience.length < 3) {
      setSelectedAudience([...selectedAudience, audienceId]);
    }
  };

  const handleActionSelect = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      setSelectedActions(selectedActions.filter((id) => id !== actionId));
    } else if (selectedActions.length < 3) {
      setSelectedActions([...selectedActions, actionId]);
    }
  };

  const handleNarrativeSelect = (narrativeId: string) => {
    if (isDisabled) return;
    if (selectedNarrative.includes(narrativeId)) {
      setSelectedNarrative(
        selectedNarrative.filter((id) => id !== narrativeId)
      );
    } else if (selectedNarrative.length < 3) {
      setSelectedNarrative([...selectedNarrative, narrativeId]);
    }
  };

  const handleTextModificationChange = (
    value: "keep" | "update" | "regenerate"
  ) => {
    setTextModification(value);
    if (value === "keep") {
      // Clear narrative selection when "keep original" is selected
      setSelectedNarrative([]);
      setCustomNarrative("");
    }
  };

  const checkCanProceed = () => {
    return (
      topic.trim() &&
      (selectedGoals.length > 0 || customGoal.trim()) &&
      (selectedAudience.length > 0 || customAudience.trim()) &&
      keyIdea.trim()
    );
  };

  const handleNext = () => {
    if (!checkCanProceed()) return;
    
    // Update store with latest data before proceeding
    const goals = selectedGoals.length > 0 ? selectedGoals.join(", ") : customGoal;
    const audience = selectedAudience.length > 0 ? selectedAudience.join(", ") : customAudience;
    
    updatePresentationData({
      topic,
      goal: goals,
      audience,
      context: keyIdea,
      textVolume,
      imageSource,
      slideCount: slideCountMode === "auto" ? 8 : customSlideCount,
    });

    onNext();
  };

  const isDisabled = textModification === "keep";

  return (
    <div className="h-full flex flex-col relative bg-white">
      <div className="flex-1 px-10  overflow-y-auto">
        <p className="text-[#00cf1b] text-[14px] font-normal leading-[1.2] tracking-[-0.42px] mb-2">
          Загруженный файл содержит 5 слайдов
        </p>
        <div className="flex flex-col gap-10 w-full max-w-[356px] pt-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Тема
            </h2>
            <div className="flex flex-col gap-3">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Стратегия развития компании на 2024 год"
                className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                maxLength={500}
              />
              <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px]">
                {topic.length} / 500 символов
              </div>
            </div>
          </div>

          {/* Goal Section */}
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
              {[0, 1, 2, 3].map((rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 gap-2">
                  {goalOptions
                    .slice(rowIndex * 2, (rowIndex + 1) * 2)
                    .map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleGoalSelect(option.id)}
                        className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                          selectedGoals.includes(option.id)
                            ? "bg-[#bba2fe] text-white"
                            : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              ))}

              {/* Custom goal input */}
              <div className="flex flex-col w-[356px]">
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
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

          {/* Target Audience Section */}
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
              {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 gap-2">
                  {audienceOptions
                    .slice(rowIndex * 2, (rowIndex + 1) * 2)
                    .map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAudienceSelect(option.id)}
                        className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                          selectedAudience.includes(option.id)
                            ? "bg-[#bba2fe] text-white"
                            : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              ))}

              {/* Custom audience input */}
              <div className="flex flex-col w-[356px]">
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

          {/* Key Idea Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Ключевая идея
            </h2>

            <div className="flex flex-col w-[356px]">
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

          {/* Target Action Section */}
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
              {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 gap-2">
                  {actionOptions
                    .slice(rowIndex * 2, (rowIndex + 1) * 2)
                    .map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleActionSelect(option.id)}
                        className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                          selectedActions.includes(option.id)
                            ? "bg-[#bba2fe] text-white"
                            : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              ))}

              {/* Custom action input */}
              <div className="flex flex-col w-[356px]">
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

          {/* Text Modification Section */}
          <div className="flex flex-col gap-6 w-[356px]">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Изменение текста
            </h2>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTextModificationChange("keep")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textModification === "keep"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Сохранить исходный
                </button>
                <button
                  onClick={() => handleTextModificationChange("update")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textModification === "update"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Обновить исходный с ИИ
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTextModificationChange("regenerate")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textModification === "regenerate"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Сгенерировать заново
                </button>
              </div>
            </div>
          </div>

          {/* Narrative Style Section - Disabled when "keep original" is selected */}
          <div
            className={`flex flex-col gap-6 w-[356px] ${
              isDisabled ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Стиль повествования
              </h2>
              <p className="text-[#bebec0] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                максимум 3
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 gap-2">
                  {narrativeOptions
                    .slice(rowIndex * 2, (rowIndex + 1) * 2)
                    .map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleNarrativeSelect(option.id)}
                        disabled={isDisabled}
                        className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                          selectedNarrative.includes(option.id)
                            ? "bg-[#bba2fe] text-white"
                            : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                        } ${isDisabled ? "cursor-not-allowed" : ""}`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              ))}

              {/* Custom narrative input */}
              <div className="flex flex-col w-[356px]">
                <textarea
                  value={customNarrative}
                  onChange={(e) => setCustomNarrative(e.target.value)}
                  placeholder="Свой ответ"
                  disabled={isDisabled}
                  className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  maxLength={500}
                />
                <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                  {customNarrative.length} / 500 символов
                </div>
              </div>
            </div>
          </div>

          {/* Text Volume Section */}
          <div className="flex flex-col gap-6 w-[356px]">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Объем текста
            </h2>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTextVolume("minimal")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textVolume === "minimal"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Минимальный
                </button>
                <button
                  onClick={() => setTextVolume("medium")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textVolume === "medium"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Средний
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTextVolume("large")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    textVolume === "large"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Большой
                </button>
              </div>
            </div>
          </div>

          {/* Image Source Section */}
          <div className="flex flex-col gap-6 w-[356px]">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Источник изображений
            </h2>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImageSource("flux")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    imageSource === "flux"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  FLUX
                  <br />
                  (ИИ генерация)
                </button>
                <button
                  onClick={() => setImageSource("internet")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    imageSource === "internet"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Из интернета
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImageSource("mixed")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    imageSource === "mixed"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Смешанный
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-[356px]">
            <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
              Количество слайдов
            </h2>

            <div className="flex flex-col gap-20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSlideCountMode("auto")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    slideCountMode === "auto"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Определить автоматически
                </button>
                <button
                  onClick={() => setSlideCountMode("custom")}
                  className={`h-[90px] px-4 rounded-lg text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors w-[174px] ${
                    slideCountMode === "custom"
                      ? "bg-[#bba2fe] text-white"
                      : "bg-[#f4f4f4] text-[#0b0911] hover:bg-[#e9e9e9]"
                  }`}
                >
                  Выбрать свое
                </button>
              </div>

              <div
                className={`${
                  slideCountMode === "custom" ? "" : "opacity-50"
                } flex items-center gap-4`}
              >
                <span className="text-[#bebec0] text-[14px] font-medium">
                  3
                </span>
                <div
                  ref={sliderRef}
                  className="flex-1 relative cursor-pointer"
                  onClick={handleSliderClick}
                >
                  <div className="h-2 bg-[#f4f4f4] rounded-lg relative">
                    <div
                      className="h-2 bg-[#fed1a2] rounded-lg transition-all duration-200"
                      style={{
                        width: `${((customSlideCount - 3) / (25 - 3)) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute w-1 h-2 bg-[#fed1a2] top-0"
                      style={{ left: `${((15 - 3) / (25 - 3)) * 100}%` }}
                    />
                    <div className="absolute w-1 h-2 bg-[#fed1a2] top-0 rounded-tr-lg rounded-br-lg right-0" />
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
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="flex flex-col gap-6 mb-[23px]">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
                Дополнительная информация
              </h2>
              <p className="text-[#8f8f92] text-[14px] font-normal leading-[1.2] tracking-[-0.42px]">
                Не обязательно для заполнения
              </p>
            </div>

            <div className="flex flex-col">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Что еще важно учесть в презентации?"
                className="w-full h-[112px] px-4 py-3 border border-[#e9e9e9] rounded-lg resize-none text-[14px] font-normal text-[#0b0911] placeholder-[#bebec0] leading-[1.2] tracking-[-0.42px] focus:outline-none focus:border-[#bba2fe]"
                maxLength={500}
              />
              <div className="text-right text-[#bebec0] text-[12px] font-normal leading-[1.3] tracking-[-0.36px] mt-2">
                {additionalInfo.length} / 500 символов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f0f0f0] rounded-t-2xl shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] mx-[11px] px-10 py-6">
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 h-[52px] bg-white border border-[#c0c0c1] rounded-lg flex items-center justify-center text-[#0b0911] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={handleNext}
            disabled={!checkCanProceed()}
            className={`flex-1 h-[52px] rounded-lg flex items-center justify-center text-[18px] leading-[1.2] tracking-[-0.36px] font-normal transition-colors ${
              checkCanProceed()
                ? "bg-[#bba2fe] text-white hover:bg-[#a991fe]"
                : "bg-[#DDD1FF] text-white cursor-not-allowed"
            }`}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );
};
