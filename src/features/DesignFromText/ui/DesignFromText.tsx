"use client";

import React, { useState } from "react";
import {
  useGenerateSlidesFromText,
  useCreatePresentation,
  type GenerateSlidesFromTextRequest,
  type CreatePresentationRequest,
} from "@/shared/api/presentation-generation";
import {
  generatePresentationHTML,
  generatePresentationThumbnail,
  type Slide,
} from "@/shared/utils/presentationHTML";
import { useRouter } from "next/navigation";

interface DesignFromTextProps {
  onPresentationCreated?: (presentationId: string) => void;
}

export const DesignFromText: React.FC<DesignFromTextProps> = ({
  onPresentationCreated,
}) => {
  const router = useRouter();

  // Состояние формы
  const [textInput, setTextInput] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [preferences, setPreferences] = useState({
    slideCount: 8,
    style: "professional",
    audience: "business",
    topic: "",
  });

  const [currentStep, setCurrentStep] = useState<
    "input" | "generating" | "success"
  >("input");
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);
  const [createdPresentation, setCreatedPresentation] = useState<any>(null);

  // API hooks
  const generateSlidesMutation = useGenerateSlidesFromText();
  const createPresentationMutation = useCreatePresentation();

  // Обработчики
  const handleTextChange = (value: string) => {
    setTextInput(value);

    // Автоматически определяем тему из первых слов
    if (!preferences.topic && value.length > 10) {
      const firstSentence = value.split(".")[0] || value.substring(0, 100);
      setPreferences((prev) => ({ ...prev, topic: firstSentence.trim() }));
    }
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  // Генерация HTML контента из слайдов
  const generateHTMLContent = (slides: any[], title: string): string => {
    const formattedSlides: Slide[] = slides.map((slide) => ({
      title: slide.title,
      bullets: slide.bullets || [],
    }));

    return generatePresentationHTML(formattedSlides, title, preferences.style);
  };

  // Шаг 1: Генерация слайдов
  const handleGenerateSlides = async () => {
    if (!textInput.trim()) {
      alert("Введите текст для создания презентации");
      return;
    }

    const request: GenerateSlidesFromTextRequest = {
      prompt: `Сгенерируй текст для ${preferences.slideCount} слайдов по схеме:\n1) title (<=55 символов)\n2) bullets (3-5 пунктов).\nВерни ТОЛЬКО JSON: {"slides":[{"title":"...","bullets":["..."]}]}\n\nТекст для анализа: ${textInput}`,
      topic: preferences.topic || "Презентация",
      slideCount: preferences.slideCount,
      style: preferences.style,
      audience: preferences.audience,
    };

    try {
      setCurrentStep("generating");

      const result = await generateSlidesMutation.mutateAsync(request);

      if (result.success && result.data?.slides) {
        setGeneratedSlides(result.data.slides);

        // Автоматически создаем презентацию
        await handleCreatePresentation(result.data.slides);
      } else {
        alert(
          "Ошибка генерации слайдов: " + (result.error || "Неизвестная ошибка")
        );
        setCurrentStep("input");
      }
    } catch (error) {
      console.error("Error generating slides:", error);
      alert("Ошибка генерации слайдов");
      setCurrentStep("input");
    }
  };

  // Шаг 2: Создание презентации в БД
  const handleCreatePresentation = async (slides: any[]) => {
    const title = presentationTitle || preferences.topic || "Новая презентация";
    const htmlContent = generateHTMLContent(slides, title);
    const thumbnail = generatePresentationThumbnail(title, slides.length);

    const presentationData: CreatePresentationRequest = {
      title,
      description: `Презентация создана из текста (${slides.length} слайдов)`,
      htmlContent,
      thumbnail,
      isPublic: false,
    };

    try {
      const result = await createPresentationMutation.mutateAsync(
        presentationData
      );

      setCreatedPresentation(result);
      setCurrentStep("success");

      // Уведомляем родительский компонент
      onPresentationCreated?.(result.id);

      console.log("Презентация создана:", result);
    } catch (error) {
      console.error("Error creating presentation:", error);
      alert("Ошибка создания презентации");
      setCurrentStep("input");
    }
  };

  // Переход к редактированию
  const handleEditPresentation = () => {
    if (createdPresentation?.id) {
      router.push(`/presentation-generation?id=${createdPresentation.id}`);
    }
  };

  // Состояние загрузки
  if (
    generateSlidesMutation.isPending ||
    createPresentationMutation.isPending
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#BBA2FE]" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          {generateSlidesMutation.isPending
            ? "Анализ текста..."
            : "Создание презентации..."}
        </h3>
        <p className="mt-2 text-gray-600 text-center">
          {generateSlidesMutation.isPending
            ? "ИИ анализирует ваш текст и создает структуру слайдов"
            : "Сохранение презентации в базе данных..."}
        </p>
      </div>
    );
  }

  // Успешное создание
  if (currentStep === "success" && createdPresentation) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Презентация создана!
            </h2>

            <p className="text-gray-600">
              Ваша презентация &quot;{createdPresentation.title}&quot; успешно
              создана и сохранена
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Слайдов:</span>
                <p className="text-gray-600">{generatedSlides.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Создана:</span>
                <p className="text-gray-600">
                  {new Date(createdPresentation.createdAt).toLocaleString(
                    "ru-RU"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentStep("input");
                setTextInput("");
                setPresentationTitle("");
                setGeneratedSlides([]);
                setCreatedPresentation(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors"
            >
              Создать ещё
            </button>

            <button
              onClick={handleEditPresentation}
              className="flex-1 bg-[#BBA2FE] hover:bg-[#A693FD] text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Редактировать
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Форма ввода
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Создай дизайн из текста
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок презентации
            </label>
            <input
              type="text"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE]"
              placeholder="Например: Маркетинговая стратегия 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваш текст *
            </label>
            <textarea
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE]"
              rows={12}
              placeholder="Вставьте ваш текст здесь. ИИ проанализирует его и создаст структурированную презентацию..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Символов: {textInput.length}
            </p>
          </div>
        </div>

        {/* Настройки */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Настройки</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество слайдов
            </label>
            <select
              value={preferences.slideCount}
              onChange={(e) =>
                handlePreferenceChange("slideCount", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE]"
            >
              <option value={5}>5 слайдов</option>
              <option value={8}>8 слайдов</option>
              <option value={10}>10 слайдов</option>
              <option value={12}>12 слайдов</option>
              <option value={15}>15 слайдов</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стиль презентации
            </label>
            <select
              value={preferences.style}
              onChange={(e) => handlePreferenceChange("style", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE]"
            >
              <option value="professional">Профессиональный</option>
              <option value="modern">Современный</option>
              <option value="creative">Креативный</option>
              <option value="minimalist">Минималистичный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Целевая аудитория
            </label>
            <select
              value={preferences.audience}
              onChange={(e) =>
                handlePreferenceChange("audience", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE]"
            >
              <option value="business">Бизнес</option>
              <option value="academic">Академическая</option>
              <option value="general">Общая</option>
              <option value="technical">Техническая</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тема (автоопределение)
            </label>
            <input
              type="text"
              value={preferences.topic}
              onChange={(e) => handlePreferenceChange("topic", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE] text-sm"
              placeholder="Будет определена автоматически"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <button
          onClick={handleGenerateSlides}
          disabled={!textInput.trim()}
          className="w-full bg-[#BBA2FE] hover:bg-[#A693FD] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-md transition-colors text-lg"
        >
          Создать презентацию
        </button>

        <p className="text-sm text-gray-500 text-center mt-3">
          ИИ проанализирует ваш текст и создаст структурированную презентацию
        </p>
      </div>
    </div>
  );
};
