"use client";

import React from "react";
import { useAddSlideStore } from "@/shared/stores/useAddSlideStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";
import { apiClient } from "@/shared/api/client";

interface AddSlideToStructureResponse {
  success: boolean;
  data: {
    title: string;
    summary: string;
  };
}

export const AddSlideOverlay: React.FC = () => {
  const { isOpen, prompt, isLoading, closeModal, setPrompt, setLoading } =
    useAddSlideStore();
  const { brief, uiSlides, setUiSlides, deckTitle } =
    usePresentationFlowStore();

  const handleAddSlide = async () => {
    if (!prompt.trim() || !uiSlides?.length || !brief || isLoading) {
      return;
    }

    try {
      setLoading(true);

      const addSlideRequest = {
        newSlidePrompt: prompt.trim(),
        brief: {
          topic: brief.topic,
          goal: brief.goal,
          audience: brief.audience,
          expectedAction: brief.expectedAction,
          tones: brief.tones || [],
        },
        slides: uiSlides.map((slide) => ({
          title: slide.title,
          summary: slide.summary,
        })),
      };

      console.log("🚀 Adding slide with request:", addSlideRequest);

      const response = await apiClient.post<AddSlideToStructureResponse>(
        "/ai-proxy/api/v1/create/structure/add-slide",
        addSlideRequest
      );

      console.log("✅ Add slide response:", response);

      // Обновляем слайды - ответ содержит напрямую title и summary
      if (response?.data) {
        const newSlide = {
          title: response.data.title || "Новый слайд",
          summary: response.data.summary || "Содержимое будет сгенерировано",
        };

        const updatedSlides = [...uiSlides, newSlide];
        setUiSlides(updatedSlides);
      }

      closeModal();
    } catch (error) {
      console.error("❌ Error adding slide:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-8 w-[600px] max-w-[90vw] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
            Добавить новый слайд
          </h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-[16px] font-medium text-[#0B0911] leading-[1.2] tracking-[-0.32px] mb-3">
            Описание нового слайда
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Например: Добавь кейс клиента с примером использования продукта..."
            className="w-full h-[120px] p-4 border border-[#E9E9E9] rounded-[8px] text-[16px] font-normal text-[#0B0911] leading-[1.4] tracking-[-0.32px] resize-none focus:outline-none focus:border-[#BBA2FE]"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={closeModal}
            disabled={isLoading}
            className="px-6 py-3 bg-white border border-[#C0C0C1] rounded-[8px] text-[16px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.32px] hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={handleAddSlide}
            disabled={!prompt.trim() || isLoading}
            className="px-6 py-3 bg-[#BBA2FE] rounded-[8px] text-[16px] font-normal text-white leading-[1.2] tracking-[-0.32px] hover:bg-[#A693FD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Добавляем..." : "Добавить слайд"}
          </button>
        </div>
      </div>
    </div>
  );
};
