import React, { useState } from "react";
import Image from "next/image";
import TrashIcon from "../../../../public/icons/TrashIcon";

interface PresentationCardProps {
  images: string[];
  label: string;
  date: string;
  tag: "Сгенерированная" | "Улучшенная" | "По брендбуку";
}

export const PresentationCard = ({
  images,
  label,
  date,
  tag,
}: PresentationCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Минимальное расстояние свайпа для срабатывания
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const getTagStyles = (tagType: string) => {
    switch (tagType) {
      case "Сгенерированная":
        return "text-[#5746AF] bg-[#EDE9FE]";
      case "Улучшенная":
        return "text-[#BD4B00] bg-[#FFE8D7]";
      case "По брендбуку":
        return "text-[#5D770D] bg-[#E4F7C7]";
      default:
        return "text-[#927DCB] bg-[#F3F0FF]";
    }
  };

  return (
    <div className="bg-[#FFFFFF80] w-[306px] h-[205px] rounded-[16px] flex flex-col relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
      {/* Превью изображений */}
      <div className="p-4 flex gap-2">
        {images?.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            width={184.88888549804688}
            height={104}
            className="rounded-[5.78px]"
          />
        ))}
      </div>

      {/* Информационная панель */}
      <div className="absolute w-full h-[69px] bottom-0 rounded-b-[16px] bg-white pl-4 pt-4 flex flex-col ">
        <div className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Delete presentation");
            }}
            className="cursror-pointer"
          >
            <TrashIcon />
          </button>
        </div>
        <div className="flex flex-col ">
          <span className="text-[14px] font-medium text-[#0B0911] truncate flex-1">
            {label}
          </span>
          <span className="text-[12px] font-normal text-[#8F8F92] whitespace-nowrap mt-1">
            {date}
          </span>
        </div>
        <div
          className={`px-2 rounded-full absolute ${getTagStyles(
            tag
          )} bottom-[8px] right-[10px]`}
        >
          <span className={`text-[12px] font-medium ${getTagStyles(tag)}`}>
            {tag}
          </span>
        </div>
      </div>
    </div>
  );
};
