import React from "react";
import Image from "next/image";
import TrashIcon from "../../../../public/icons/TrashIcon";
import { useConfirmDeleteStore } from "../../ConfirmDeletePopup/model/use-confirm-delete-popup";
import { useRouter } from "next/navigation";

interface PresentationCardProps {
  id?: string;
  images: string[];
  label: string;
  date: string;
  tag: "Сгенерированная" | "Улучшенная" | "По брендбуку";
}

export const PresentationCard = ({
  id,
  images,
  label,
  date,
  tag,
}: PresentationCardProps) => {
  const { openModal } = useConfirmDeleteStore();
  const router = useRouter();

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
    <div
      className="bg-[#FFFFFF80] w-[306px] h-[205px] rounded-[16px] flex flex-col relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
      onClick={(e) => {
        // Проверяем, что клик не был по кнопке удаления
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        if (id) {
          // Переход к редактору презентации
          router.push(`/presentation-editor/${id}`);
        } else {
          console.log("No presentation ID available for:", label);
        }
      }}
    >
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
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked!"); // Для отладки
              openModal({
                title: label,
                description:
                  "После удаления восстановить презентацию будет невозможно",

                onConfirm: () => {
                  console.log("Deleting presentation:", label);
                  // TODO: Add actual delete logic here
                },
              });
            }}
            className="cursor-pointer w-[32px] h-[32px] flex items-center justify-center transition-colors duration-200 relative z-10"
            type="button"
          >
            <TrashIcon />
          </button>
        </div>
        <div className="flex flex-col overflow-hidden pr-[60px]">
          <span className="text-[14px] font-medium text-[#0B0911] truncate">
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
