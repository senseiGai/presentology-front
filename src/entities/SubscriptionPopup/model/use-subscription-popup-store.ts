import { create } from "zustand";

type SubscriptionPopupState = {
  isOpen: boolean;
  isConfirmExitOpen: boolean;
  hasDiscount: boolean;
  openPopup: () => void;
  closePopup: () => void;
  directClose: () => void;
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
    openPopup: () => {
      console.log("Opening popup");
      set({ isOpen: true });
    },
    closePopup: () => {
      console.log("Closing popup (opening confirm)");
      set({ isConfirmExitOpen: true });
    },
    directClose: () => {
      console.log("Direct close");
      set({ isOpen: false });
    },
    openConfirmExit: () => set({ isConfirmExitOpen: true }),
    closeConfirmExit: () => set({ isConfirmExitOpen: false }),
    forceClose: () =>
      set({ isOpen: false, isConfirmExitOpen: false, hasDiscount: false }),
    applyDiscount: () =>
      set({ hasDiscount: true, isConfirmExitOpen: false, isOpen: true }),
  })
);
