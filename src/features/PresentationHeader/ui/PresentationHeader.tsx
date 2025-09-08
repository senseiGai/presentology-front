import React, { useState, useRef } from "react";
import { Button } from "@/shared/ui/Button";
import { SharePopup } from "@/shared/ui/SharePopup";
import { DownloadPopup } from "@/shared/ui/DownloadPopup";
import HouseIcon from "../../../../public/icons/HouseIcon";
import MinusIcon from "../../../../public/icons/MinusIcon";
import PlusIcon from "../../../../public/icons/PlusIcon";
import PaintIcon from "../../../../public/icons/PainIcon";
import ShareIcon from "../../../../public/icons/ShareIcon";
import DownloadIcon from "../../../../public/icons/DownloadIcon";

interface PresentationHeaderProps {
  onBack?: () => void;
  onDownload: () => void;
  onDownloadPPTX?: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  onChangeDesign?: () => void;
  onShare?: () => void;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  onBack,
  onDownload,
  onDownloadPPTX,
  onDownloadPDF,
  onSendEmail,
  onChangeDesign,
  onShare,
}) => {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const handleCopyLink = () => {
    // Copy current page URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    setIsSharePopupOpen(false);
    // You could add a toast notification here
  };

  const handleShareTelegram = () => {
    // Open Telegram share with current URL
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(telegramUrl, "_blank");
    setIsSharePopupOpen(false);
  };

  const handleShareClick = () => {
    setIsSharePopupOpen(!isSharePopupOpen);
    if (onShare) {
      onShare();
    }
  };

  const handleDownloadClick = () => {
    setIsDownloadPopupOpen(!isDownloadPopupOpen);
    if (onDownload) {
      onDownload();
    }
  };

  const handleDownloadPPTX = () => {
    if (onDownloadPPTX) {
      onDownloadPPTX();
    }
    setIsDownloadPopupOpen(false);
  };

  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    }
    setIsDownloadPopupOpen(false);
  };

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail();
    }
    setIsDownloadPopupOpen(false);
  };
  return (
    <div
      className="bg-white border-b-[1px] border-[#E9E9E9] px-[24px] py-[20px] flex items-center justify-between"
      style={{ boxShadow: "0px 4px 4px 0px #BBA2FE1A" }}
    >
      <div className="flex items-center gap-x-4">
        {/* Home icon */}
        <button
          onClick={onBack}
          className="flex items-center justify-center cursor-pointer rounded-[8px] bg-[#F4F4F4] w-[40px] h-[40px] hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors"
        >
          <HouseIcon />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-x-2">
          <button className="flex w-[32px] h-[32px] items-center justify-center cursor-pointer">
            <MinusIcon />
          </button>
          <span className="text-[#0B0911] text-[18px] font-normal text-center">
            100%
          </span>
          <button className="flex w-[32px] h-[32px] items-center justify-center cursor-pointer">
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-x-4">
        <button
          onClick={onChangeDesign}
          className="gap-x-2 bg-[#F4F4F4] w-[218px] h-[40px] rounded-[8px] flex items-center justify-center hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors cursor-pointer"
        >
          <PaintIcon />
          <span className="text-[18px] text-[#0B0911] font-regular">
            Изменить дизайн
          </span>
        </button>

        <div className="relative">
          <button
            ref={shareButtonRef}
            onClick={handleShareClick}
            className="gap-x-2 bg-[#F4F4F4] w-[172px] h-[40px] rounded-[8px] flex items-center justify-center hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors cursor-pointer"
          >
            <ShareIcon />
            <span className="text-[18px] text-[#0B0911] font-regular">
              Поделиться
            </span>
          </button>

          <SharePopup
            isOpen={isSharePopupOpen}
            onClose={() => setIsSharePopupOpen(false)}
            onCopyLink={handleCopyLink}
            onShareTelegram={handleShareTelegram}
          />
        </div>

        <div className="relative">
          <Button
            onClick={handleDownloadClick}
            className="!w-[139px] !h-[40px] gap-x-2"
          >
            <DownloadIcon />
            <span className="text-[18px]  font-regular">Скачать</span>
          </Button>

          <DownloadPopup
            isOpen={isDownloadPopupOpen}
            onClose={() => setIsDownloadPopupOpen(false)}
            onDownloadPPTX={handleDownloadPPTX}
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={handleSendEmail}
          />
        </div>
      </div>
    </div>
  );
};
