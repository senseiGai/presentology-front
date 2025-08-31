import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface CancelSubPopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void; // Нажатие «Отказаться» → закрыть всё
  onDismiss?: () => void; // ESC/крестик → закрыть только Confirm
}

export const CancelSubPopup = ({
  isOpen,
  onConfirm,
  onCancel,
  onDismiss,
}: CancelSubPopupProps) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss?.();
    };
    const t = setTimeout(
      () => window.addEventListener("keyup", handler, { capture: true }),
      50
    );
    return () => {
      clearTimeout(t);
      window.removeEventListener("keyup", handler, { capture: true });
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#BBA2FE66] backdrop-blur-sm" />

      <div className="relative z-10 min-w-[514px] animate-[modalIn_.2s_ease-out]">
        <div className="bg-white rounded-[20px] shadow-2xl p-6 relative">
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

          {/* Content */}
          <div className="mt-[58px] text-center">
            <h3 className="text-[24px] font-medium text-[#0B0911] mb-4">
              Вы уверены, что хотите
              <br />
              отключить подписку?
            </h3>

            <div className="mt-[32px] max-w-[300px] mx-auto">
              <span className="text-[14px] text-[#8F8F92] leading-[120%]">
                В знак благодарности за интерес к нашему сервису —
              </span>
              <span className="text-[14px] text-[#0B0911] font-medium ml-1 -mt-2">
                скидка 20%
              </span>
            </div>

            <p className="text-[14px] font-medium text-[#BEBEC0] mt-[16px] mx-auto">
              Предложение действует
              <br />в течение ограниченного времени
            </p>

            {/* Buttons */}
            <div className="flex flex-row gap-x-2 mt-[36px]">
              <button
                onClick={onCancel}
                className="h-[52px] w-full rounded-[8px] bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E9EAEE] transition text-[18px] font-[400] cursor-pointer"
              >
                Отключить подписку
              </button>
              <button
                onClick={onConfirm}
                className="h-[52px] w-full rounded-[8px] text-white bg-[#BBA2FE] hover:brightness-95 cursor-pointer transition text-[18px] font-[400]"
              >
                Остаться со скидкой
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            transform: translateY(6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
