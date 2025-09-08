import { X } from "lucide-react";
import React, { useEffect } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  slideNumber: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, slideNumber, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] p-6 w-[450px] h-[378px] relative">
        {/* Close button */}
        <div className="absolute right-6 top-6 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
          <span className="text-[18px] font-[400] text-[#8F8F92]">esc</span>
          <button
            aria-label="Закрыть"
            onClick={onCancel}
            className="text-[#8F8F92] cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* Modal content */}
        <div className="flex items-center justify-center flex-col w-full h-full text-center">
          <h3 className="text-[24px] font-medium text-[#0B0911]">
            Удалить
            <br />
            «Слайд {slideNumber}»?
          </h3>
          <p className="text-[14px] font-medium text-[#BEBEC0] mt-[24px] mb-6">
            После удаления восстановить
            <br />
            его будет невозможно
          </p>
          <div className="absolute w-[90%] bottom-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 cursor-pointer px-4 py-3 bg-[#F3F4F6] text-[#374151] rounded-[8px] font-medium hover:bg-[#E5E7EB] transition-colors"
            >
              Оставить
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 cursor-pointer px-4 py-3 bg-[#EF4444] text-white rounded-[8px] font-medium hover:bg-[#DC2626] transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
