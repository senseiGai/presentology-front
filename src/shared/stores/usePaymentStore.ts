"use client";

import { create } from "zustand";

interface PaymentState {
  // UI state
  sendEmail: boolean;
  showCardForm: boolean;
  paymentSuccess: boolean;

  // Card form data
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;

  // Validation states
  emailError: boolean;
  cardNumberError: boolean;
  expiryDateError: boolean;
  cvvError: boolean;
  cardholderNameError: boolean;
  isSubmitted: boolean;

  // Actions
  setSendEmail: (value: boolean) => void;
  setShowCardForm: (value: boolean) => void;
  setPaymentSuccess: (value: boolean) => void;
  setCardNumber: (value: string) => void;
  setExpiryDate: (value: string) => void;
  setCvv: (value: string) => void;
  setCardholderName: (value: string) => void;
  setEmail: (value: string) => void;

  // Validation actions
  setEmailError: (error: boolean) => void;
  setCardNumberError: (error: boolean) => void;
  setExpiryDateError: (error: boolean) => void;
  setCvvError: (error: boolean) => void;
  setCardholderNameError: (error: boolean) => void;
  setIsSubmitted: (submitted: boolean) => void;

  // Formatted setters
  setFormattedCardNumber: (value: string) => void;
  setFormattedExpiryDate: (value: string) => void;
  setFormattedCvv: (value: string) => void;

  // Validation methods
  validateEmail: (email: string) => boolean;
  validateCardForm: () => boolean;

  // Reset form
  resetCardForm: () => void;
}

// Utility functions
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(" ");
  } else {
    return v;
  }
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4);
  }
  return v;
};

const formatCvv = (value: string) => {
  return value.replace(/[^0-9]/gi, "");
};

// Validation functions
const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  return cleanNumber.length >= 13 && cleanNumber.length <= 19;
};

const validateExpiryDate = (expiryDate: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;

  const [month, year] = expiryDate.split("/");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expYear = parseInt(year);
  const expMonth = parseInt(month);

  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
};

const validateCvv = (cvv: string): boolean => {
  return cvv.length === 3;
};

const validateCardholderName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // Initial state
  sendEmail: false,
  showCardForm: false,
  paymentSuccess: false,
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
  email: "",

  // Validation states
  emailError: false,
  cardNumberError: false,
  expiryDateError: false,
  cvvError: false,
  cardholderNameError: false,
  isSubmitted: false,

  // Basic setters
  setSendEmail: (value: boolean) => set({ sendEmail: value }),
  setShowCardForm: (value: boolean) => set({ showCardForm: value }),
  setPaymentSuccess: (value: boolean) => set({ paymentSuccess: value }),
  setCardNumber: (value: string) => set({ cardNumber: value }),
  setExpiryDate: (value: string) => set({ expiryDate: value }),
  setCvv: (value: string) => set({ cvv: value }),
  setCardholderName: (value: string) => {
    set({ cardholderName: value });
    const state = get();
    if (state.isSubmitted) {
      set({ cardholderNameError: !validateCardholderName(value) });
    }
  },
  setEmail: (value: string) => {
    set({ email: value });
    // Validate email on change if user has interacted with it
    if (value.length > 0) {
      const isValid = validateEmailFormat(value);
      set({ emailError: !isValid });
    } else {
      set({ emailError: false });
    }
  },

  // Validation setters
  setEmailError: (error: boolean) => set({ emailError: error }),
  setCardNumberError: (error: boolean) => set({ cardNumberError: error }),
  setExpiryDateError: (error: boolean) => set({ expiryDateError: error }),
  setCvvError: (error: boolean) => set({ cvvError: error }),
  setCardholderNameError: (error: boolean) =>
    set({ cardholderNameError: error }),
  setIsSubmitted: (submitted: boolean) => set({ isSubmitted: submitted }),

  // Formatted setters
  setFormattedCardNumber: (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.length <= 19) {
      set({ cardNumber: formatted });
      const state = get();
      if (state.isSubmitted) {
        set({ cardNumberError: !validateCardNumber(formatted) });
      }
    }
  },

  setFormattedExpiryDate: (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      set({ expiryDate: formatted });
      const state = get();
      if (state.isSubmitted) {
        set({ expiryDateError: !validateExpiryDate(formatted) });
      }
    }
  },

  setFormattedCvv: (value: string) => {
    const formatted = formatCvv(value);
    if (formatted.length <= 3) {
      set({ cvv: formatted });
      const state = get();
      if (state.isSubmitted) {
        set({ cvvError: !validateCvv(formatted) });
      }
    }
  },

  // Validation methods
  validateEmail: (email: string) => {
    const isValid = validateEmailFormat(email);
    set({ emailError: !isValid });
    return isValid;
  },

  validateCardForm: () => {
    const state = get();
    const cardNumberValid = validateCardNumber(state.cardNumber);
    const expiryDateValid = validateExpiryDate(state.expiryDate);
    const cvvValid = validateCvv(state.cvv);
    const cardholderNameValid = validateCardholderName(state.cardholderName);

    set({
      cardNumberError: !cardNumberValid,
      expiryDateError: !expiryDateValid,
      cvvError: !cvvValid,
      cardholderNameError: !cardholderNameValid,
      isSubmitted: true,
    });

    return (
      cardNumberValid && expiryDateValid && cvvValid && cardholderNameValid
    );
  },

  // Reset form
  resetCardForm: () =>
    set({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      showCardForm: false,
      paymentSuccess: false,
      cardNumberError: false,
      expiryDateError: false,
      cvvError: false,
      cardholderNameError: false,
      isSubmitted: false,
    }),
}));
