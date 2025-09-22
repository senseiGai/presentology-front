"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generateSlidesForStructure,
  createPresentation,
} from "@/shared/api/presentation-generation";
import { generatePresentationHTML } from "@/shared/utils/presentationHTML";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { toast } from "sonner";
import { SlideGenerationModal } from "./SlideGenerationModal";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";

interface SlideGenerationButtonProps {
  isGenerating?: boolean;
}

export const SlideGenerationButton: React.FC<SlideGenerationButtonProps> = ({
  isGenerating = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { setIsGenerating } = usePresentationStore();

  const generateSlidesMutation = useMutation({
    mutationFn: generateSlidesForStructure,
    onSuccess: async (response) => {
      if (response.success && response.data?.slides) {
        const slides = response.data.slides;

        // Преобразуем GeneratedSlide в Slide для HTML генерации
        const formattedSlides = slides.map((slide) => ({
          title: slide.title,
          bullets: slide.content?.bullets || [],
          content: slide.content?.text || "",
        }));

        // Генерируем HTML для презентации
        const htmlContent = generatePresentationHTML(
          formattedSlides,
          response.data.deck?.title || "Новая презентация",
          "modern"
        );

        // Создаем презентацию в БД
        const createResponse = await createPresentation({
          title: response.data.deck?.title || "Новая презентация",
          description: "Создано с помощью ИИ из текста",
          htmlContent,
          isPublic: false,
        });

        if (createResponse && createResponse.id) {
          toast.success("Презентация успешно создана!");
          // Переходим к созданной презентации или остаемся на текущей странице
          router.push(`/presentations/${createResponse.id}`);
        } else {
          toast.error("Ошибка при сохранении презентации");
        }
      } else {
        toast.error(response.error || "Ошибка при генерации слайдов");
      }
    },
    onError: (error) => {
      console.error("Error generating slides:", error);
      toast.error("Произошла ошибка при генерации слайдов");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerateSlides = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error("Пожалуйста, введите текст для генерации");
      return;
    }

    setIsGenerating(true);
    setIsModalOpen(false);

    // Создаем структуру для API на основе промпта
    const uiSlides = [
      {
        title: "Слайд из текста",
        summary: prompt.trim(),
      },
    ];

    generateSlidesMutation.mutate({
      deckTitle: "Презентация из текста",
      uiSlides,
      userData: {
        topic: "Генерация из текста",
        goal: "Создать презентацию на основе текста пользователя",
        audience: "Общая аудитория",
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isGenerating}
        className={`gap-x-2 w-[200px] bg-[#BBA2FE] hover:bg-[#A78BFA] cursor-pointer h-[40px] rounded-[8px] flex items-center justify-center ease-in-out duration-300 transition-colors ${
          isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        title="Создать слайды из текста"
      >
        <Wand2 size={20} color="white" />
        <span className="text-[18px] font-regular text-white">
          {isGenerating ? "Генерация..." : "Сделай дизайн"}
        </span>
      </button>

      <SlideGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateSlides}
        isLoading={generateSlidesMutation.isPending}
      />
    </>
  );
};
