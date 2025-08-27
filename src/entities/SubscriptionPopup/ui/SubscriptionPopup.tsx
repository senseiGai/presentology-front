import { PricingCard } from "@/entities/SubscriptionCard/ui/SubscriptionCard";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { ConfirmExitPopup } from "./ConfirmExitPopup";
import { useSubscriptionPopupStore } from "../model/use-subscription-popup-store";
import { useRouter } from "next/navigation";
import { on } from "events";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

export const SubscriptionPopup = ({
  isOpen,
  onClose,
  closeOnEscape,
  closeOnBackdropClick,
}: SubscriptionPopupProps) => {
  const {
    isConfirmExitOpen,
    closeConfirmExit,
    forceClose,
    hasDiscount,
    applyDiscount,
  } = useSubscriptionPopupStore();
  const router = useRouter();
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  console.log(
    "SubscriptionPopup render, isOpen:",
    isOpen,
    "isConfirmExitOpen:",
    isConfirmExitOpen
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="absolute inset-0 bg-[#E0D6FB] backdrop-blur-sm" />

      <div className="relative z-10 max-w-[800px] animate-[modalIn_.2s_ease-out]">
        <div className="bg-white rounded-[24px] py-[40px] px-[108px] relative">
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

          <div className="w-full flex justify-center ">
            <p className="text-[#0B0911] text-[24px] font-medium max-w-[504px] text-center">
              {hasDiscount
                ? "Выберите подходящий план — и получайте больше от сервиса"
                : "Выберите подходящий план — и получайте больше от сервиса"}
            </p>
          </div>

          {/* Content */}
          <div className="grid gap-x-[24px] md:grid-cols-2 mt-[40px]">
            <PricingCard
              title="Пробуй"
              price={0}
              currency="₽"
              period="месяц"
              badge="Ваш тариф"
              sublabel="Для тестирования сервиса и разовой подготовки презентаций"
              features={[
                "1 презентация в месяц",
                "До 10 слайдов",
                "Экспорт в PDF",
                "Полный доступ к дизайнам и шаблонам",
                "Лучшие ИИ‑модели для текста и картинок",
              ]}
              current
              accent="lilac"
            />

            <PricingCard
              title="Создавай"
              price={hasDiscount ? 199 : 299}
              originalPrice={hasDiscount ? "299" : undefined}
              currency="₽"
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
              onClick={() => {
                router.push("/subscription");
                onClose?.();
              }}
              accent="orange"
              highlight
            />
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

      {/* Confirm Exit Popup */}
      <ConfirmExitPopup
        isOpen={isConfirmExitOpen}
        onConfirm={() => {
          applyDiscount();
        }}
        onCancel={() => {
          closeConfirmExit();
          forceClose();
        }}
      />
    </div>
  );
};
