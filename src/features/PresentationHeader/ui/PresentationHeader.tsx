import React, { useState, useRef } from "react";
import { Button } from "@/shared/ui/Button";
import { SharePopup } from "@/shared/ui/SharePopup";
import { DownloadPopup } from "@/shared/ui/DownloadPopup";
import { DesignChangePopup } from "@/shared/ui/DesignChangePopup";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import HouseIcon from "../../../../public/icons/HouseIcon";
import MinusIcon from "../../../../public/icons/MinusIcon";
import PlusIcon from "../../../../public/icons/PlusIcon";
import PaintIcon from "../../../../public/icons/PainIcon";
import ShareIcon from "../../../../public/icons/ShareIcon";
import DownloadIcon from "../../../../public/icons/DownloadIcon";
import LogoIllustration from "../../../../public/icons/LogoIllustration";
import RevertPast from "../../../../public/icons/RevertPast";
import RevertNext from "../../../../public/icons/RevertNext";

interface PresentationHeaderProps {
  onBack?: () => void;
  onDownload: () => void;
  onDownloadPPTX?: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  onChangeDesign?: (templateIndex: number, styleIndex: number) => void;
  onShare?: () => void;
  isGenerating?: boolean;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  onBack,
  onDownload,
  onDownloadPPTX,
  onDownloadPDF,
  onSendEmail,
  onChangeDesign,
  onShare,
  isGenerating = false,
}) => {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const [isDesignPopupOpen, setIsDesignPopupOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePresentationStore();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsSharePopupOpen(false);
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
    if (!isGenerating) {
      setIsSharePopupOpen(!isSharePopupOpen);
      if (onShare) {
        onShare();
      }
    }
  };

  const handleDownloadClick = () => {
    if (!isGenerating) {
      setIsDownloadPopupOpen(!isDownloadPopupOpen);
      if (onDownload) {
        onDownload();
      }
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

  const handleDesignClick = () => {
    if (!isGenerating) {
      setIsDesignPopupOpen(true);
    }
  };

  const handleDesignChange = (templateIndex: number, styleIndex: number) => {
    if (onChangeDesign && !isGenerating) {
      onChangeDesign(templateIndex, styleIndex);
    }
    setIsDesignPopupOpen(false);
  };
  return (
    <div
      className="bg-white border-b-[1px] border-[#E9E9E9] px-[24px] py-[20px] flex items-center justify-between"
      style={{ boxShadow: "0px 4px 4px 0px #BBA2FE1A" }}
    >
      <div className="flex items-center gap-x-4">
        <LogoIllustration />
        {/* Home icon */}
        <button
          onClick={onBack}
          className="flex items-center justify-center cursor-pointer rounded-[8px] bg-[#F4F4F4] w-[40px] h-[40px] hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors"
        >
          <HouseIcon />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-x-2">
          <button
            onClick={zoomOut}
            disabled={isGenerating}
            className={`flex w-[32px] h-[32px] items-center justify-center hover:bg-[#F4F4F4] rounded-[4px] transition-colors ${
              isGenerating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <MinusIcon fill={isGenerating ? "#9CA3AF" : "#939396"} />
          </button>
          <span className="text-[#0B0911] text-[18px] font-normal text-center min-w-[50px]">
            {zoomLevel}%
          </span>
          <button
            onClick={zoomIn}
            disabled={isGenerating}
            className={`flex w-[32px] h-[32px] items-center justify-center hover:bg-[#F4F4F4] rounded-[4px] transition-colors ${
              isGenerating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <PlusIcon fill={isGenerating ? "#9CA3AF" : "#939396"} />
          </button>
          {zoomLevel !== 100 && (
            <button
              onClick={resetZoom}
              className="ml-2 w-[129px] h-[40px] text-[18px] font-normal text-[#0B0911] bg-[#FFFFFF] border-[#C0C0C1] border-[1px] rounded-[8px] transition-colors cursor-pointer"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Undo/Redo controls */}
      </div>

      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <button
            onClick={undo}
            disabled={isGenerating || !canUndo()}
            className={`flex w-[32px] h-[32px] items-center justify-center hover:bg-[#F4F4F4] rounded-[4px] transition-colors ${
              isGenerating || !canUndo()
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            title="Отменить"
          >
            <RevertPast
              fill={isGenerating || !canUndo() ? "#9CA3AF" : "#939396"}
            />
          </button>
          <button
            onClick={redo}
            disabled={isGenerating || !canRedo()}
            className={`flex w-[32px] h-[32px] items-center justify-center hover:bg-[#F4F4F4] rounded-[4px] transition-colors ${
              isGenerating || !canRedo()
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            title="Повторить"
          >
            <RevertNext
              fill={isGenerating || !canRedo() ? "#9CA3AF" : "#939396"}
            />
          </button>
        </div>
        <button
          onClick={handleDesignClick}
          disabled={isGenerating}
          className={`gap-x-2 w-[218px] bg-[#F4F4F4] hover:bg-[#E5E7EB] cursor-pointer h-[40px] rounded-[8px] flex items-center justify-center ease-in-out duration-300 transition-colors ${
            isGenerating ? " cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <PaintIcon />
          <span
            className={`text-[18px] font-regular ${
              isGenerating
                ? "text-[#9CA3AF] cursor-not-allowed"
                : "text-[#0B0911] cursor-pointer"
            }
              }`}
          >
            Изменить дизайн
          </span>
        </button>

        <div className="relative">
          <button
            ref={shareButtonRef}
            onClick={handleShareClick}
            disabled={isGenerating}
            className={`gap-x-2 w-[172px] bg-[#F4F4F4] hover:bg-[#E5E7EB] cursor-pointer h-[40px] rounded-[8px] flex items-center justify-center ease-in-out duration-300 transition-colors ${
              isGenerating ? " cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <ShareIcon />
            <span
              className={`text-[18px] font-regular ${
                isGenerating
                  ? "text-[#9CA3AF] cursor-not-allowed"
                  : "text-[#0B0911] cursor-pointer"
              }
              }`}
            >
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
            disabled={isGenerating}
            className={`!w-[139px] !h-[40px] gap-x-2 ${
              isGenerating ? "!cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <DownloadIcon />
            <span className={`text-[18px] font-regular`}>Скачать</span>
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

      <DesignChangePopup
        isOpen={isDesignPopupOpen}
        onClose={() => setIsDesignPopupOpen(false)}
        onConfirm={handleDesignChange}
      />
    </div>
  );
};
