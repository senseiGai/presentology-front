import React, { useState, useEffect } from "react";
import { usePresentationCreationStore } from "../../model/usePresentationCreationStore";
import DotsSixIcon from "../../../../../public/icons/DotsSixIcon";
import GrayTrashIcon from "../../../../../public/icons/GrayTrashIcon";
import PlusIcon from "../../../../../public/icons/PlusIcon";
import GenerationLoaderIcon from "../../../../../public/icons/GenerationLoaderIcon";
import { AddSlideButton } from "../../../../shared/ui/AddSlideButton";

interface StructureStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slideText: string) => void;
}

const AddSlideModal: React.FC<AddSlideModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [slideText, setSlideText] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (slideText.trim()) {
      onAdd(slideText.trim());
      setSlideText("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(187,162,254,0.4)] backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] w-[450px] h-[378px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
            Добавление слайда
          </h3>
          <button
            onClick={onClose}
            className="bg-[#F4F4F4] rounded-[8px] w-[40px] h-[40px] flex items-center justify-center border border-[#C0C0C1] hover:bg-gray-200 transition-colors"
          >
            <span className="text-[#8F8F92] text-[18px] font-normal leading-[1.2] tracking-[-0.36px]">
              esc
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="ml-1"
            >
              <path
                d="M17.17 6.83a1 1 0 00-1.41 0L12 10.59 8.24 6.83a1 1 0 00-1.41 1.41L10.59 12l-3.76 3.76a1 1 0 001.41 1.41L12 13.41l3.76 3.76a1 1 0 001.41-1.41L13.41 12l3.76-3.76a1 1 0 000-1.41z"
                fill="#8F8F92"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6">
          <div className="h-[190px] flex flex-col">
            <div className="flex-1 border border-[#E9E9E9] rounded-[8px] p-3 flex flex-col">
              <textarea
                value={slideText}
                onChange={(e) => setSlideText(e.target.value)}
                placeholder="Введите тему слайда"
                className="flex-1 resize-none border-none outline-none text-[14px] font-normal text-[#BEBEC0] leading-[1.2] tracking-[-0.42px] placeholder:text-[#BEBEC0]"
                maxLength={500}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="text-right text-[12px] font-normal text-[#BEBEC0] leading-[1.3] tracking-[-0.36px] mt-2">
                {slideText.length} / 500 символов
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-[52px] bg-[#F4F4F4] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-200 transition-colors"
            >
              Отменить
            </button>
            <button
              onClick={handleAdd}
              disabled={!slideText.trim()}
              className="flex-1 h-[52px] bg-[#DDD1FF] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#BBA2FE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StructureStep: React.FC<StructureStepProps> = ({
  onNext,
  onBack,
}) => {
  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([
    { id: 1, title: "Заголовок", description: "Описание слайда" },
    { id: 2, title: "Заголовок", description: "Описание слайда" },
    { id: 3, title: "Заголовок", description: "Описание слайда" },
    { id: 4, title: "Заголовок", description: "Описание слайда" },
    { id: 5, title: "Заголовок", description: "Описание слайда" },
    { id: 6, title: "Заголовок", description: "Описание слайда" },
    { id: 7, title: "Заголовок", description: "Описание слайда" },
  ]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleTextVolumeChange = (volume: "minimal" | "medium" | "large") => {
    updatePresentationData({ textVolume: volume });
  };

  const handleImageSourceChange = (source: "flux" | "internet" | "mixed") => {
    updatePresentationData({ imageSource: source });
  };

  const handleAddSlide = (slideText: string) => {
    const newSlide = {
      id: slides.length + 1,
      title: "Заголовок",
      description: slideText,
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (slideId: number) => {
    setSlides(slides.filter((slide) => slide.id !== slideId));
  };

  return (
    <div className="relative w-full h-full">
      {/* Main Content */}
      <div className="flex">
        {/* Left side - slides list */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between px-10 py-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
                  Название презы
                </h2>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-4 h-4"
                  >
                    <path
                      d="M1.5 12.5v2h2l5.9-5.9-2-2-5.9 5.9zM13.4 4.6c.2-.2.2-.5 0-.7l-1.3-1.3c-.2-.2-.5-.2-.7 0L10 3.9l2 2 1.4-1.3z"
                      fill="#8F8F92"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                {slides.length} слайдов
              </p>
            </div>

            {!isLoading && (
              <AddSlideButton
                onClick={() => setIsAddSlideModalOpen(true)}
                variant="default"
              />
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center gap-4 px-10 py-16">
              <GenerationLoaderIcon width={32} height={32} />
              <span className="text-[24px] font-medium text-[#BBA2FE] leading-[1.3] tracking-[-0.48px]">
                Наберитесь терпения, ИИ генерирует слайды...
              </span>
            </div>
          )}

          {/* Slides list */}
          {!isLoading && (
            <div className="px-10 space-y-3">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between ${
                    index === 1 ? "bg-[#E9E9E9]" : ""
                  } ${
                    index === 3
                      ? "bg-[#E9E9E9] shadow-[0px_0px_10px_0px_rgba(169,169,169,0.4)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                        {slide.id}
                      </span>
                      <DotsSixIcon width={32} height={32} />
                    </div>
                    <div className="flex flex-col gap-1 w-[113px]">
                      <h3 className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                        {slide.title}
                      </h3>
                      <p className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px]">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <GrayTrashIcon width={18} height={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-[436px] bg-white h-[832px] border-l border-[#E9E9E9]">
          <div className="p-10">
            {/* Text Volume */}
            <div className="mb-6">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
                Объем текста
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("minimal")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "minimal"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    Минимальный
                  </button>
                  <button
                    onClick={() => handleTextVolumeChange("medium")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "medium"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    Средний
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("large")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.textVolume === "large"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    Большой
                  </button>
                </div>
              </div>
            </div>

            {/* Image Source */}
            <div className="mb-8">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
                Источник изображений
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageSourceChange("flux")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "flux"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    FLUX
                    <br />
                    (ИИ генерация)
                  </button>
                  <button
                    onClick={() => handleImageSourceChange("internet")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "internet"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    Поиск
                    <br />в интернете
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageSourceChange("mixed")}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      presentationData.imageSource === "mixed"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    }`}
                  >
                    Смешанный
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 right-0 w-[436px] h-[100px] bg-white rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-center gap-2 h-full px-10">
              <button
                onClick={onBack}
                className="w-[174px] h-[52px] bg-white border border-[#C0C0C1] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-50 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={onNext}
                className="flex-1 h-[52px] bg-[#BBA2FE] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors"
              >
                Далее
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setIsAddSlideModalOpen(false)}
        onAdd={handleAddSlide}
      />
    </div>
  );
};
