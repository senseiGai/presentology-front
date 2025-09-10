import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SquareCheckIcon from "../../../../public/icons/SquareCheckIcon";

interface SlideTypeChangePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    textBlockCount: number,
    contentType: string,
    templateIndex: number
  ) => void;
}

const contentTypes = [
  { id: "title", label: "Титульный слайд" },
  { id: "infographic", label: "Инфографика" },
  { id: "contacts", label: "Контакты" },
  { id: "timeline", label: "Таймлайн" },
  { id: "divider", label: "Разделитель" },
];

// Template images - these would be the actual slide template images
const getTemplatesForContentType = (
  contentType: string,
  textBlockCount?: number
) => {
  // If textBlockCount is provided, return templates specific to that count
  if (textBlockCount) {
    switch (textBlockCount) {
      case 1:
        return [
          "/assets/slide-types/first/first01.png",
          "/assets/slide-types/first/first02.png",
          "/assets/slide-types/first/first03.png",
          "/assets/slide-types/first/first04.png",
        ];
      case 2:
        return [
          "/assets/slide-types/second/second01.png",
          "/assets/slide-types/second/second02.png",
          "/assets/slide-types/second/second03.png",
          "/assets/slide-types/second/second04.png",
          "/assets/slide-types/second/second05.png",
          "/assets/slide-types/second/second06.png",
        ];
      case 3:
        return [
          "/assets/slide-types/third/third01.png",
          "/assets/slide-types/third/third02.png",
          "/assets/slide-types/third/third03.png",
          "/assets/slide-types/third/third04.png",
          "/assets/slide-types/third/third05.png",
          "/assets/slide-types/third/third06.png",
        ];
      case 4:
        return [
          "/assets/slide-types/fourth/fourth01.png",
          "/assets/slide-types/fourth/fourth02.png",
          "/assets/slide-types/fourth/fourth03.png",
          "/assets/slide-types/fourth/fourth04.png",
          "/assets/slide-types/fourth/fourth05.png",
          "/assets/slide-types/fourth/fourth06.png",
        ];
      case 5:
        return [
          "/assets/slide-types/fifth/fifth01.png",
          "/assets/slide-types/fifth/fifth02.png",
          "/assets/slide-types/fifth/fifth03.png",
          "/assets/slide-types/fifth/fifth04.png",
          "/assets/slide-types/fifth/fifth05.png",
          "/assets/slide-types/fifth/fifth06.png",
          "/assets/slide-types/fifth/fifth07.png",
          "/assets/slide-types/fifth/fifth08.png",
          "/assets/slide-types/fifth/fifth09.png",
          "/assets/slide-types/fifth/fifth10.png",
        ];
      case 6:
        return [
          "/assets/slide-types/sixth/sixth01.png",
          "/assets/slide-types/sixth/sixth02.png",
          "/assets/slide-types/sixth/sixth03.png",
          "/assets/slide-types/sixth/sixth04.png",
          "/assets/slide-types/sixth/sixth05.png",
          "/assets/slide-types/sixth/sixth06.png",
          "/assets/slide-types/sixth/sixth07.png",
          "/assets/slide-types/sixth/sixth08.png",
          "/assets/slide-types/sixth/sixth09.png",
        ];
      case 7:
        return [
          "/assets/slide-types/seventh/seventh01.png",
          "/assets/slide-types/seventh/seventh02.png",
        ];
      case 8:
        return [
          "/assets/slide-types/eighth/eighth01.png",
          "/assets/slide-types/eighth/eighth02.png",
          "/assets/slide-types/eighth/eighth03.png",
          "/assets/slide-types/eighth/eighth04.png",
        ];
      default:
        return [
          "/assets/slide-types/first/first01.png",
          "/assets/slide-types/first/first02.png",
          "/assets/slide-types/first/first03.png",
          "/assets/slide-types/first/first04.png",
        ];
    }
  }

  const baseTemplates = [
    "/assets/slide-types/title/title01.png",
    "/assets/slide-types/title/title02.png",
    "/assets/slide-types/title/title03.png",
    "/assets/slide-types/title/title04.png",
    "/assets/slide-types/title/title05.png",
    "/assets/slide-types/title/title06.png",
    "/assets/slide-types/title/title07.png",
  ];

  // Return different templates based on content type
  switch (contentType) {
    case "title":
      return baseTemplates;
    case "infographic":
      return [
        "/assets/slide-types/infographics/infographics01.png",
        "/assets/slide-types/infographics/infographics02.png",
        "/assets/slide-types/infographics/infographics03.png",
        "/assets/slide-types/infographics/infographics04.png",
        "/assets/slide-types/infographics/infographics05.png",
        "/assets/slide-types/infographics/infographics06.png",
        "/assets/slide-types/infographics/infographics07.png",
        "/assets/slide-types/infographics/infographics08.png",
        "/assets/slide-types/infographics/infographics09.png",
        "/assets/slide-types/infographics/infographics10.png",
        "/assets/slide-types/infographics/infographics11.png",
        "/assets/slide-types/infographics/infographics12.png",
      ];
    case "timeline":
      return [
        "/assets/slide-types/timeline/timeline01.png",
        "/assets/slide-types/timeline/timeline02.png",
        "/assets/slide-types/timeline/timeline03.png",
        "/assets/slide-types/timeline/timeline04.png",
        "/assets/slide-types/timeline/timeline05.png",
        "/assets/slide-types/timeline/timeline06.png",
        "/assets/slide-types/timeline/timeline07.png",
        "/assets/slide-types/timeline/timeline08.png",
        "/assets/slide-types/timeline/timeline09.png",
        "/assets/slide-types/timeline/timeline10.png",
        "/assets/slide-types/timeline/timeline11.png",
        "/assets/slide-types/timeline/timeline12.png",
        "/assets/slide-types/timeline/timeline13.png",
        "/assets/slide-types/timeline/timeline14.png",
        "/assets/slide-types/timeline/timeline15.png",
        "/assets/slide-types/timeline/timeline16.png",
        "/assets/slide-types/timeline/timeline17.png",
        "/assets/slide-types/timeline/timeline18.png",
        "/assets/slide-types/timeline/timeline19.png",
        "/assets/slide-types/timeline/timeline20.png",
        "/assets/slide-types/timeline/timeline21.png",
        "/assets/slide-types/timeline/timeline22.png",
        "/assets/slide-types/timeline/timeline23.png",
        "/assets/slide-types/timeline/timeline24.png",
        "/assets/slide-types/timeline/timeline25.png",
        "/assets/slide-types/timeline/timeline26.png",
        "/assets/slide-types/timeline/timeline27.png",
        "/assets/slide-types/timeline/timeline28.png",
      ];
    case "contacts":
      return [
        "/assets/slide-types/contacts/contacts01.png",
        "/assets/slide-types/contacts/contacts02.png",
        "/assets/slide-types/contacts/contacts03.png",
        "/assets/slide-types/contacts/contacts04.png",
        "/assets/slide-types/contacts/contacts05.png",
      ];
    case "divider":
      return [
        "/assets/slide-types/divider/divider01.png",
        "/assets/slide-types/divider/divider02.png",
        "/assets/slide-types/divider/divider03.png",
        "/assets/slide-types/divider/divider04.png",
        "/assets/slide-types/divider/divider05.png",
      ];
    default: // title slide
      return baseTemplates;
  }
};

