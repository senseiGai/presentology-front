import React from "react";
import BlackClipboardIcon from "@/../public/icons/BlackClipboardIcon";
import MiniTGIcon from "../../../public/icons/MiniTGIcon";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onShareTelegram: () => void;
}

export const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  onCopyLink,
  onShareTelegram,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div className="absolute w-[197px] h-[100px] px-4 flex flex-col items-center justify-center top-full right-0 mt-2 bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
        <button
          onClick={onCopyLink}
          className="w-full flex items-center gap-2 text-left cursor-pointer"
        >
          <BlackClipboardIcon className="w-3 h-3" />
          <span className="text-[14px] text-[#0B0911] font-medium">
            Копировать ссылку
          </span>
        </button>

        <button
          onClick={onShareTelegram}
          className="w-full flex items-center gap-2 text-left mt-3 cursor-pointer"
        >
          <MiniTGIcon />
          <span className="text-[14px] text-[#0B0911] font-medium">
            В Telegram
          </span>
        </button>
      </div>
    </>
  );
};
