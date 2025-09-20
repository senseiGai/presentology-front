import { X } from "lucide-react";
import { useEffect, useState } from "react";
import WarningIcon from "../../../../public/icons/WarningIcon";
import CopyIcon from "../../../../public/icons/CopyIcon";
import MiniTGIcon from "../../../../public/icons/MiniTGIcon";

export function ErrorCard({
  message = "Повторите попытку позже",
  description = "Если проблема не устранена, скопируйте сообщение об ошибке ниже и обратитесь в нашу службу поддержки",
  onClose,
  autoClose = true,
  duration = 5000,
}: {
  message?: string;
  description?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show toast with animation
    setIsVisible(true);

    if (autoClose) {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = 100 / (duration / 50);
          return Math.min(prev + increment, 100);
        });
      }, 50);

      // Auto close after duration
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // Wait for exit animation
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(closeTimer);
      };
    }
  }, [autoClose, duration, onClose]);
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for exit animation
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="fixed bottom-4 z-50">
      <div
        className={`max-w-[350px] h-[180px] bg-[#F5F5F5] rounded-[12px] shadow-2xl p-[12px] relative transform transition-all duration-300 ease-in-out ${
          isVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <WarningIcon />
          <span className="text-[#0A0A0A] font-medium text-[14px]">
            {message}
          </span>
          <button
            onClick={handleClose}
            className="text-[#C0C0C0] cursor-pointer ml-auto hover:text-[#999999] transition-colors duration-200 p-1 rounded-full hover:bg-[#E0E0E0]"
            aria-label="Закрыть уведомление"
            title="Закрыть (ESC)"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-[14px] font-[400] text-[#939393] mt-[16px] leading-[120%]">
          {description}
        </p>

        <div className="mt-[24px] flex justify-between items-center">
          <button
            onClick={handleCopy}
            className="text-[14px] cursor-pointer text-[#0077FF] font-medium flex items-center gap-1 hover:underline"
          >
            <CopyIcon />
            Скопировать сообщение
          </button>
          <a
            href="https://t.me/support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] cursor-pointer text-[#0077FF] font-medium flex items-center gap-1 hover:underline"
          >
            <MiniTGIcon />
            Поддержка
          </a>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-[326px] bg-white h-[2px] absolute bottom-[12px] left-[12px] rounded-[8px] overflow-hidden">
          <div
            className="absolute left-0 h-[2px] bg-red-500 rounded-[8px] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