export const SlideTypeChangePopup: React.FC<SlideTypeChangePopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedTextBlockCount, setSelectedTextBlockCount] =
    useState<number>(1);
  const [selectedContentType, setSelectedContentType] =
    useState<string>("title");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [selectionMode, setSelectionMode] = useState<
    "textBlocks" | "contentType"
  >("textBlocks");

  const templates =
    selectionMode === "textBlocks"
      ? getTemplatesForContentType("", selectedTextBlockCount)
      : getTemplatesForContentType(selectedContentType);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectionMode === "textBlocks") {
      onConfirm(
        selectedTextBlockCount,
        "blocks", // Use a special identifier for text block mode
        selectedTemplateIndex
      );
    } else {
      onConfirm(
        0, // No specific text block count for content type mode
        selectedContentType,
        selectedTemplateIndex
      );
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-[24px] w-[895px] max-h-[736px] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3]">
            Изменить тип слайда
          </h2>

          {/* Close button */}
          <div className="w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
            <span className="text-[18px] font-[400] text-[#8F8F92]">esc</span>
            <button
              aria-label="Закрыть"
              onClick={onClose}
              className="text-[#8F8F92] cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Text block count selection */}
          <div className="mb-6">
            <h3 className="text-[18px] font-semibold text-[#8F8F92] mb-4 leading-[1.2]">
              По количеству текстовых блоков
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setSelectedTextBlockCount(count);
                    setSelectedTemplateIndex(0); // Reset template selection when text block count changes
                    setSelectionMode("textBlocks"); // Set mode to text blocks
                  }}
                  className={`w-[60px] h-[54px] rounded-[8px] flex items-center justify-center text-[18px] font-normal transition-colors ${
                    selectedTextBlockCount === count &&
                    selectionMode === "textBlocks"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Content type selection */}
          <div className="mb-10">
            <h3 className="text-[18px] font-semibold text-[#8F8F92] mb-4 leading-[1.2]">
              По контенту
            </h3>
            <div className="flex gap-2 flex-wrap">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedContentType(type.id);
                    setSelectedTemplateIndex(0); // Reset template selection
                    setSelectionMode("contentType"); // Set mode to content type
                  }}
                  className={`px-6 py-4 rounded-[8px] text-[18px] font-normal transition-colors ${
                    selectedContentType === type.id &&
                    selectionMode === "contentType"
                      ? "bg-[#BBA2FE] text-white"
                      : "bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template selection */}
          <div className="mb-4">
            <h3 className="text-[24px] font-medium text-[#8F8F92] mb-4 leading-[1.3]">
              Выберите шаблон
            </h3>

            <div className="space-y-4">
              {/* Render templates in pairs */}
              {Array.from(
                { length: Math.ceil(templates.length / 2) },
                (_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4 justify-between">
                    {/* First template in row */}
                    {templates[rowIndex * 2] && (
                      <div
                        onClick={() => setSelectedTemplateIndex(rowIndex * 2)}
                        className={`relative w-[414px] h-[233px] rounded-[16px] cursor-pointer transition-all overflow-hidden ${
                          selectedTemplateIndex === rowIndex * 2
                            ? "ring-8 ring-[#BBA2FE] border-none"
                            : "border border-[#D5D5D6] hover:border-[#BBA2FE]"
                        }`}
                      >
                        <Image
                          src={templates[rowIndex * 2]}
                          alt={`Template ${rowIndex * 2 + 1}`}
                          fill
                          className="object-cover"
                          sizes="414px"
                        />

                        {/* Selected indicator */}
                        {selectedTemplateIndex === rowIndex * 2 && (
                          <div className="absolute top-1 right-1 flex items-center justify-center">
                            <SquareCheckIcon />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Second template in row */}
                    {templates[rowIndex * 2 + 1] && (
                      <div
                        onClick={() =>
                          setSelectedTemplateIndex(rowIndex * 2 + 1)
                        }
                        className={`relative w-[414px] h-[233px] rounded-[16px] cursor-pointer transition-all overflow-hidden ${
                          selectedTemplateIndex === rowIndex * 2 + 1
                            ? "ring-8 ring-[#BBA2FE] border-none"
                            : "border border-[#D5D5D6] hover:border-[#BBA2FE]"
                        }`}
                      >
                        <Image
                          src={templates[rowIndex * 2 + 1]}
                          alt={`Template ${rowIndex * 2 + 2}`}
                          fill
                          className="object-cover"
                          sizes="414px"
                        />

                        {/* Selected indicator */}
                        {selectedTemplateIndex === rowIndex * 2 + 1 && (
                          <div className="absolute top-1 right-1 flex items-center justify-center">
                            <SquareCheckIcon />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty space if odd number of templates in last row */}
                    {templates.length % 2 !== 0 &&
                      rowIndex === Math.ceil(templates.length / 2) - 1 &&
                      !templates[rowIndex * 2 + 1] && (
                        <div className="w-[414px]" />
                      )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="bg-white flex gap-2 items-center justify-center p-6 rounded-tl-[16px] rounded-tr-[16px]"
          style={{ boxShadow: "0px -4px 6px 0px rgba(0,0,0,0.03)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 h-[52px] rounded-[8px] text-[18px] font-normal bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
          >
            Отменить
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 h-[52px] rounded-[8px] text-[18px] font-normal bg-[#BBA2FE] text-white hover:bg-[#A693FD] transition-colors cursor-pointer"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};
