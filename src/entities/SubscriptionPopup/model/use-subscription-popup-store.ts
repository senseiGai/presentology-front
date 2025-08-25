import { create } from "zustand";

type SubscriptionPopupState = {
  isOpen: boolean;
  isConfirmExitOpen: boolean;
  hasDiscount: boolean;
  openPopup: () => void;
  closePopup: () => void;
  openConfirmExit: () => void;
  closeConfirmExit: () => void;
  forceClose: () => void;
  applyDiscount: () => void;
};

export const useSubscriptionPopupStore = create<SubscriptionPopupState>(
  (set) => ({
    isOpen: false,
    isConfirmExitOpen: false,
    hasDiscount: false,
    openPopup: () => set({ isOpen: true }),
    closePopup: () => set({ isConfirmExitOpen: true }),
    openConfirmExit: () => set({ isConfirmExitOpen: true }),
    closeConfirmExit: () => set({ isConfirmExitOpen: false }),
    forceClose: () =>
      set({ isOpen: false, isConfirmExitOpen: false, hasDiscount: false }),
    applyDiscount: () =>
      set({ hasDiscount: true, isConfirmExitOpen: false, isOpen: true }),
  })
);
