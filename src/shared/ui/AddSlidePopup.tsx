import { X } from "lucide-react";
import React, { useState } from "react";

interface AddSlidePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: string) => void;
}

export const AddSlidePopup: React.FC<AddSlidePopupProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (content.trim()) {
      onAdd(content.trim());
      setContent("");
      onClose();
    }
  };

  const handleCancel = () => {
    setContent("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] px-6 pb-6 pt-[28px] w-[450px] h-[380px] relative">
        <div className="flex items-center justify-between">
          <h3 className="text-[24px] font-medium text-[#0B0911]">
            Добавление слайда
          </h3>
        </div>

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

        <div className="mb-6 h-[195px] relative mt-[29px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Введите тему слайда"
            className="w-full h-full absolute px-4 pt-3 border border-[#BEBEC0] rounded-[12px] resize-none focus:outline-none focus:border-[#BBA2FE] transition-colors text-[14px] leading-[120%] tracking-[-3%]"
            autoFocus
            maxLength={500}
          />
          <div className="text-right absolute text-[12px] font-normal text-[#BEBEC0] mt-2 bottom-3 right-4">
            {content.length} / 500 символов
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-[24px]">
          <button
            onClick={handleCancel}
            className="flex-1 cursor-pointer h-[52px] text-[18px] text-[#0B0911] bg-[#F4F4F4] hover:bg-[#E5E7EB] rounded-[8px] transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={handleAdd}
            disabled={!content.trim()}
            className={`flex-1 h-[52px] cursor-pointer text-[18px] text-white rounded-[8px] transition-colors ${
              content.trim()
                ? "bg-[#BBA2FE] hover:bg-[#A693FD]"
                : "bg-[#DDD1FF] cursor-not-allowed"
            }`}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
