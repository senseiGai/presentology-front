import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PricingCard } from "@/entities/SubscriptionCard/ui/SubscriptionCard";

interface OfferPopupProps {
  isOpen: boolean;
  onSubscribe: () => void; // Нажатие «Подключить»
  onClose: () => void; // Закрытие попапа
}

export const OfferPopup = ({
  isOpen,
  onSubscribe,
  onClose,
}: OfferPopupProps) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    const t = setTimeout(
      () => window.addEventListener("keyup", handler, { capture: true }),
      50
    );
    return () => {
      clearTimeout(t);
      window.removeEventListener("keyup", handler, { capture: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#BBA2FE66] backdrop-blur-sm" />

      <div className="relative z-10 min-w-[532px] h-[694px] animate-[modalIn_.2s_ease-out]">
        <div className="bg-white rounded-[20px] shadow-2xl p-6 relative">
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

          <div className="mt-[10px] text-center">
            <h3 className="text-[24px] font-medium text-[#0B0911] mb-4">
              Предложение для вас
            </h3>
          </div>

          <div className="flex justify-center mt-[40px]">
            <PricingCard
              customHeight="h-[440px]"
              isActionButton={false}
              title="Создавай"
              price={239}
              originalPrice={"299"}
              period="месяц"
              sublabel="Для активной работы и регулярной генерации презентаций"
              features={[
                "Безлимитное количество презентаций",
                "Без ограничений по слайдам",
                "Экспорт в PDF и PPTX",
                "Хранилище на 100 презентаций",
                "Полный доступ к дизайнам и шаблонам",
                "Лучшие ИИ‑модели для текстa и картинок",
              ]}
              ctaLabel="Подключить"
              accent="orange"
              highlight
            />
          </div>

          <button
            onClick={onSubscribe}
            className="w-full h-[52px] mt-[40px] rounded-[8px] text-white bg-gradient-to-r from-[#FDA345] to-[#BBA2FE] hover:brightness-95 cursor-pointer transition text-[18px] font-[400]"
          >
            Подключить
          </button>
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
