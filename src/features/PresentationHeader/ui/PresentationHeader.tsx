import React from "react";
import { Button } from "@/shared/ui/Button";
import HouseIcon from "../../../../public/icons/HouseIcon";
import MinusIcon from "../../../../public/icons/MinusIcon";
import PlusIcon from "../../../../public/icons/PlusIcon";
import PaintIcon from "../../../../public/icons/PainIcon";
import ShareIcon from "../../../../public/icons/ShareIcon";
import DownloadIcon from "../../../../public/icons/DownloadIcon";

interface PresentationHeaderProps {
  onBack?: () => void;
  onDownload: () => void;
  onChangeDesign?: () => void;
  onShare?: () => void;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  onBack,
  onDownload,
  onChangeDesign,
  onShare,
}) => {
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

        <button
          onClick={onShare}
          className="gap-x-2 bg-[#F4F4F4] w-[172px] h-[40px] rounded-[8px] flex items-center justify-center hover:bg-[#E5E7EB] ease-in-out duration-300 transition-colors cursor-pointer"
        >
          <ShareIcon />
          <span className="text-[18px] text-[#0B0911] font-regular">
            Поделиться
          </span>
        </button>

        <Button onClick={onDownload} className="!w-[139px] !h-[40px] gap-x-2">
          <DownloadIcon />
          <span className="text-[18px]  font-regular">Скачать</span>
        </Button>
      </div>
    </div>
  );
};
