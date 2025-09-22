import { X } from "lucide-react";
import React, { useState } from "react";

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slideText: string) => void;
}

export const AddSlideModal: React.FC<AddSlideModalProps> = ({
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
    <div className="fixed inset-0 bg-[rgba(187,162,254,0.4)] backdrop-blur-[8px] flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] w-[450px] h-[378px] overflow-hidden relative">
        <div className="absolute right-6 top-6 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
          <span className="text-[18px] font-[400] text-[#8F8F92]">esc</span>
          <button
            aria-label="Закрыть"
            onClick={onClose}
            className="text-[#8F8F92] cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="mt-[24px] ml-[24px]">
          <h3 className="text-[24px] font-medium text-[#0B0911] mb-4">
            Предложение для вас
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 mt-[29px]">
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
              className={`flex-1 h-[52px] ${
                slideText.trim()
                  ? "bg-[#BBA2FE]"
                  : "bg-[#DDD1FF] cursor-not-allowed"
              } rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#BBA2FE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
