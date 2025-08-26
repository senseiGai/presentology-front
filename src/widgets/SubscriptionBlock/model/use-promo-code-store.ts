import { create } from "zustand";

interface PromoCode {
  code: string;
  discount: number; // в процентах
  description: string;
}

interface PromoCodeState {
  enteredCode: string;
  appliedPromo: PromoCode | null;
  isValid: boolean | null; // null = не проверен, true = валидный, false = невалидный
  originalPrice: number;
  discountedPrice: number;
  setEnteredCode: (code: string) => void;
  validatePromoCode: () => void;
  clearPromoCode: () => void;
  reset: () => void;
}

// Моковые промокоды
const MOCK_PROMO_CODES: PromoCode[] = [
  {
    code: "KAzusk29SPxs",
    discount: 20,
    description: "Скидка 20%",
  },
  {
    code: "SAVE30",
    discount: 30,
    description: "Скидка 30%",
  },
  {
    code: "NEWUSER",
    discount: 15,
    description: "Скидка для новых пользователей 15%",
  },
  {
    code: "WINTER2025",
    discount: 25,
    description: "Зимняя скидка 25%",
  },
];

const ORIGINAL_PRICE = 490;

export const usePromoCodeStore = create<PromoCodeState>((set, get) => ({
  enteredCode: "",
  appliedPromo: null,
  isValid: null,
  originalPrice: ORIGINAL_PRICE,
  discountedPrice: ORIGINAL_PRICE,

  setEnteredCode: (code: string) => {
    set({
      enteredCode: code,
      // Сбрасываем состояние валидации при изменении кода
      isValid: null,
      appliedPromo: null,
      discountedPrice: ORIGINAL_PRICE,
    });
  },

  validatePromoCode: () => {
    const { enteredCode } = get();

    if (!enteredCode.trim()) {
      set({
        isValid: false,
        appliedPromo: null,
        discountedPrice: ORIGINAL_PRICE,
      });
      return;
    }

    const foundPromo = MOCK_PROMO_CODES.find(
      (promo) => promo.code.toLowerCase() === enteredCode.trim().toLowerCase()
    );

    if (foundPromo) {
      const discountAmount = (ORIGINAL_PRICE * foundPromo.discount) / 100;
      const finalPrice = ORIGINAL_PRICE - discountAmount;

      set({
        isValid: true,
        appliedPromo: foundPromo,
        discountedPrice: Math.round(finalPrice),
      });
    } else {
      set({
        isValid: false,
        appliedPromo: null,
        discountedPrice: ORIGINAL_PRICE,
      });
    }
  },

  clearPromoCode: () => {
    set({
      enteredCode: "",
      appliedPromo: null,
      isValid: null,
      discountedPrice: ORIGINAL_PRICE,
    });
  },

  reset: () => {
    set({
      enteredCode: "",
      appliedPromo: null,
      isValid: null,
      discountedPrice: ORIGINAL_PRICE,
    });
  },
}));
