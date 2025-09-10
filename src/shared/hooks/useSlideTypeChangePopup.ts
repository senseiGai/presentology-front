import { useState } from "react";

interface UseSlideTypeChangePopupReturn {
  isOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  handleConfirm: (
    textBlockCount: number,
    contentType: string,
    templateIndex: number
  ) => void;
}

export const useSlideTypeChangePopup = (
  onSlideTypeChange?: (
    textBlockCount: number,
    contentType: string,
    templateIndex: number
  ) => void
): UseSlideTypeChangePopupReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  const handleConfirm = (
    textBlockCount: number,
    contentType: string,
    templateIndex: number
  ) => {
    onSlideTypeChange?.(textBlockCount, contentType, templateIndex);
    closePopup();
  };

  return {
    isOpen,
    openPopup,
    closePopup,
    handleConfirm,
  };
};
