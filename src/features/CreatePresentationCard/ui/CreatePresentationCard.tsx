import React from "react";
import Image from "next/image";
import ArrowRight from "../../../../public/icons/ArrowRight";

interface CreatePresentationCardProps {
  label: string;
  description: string;
  image: string;
  onClick: () => void;
  isActive?: boolean;
}

export const CreatePresentationCard = ({
  label,
  description,
  image,
  onClick,
  isActive = true,
}: CreatePresentationCardProps) => {
  return (
    <div
      onClick={!!isActive ? onClick : undefined}
      className={`flex transition-transform duration-300 ease-in-out relative flex-col w-[229px] h-[288px] bg-white rounded-[24px] pt-[24px] pl-[24px] ${
        isActive
          ? "group hover:-translate-y-2 cursor-pointer"
          : " cursor-not-allowed"
      }`}
    >
      <span className="text-[#0C0C0C] text-[24px] font-medium">{label}</span>
      <p className="mt-[16px] text-[14px] text-[#BEBEC0] font-normal leading-[120%] tracking-[-3%] max-w-[182px]">
        {description}
      </p>

      <div className="flex flex-row justify-between mt-auto items-end">
        <Image
          src={image}
          alt={label}
          width={134}
          height={134}
          className="absolute left-0"
        />
        {isActive ? (
          <button
            onClick={onClick}
            className="cursor-pointer absolute right-4 bottom-4 rounded-full bg-[#BBA2FE] w-[40px] h-[40px] flex items-center justify-center"
          >
            <ArrowRight />
          </button>
        ) : (
          <span className="cursor-not-allowed absolute right-4 bottom-4 text-[#BEBEC0] text-[14px]">
            Скоро
          </span>
        )}
      </div>

      {/* Свечение появляется только на hover */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[157px] h-[29px] bg-white blur-[21.4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
