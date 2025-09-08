import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Check } from "typeorm";
import SquareCheckIcon from "../../../public/icons/SquareCheckIcon";

interface DesignChangePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (templateIndex: number, styleIndex: number) => void;
}

const templates = [
  {
    title: "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ",
    subtitle: "Подзаголовок\nв две строки",
    layout: "two-column",
  },
  {
    title: "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ",
    subtitle: "Подзаголовок\nв две строки",
    layout: "four-column",
  },
];

const styles = [
  {
    name: "Современный",
    description: "Чистый и минималистичный дизайн",
    color: "#A78BFA",
    bgColor: "#F3F4F6",
    image: "/assets/presentation/style_popup01.png",
  },
  {
    name: "Корпоративный",
    description: "Профессиональный бизнес-стиль",
    color: "#6B7280",
    bgColor: "#374151",
    image: "/assets/presentation/style_popup02.png",
  },
  {
    name: "Креативный",
    description: "Яркий и творческий подход",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    image: "/assets/presentation/style_popup03.png",
  },
];

export const DesignChangePopup: React.FC<DesignChangePopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    const t = setTimeout(
      () => window.addEventListener("keyup", handler, { capture: true }),
      50
    );
    return () => {
      clearTimeout(t);
      window.removeEventListener("keyup", handler, { capture: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedTemplate, selectedStyle);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[16px] w-[895px] max-h-[736px] flex flex-col relative">
          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-[24px] pt-[28px] pb-[24px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-medium text-[#0B0911]">
                Изменить дизайн презентации
              </h2>
              <div className="absolute right-6 top-6 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
                <span className="text-[18px] font-[400] text-[#8F8F92]">
                  esc
                </span>
                <button
                  aria-label="Закрыть"
                  onClick={onClose}
                  className="text-[#8F8F92] cursor-pointer"
                >
                  <X />
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mt-8">
              <h3 className="text-[24px] font-medium text-[#8F8F92]">
                Выберите шаблон
              </h3>

              <div className="flex gap-10 mt-4">
                {templates.map((template, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTemplate(index)}
                    className={`relative flex-1 h-[223px] cursor-pointer rounded-[12px] transition-all ${
                      selectedTemplate === index
                        ? "ring-[8px] ring-[#A78BFA]"
                        : "border-[1px] border-[#EBEBEB]"
                    }`}
                  >
                    {selectedTemplate === index && (
                      <div className="absolute top-0 right-0 z-[99999] shadow-2xl">
                        <SquareCheckIcon />
                      </div>
                    )}
                    <Image
                      src={"/assets/presentation/presentation01.png"}
                      width={300}
                      height={200}
                      alt="Presentation"
                      className="absolute inset-0 w-full h-full object-cover rounded-[12px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="mt-10">
              <h3 className="text-[24px] font-medium text-[#8F8F92]">
                Выберите визуальный стиль
              </h3>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {styles.map((style, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedStyle(index)}
                    className={`relative cursor-pointer flex-1 h-[222px] p-4 rounded-[8px] transition-all ${
                      selectedStyle === index ? "bg-[#BBA2FE]" : "bg-[#F4F4F4]"
                    }`}
                  >
                    {selectedStyle === index && (
                      <div className="absolute top-1 right-1">
                        <SquareCheckIcon />
                      </div>
                    )}
                    <div className="relative">
                      <h4
                        className={`text-[18px] font-medium  mb-1 ${
                          selectedStyle === index
                            ? "text-white"
                            : "text-[#0B0911]"
                        }`}
                      >
                        {style.name}
                      </h4>
                      <p
                        className={`text-[13px] tracking-[-3%] ${
                          selectedStyle === index
                            ? "text-white"
                            : "text-[#6B7280]"
                        }`}
                      >
                        {style.description}
                      </p>
                      <Image
                        src={style.image}
                        alt={style.name}
                        width={240}
                        height={126}
                        className="w-full h-[126px]  rounded-[4px] mt-[21px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="bg-white w-full h-[100px] flex items-center justify-between px-[24px] rounded-[16px] gap-2"
            style={{ boxShadow: "0px -4px 6px 0px #00000008" }}
          >
            <button
              onClick={onClose}
              className="flex-1 h-[52px] rounded-[8px] text-[18px] font-normal bg-[#F4F4F4] text-[#0B0911] transition-colors cursor-pointer"
            >
              Отменить
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 h-[52px] rounded-[8px] text-[18px] font-normal bg-[#A78BFA] cursor-pointer text-white transition-colors"
            >
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
