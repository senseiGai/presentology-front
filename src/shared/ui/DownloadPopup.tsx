import React from "react";
import PPTIcon from "../../../public/icons/PPTIcon";
import PDFIcon from "../../../public/icons/PDFIcon";
import MailIcon from "../../../public/icons/MailIcon";

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPPTX: () => void;
  onDownloadPDF: () => void;
  onSendEmail: () => void;
}

export const DownloadPopup: React.FC<DownloadPopupProps> = ({
  isOpen,
  onClose,
  onDownloadPPTX,
  onDownloadPDF,
  onSendEmail,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div className="absolute w-[197px] h-[136px] px-4 py-3 flex flex-col items-center justify-center top-full right-0 mt-2 bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
        <button
          onClick={onDownloadPPTX}
          className="w-full flex items-center gap-2 text-left cursor-pointer py-2 rounded transition-colors"
        >
          <PPTIcon className="w-3 h-3" />
          <span className="text-[14px] text-[#0B0911] font-medium">
            В формате PPTX
          </span>
        </button>

        <button
          onClick={onDownloadPDF}
          className="w-full flex items-center gap-2 text-left cursor-pointer py-2 rounded transition-colors"
        >
          <PDFIcon className="w-3 h-3" />
          <span className="text-[14px] text-[#0B0911] font-medium">
            В формате PDF
          </span>
        </button>

        <button
          onClick={onSendEmail}
          className="w-full flex items-center gap-2 text-left cursor-pointer py-2 rounded transition-colors"
        >
          <MailIcon className="w-3 h-3" />
          <span className="text-[14px] text-[#0B0911] font-medium whitespace-nowrap">
            Отправить на почту
          </span>
        </button>
      </div>
    </>
  );
};
