import { X } from "lucide-react";
import WarningIcon from "../../../../public/icons/WarningIcon";
import CopyIcon from "../../../../public/icons/CopyIcon";
import MiniTGIcon from "../../../../public/icons/MiniTGIcon";

export function ErrorCard({
  message = "Повторите попытку позже",
  description = "Если проблема не устранена, скопируйте сообщение об ошибке ниже и обратитесь в нашу службу поддержки",
  onClose,
  showOverlay = false,
}: {
  message?: string;
  description?: string;
  onClose?: () => void;
  showOverlay?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const cardContent = (
    <div
      className="max-w-[350px] h-[180px] bg-[#F5F5F5] rounded-[12px] shadow-2xl p-[12px] relative"
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
          className="text-[14px] text-[#0077FF] font-medium flex items-center gap-1 hover:underline"
        >
          <CopyIcon />
          Скопировать сообщение
        </button>
        <a
          href="https://t.me/support"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-[#0077FF] font-medium flex items-center gap-1 hover:underline"
        >
          <MiniTGIcon />
          Поддержка
        </a>
      </div>

      <div className="w-[326.00000000000125px] bg-white h-[2px] absolute bottom-[12px] rounded-[8px]">
        <div className="absolute left-0 w-[223.23915100097656px] h-[2px] bg-red-500 rounded-[8px]" />
      </div>
    </div>
  );

  if (showOverlay) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleOverlayClick}
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
}
