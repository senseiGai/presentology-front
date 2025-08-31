import { create } from "zustand";
import {
  showSubscriptionCancelledToast,
  showTariffChangedToast,
} from "../lib/toasts";

interface SubscriptionState {
  isPremium: boolean;
  showCancelPopup: boolean;
  showOfferPopup: boolean;
  hasDiscount: boolean;

  // Actions
  setPremium: (isPremium: boolean) => void;
  openCancelPopup: () => void;
  closeCancelPopup: () => void;
  openOfferPopup: () => void;
  closeOfferPopup: () => void;
  cancelSubscription: () => void;
  stayWithDiscount: () => void;
  activateDiscount: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPremium: true, // По умолчанию пользователь имеет премиум
  showCancelPopup: false,
  showOfferPopup: false,
  hasDiscount: false,

  setPremium: (isPremium: boolean) => set({ isPremium }),

  openCancelPopup: () => set({ showCancelPopup: true }),
  closeCancelPopup: () => set({ showCancelPopup: false }),

  openOfferPopup: () => set({ showOfferPopup: true }),
  closeOfferPopup: () => set({ showOfferPopup: false }),

  cancelSubscription: () => {
    set({
      isPremium: false,
      showCancelPopup: false,
      showOfferPopup: false,
      hasDiscount: false,
    });
    showSubscriptionCancelledToast();
  },

  stayWithDiscount: () => {
    set({
      showCancelPopup: false,
      showOfferPopup: true,
    });
    // Тост будет показан позже при активации скидки
  },

  activateDiscount: () => {
    set({
      hasDiscount: true,
      showOfferPopup: false,
    });
    showTariffChangedToast();
  },
}));
