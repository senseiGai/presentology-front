"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface SlideGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isLoading?: boolean;
}

export const SlideGenerationModal: React.FC<SlideGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-8 max-w-[600px] w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-medium text-[#0B0911]">
            Создать слайды из текста
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#8F8F92] hover:text-[#0B0911] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[16px] font-medium text-[#0B0911] mb-2">
              Опишите, какую презентацию хотите создать
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Например: Создай презентацию о цифровом маркетинге для стартапов. Включи слайды о SEO, социальных сетях, контент-маркетинге и аналитике. Целевая аудитория - предприниматели."
              className="w-full h-[120px] p-4 border border-[#E9EAEE] rounded-[8px] text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[#BBA2FE] focus:border-transparent"
              maxLength={1000}
              disabled={isLoading}
            />
            <div className="text-[12px] text-[#8F8F92] mt-1">
              {prompt.length} / 1000 символов
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-[8px]">
            <h3 className="text-[14px] font-medium text-[#0B0911] mb-2">
              💡 Советы для лучшего результата:
            </h3>
            <ul className="text-[12px] text-[#8F8F92] space-y-1">
              <li>• Укажите тему и цель презентации</li>
              <li>• Опишите целевую аудиторию</li>
              <li>• Перечислите ключевые вопросы для раскрытия</li>
              <li>• Укажите желаемое количество слайдов</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[48px] bg-[#F4F4F4] hover:bg-[#E9EAEE] text-[#0B0911] rounded-[8px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отменить
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="flex-1 h-[48px] bg-[#BBA2FE] hover:bg-[#A78BFA] text-white rounded-[8px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Создание..." : "Создать презентацию"}
          </button>
        </div>

        <div className="text-[12px] text-[#8F8F92] mt-4 text-center">
          Нажмите Ctrl+Enter для быстрого создания
        </div>
      </div>
    </div>
  );
};
