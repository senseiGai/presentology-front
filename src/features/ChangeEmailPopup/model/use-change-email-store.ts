import { create } from "zustand";

interface ChangeEmailState {
  // UI state
  isOpen: boolean;
  isLoading: boolean;
  step: "email" | "code" | "success"; // Этап: ввод email, ввод кода или успех
  resendTimer: number; // Таймер для повторной отправки (в секундах)
  canResend: boolean; // Можно ли отправить код заново

  // Form data
  oldEmail: string;
  newEmail: string;
  verificationCode: string;

  // Form errors
  newEmailError: boolean;
  newEmailErrorMessage: string;
  codeError: boolean;
  codeErrorMessage: string;

  // Actions
  openPopup: (currentEmail: string) => void;
  closePopup: () => void;
  setLoading: (loading: boolean) => void;
  setStep: (step: "email" | "code" | "success") => void;
  setResendTimer: (timer: number) => void;
  setCanResend: (canResend: boolean) => void;

  // Form setters
  setNewEmail: (email: string) => void;
  setVerificationCode: (code: string) => void;

  // Error setters
  setNewEmailError: (error: boolean, message?: string) => void;
  setCodeError: (error: boolean, message?: string) => void;

  // Validation
  validateNewEmail: () => boolean;
  validateCode: () => boolean;

  // Reset form
  resetForm: () => void;

  // Clear errors
  clearErrors: () => void;

  // Timer management
  startResendTimer: () => void;

  // Actions
  sendCode: () => Promise<boolean>;
  verifyCode: () => Promise<boolean>;
}

// Validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useChangeEmailStore = create<ChangeEmailState>((set, get) => ({
  // Initial state
  isOpen: false,
  isLoading: false,
  step: "email",
  resendTimer: 0,
  canResend: true,
  oldEmail: "",
  newEmail: "",
  verificationCode: "",
  newEmailError: false,
  newEmailErrorMessage: "",
  codeError: false,
  codeErrorMessage: "",

  // UI actions
  openPopup: (currentEmail: string) =>
    set({
      isOpen: true,
      step: "email",
      oldEmail: currentEmail,
      newEmail: "",
      verificationCode: "",
      newEmailError: false,
      newEmailErrorMessage: "",
      codeError: false,
      codeErrorMessage: "",
    }),
  closePopup: () => set({ isOpen: false }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setStep: (step: "email" | "code" | "success") => set({ step }),
  setResendTimer: (timer: number) => set({ resendTimer: timer }),
  setCanResend: (canResend: boolean) => set({ canResend }),

  // Form setters
  setNewEmail: (newEmail: string) => {
    set({ newEmail });
    // Не показываем ошибки в реальном времени
  },

  setVerificationCode: (verificationCode: string) => {
    set({ verificationCode });
    // Очищаем ошибки при вводе
    if (get().codeError && verificationCode.length > 0) {
      set({ codeError: false, codeErrorMessage: "" });
    }
  },

  // Error setters
  setNewEmailError: (error: boolean, message: string = "") =>
    set({
      newEmailError: error,
      newEmailErrorMessage: message,
    }),

  setCodeError: (error: boolean, message: string = "") =>
    set({
      codeError: error,
      codeErrorMessage: message,
    }),

  // Validation
  validateNewEmail: () => {
    const state = get();
    const trimmedEmail = state.newEmail.trim();

    // Проверка на пустое поле
    if (!trimmedEmail) {
      set({
        newEmailError: true,
        newEmailErrorMessage: "Введите новую почту",
      });
      return false;
    }

    // Проверка на одинаковую почту
    if (trimmedEmail === state.oldEmail) {
      set({
        newEmailError: true,
        newEmailErrorMessage: "Новая почта должна отличаться от текущей",
      });
      return false;
    }

    // Проверка формата email
    if (!validateEmail(trimmedEmail)) {
      set({
        newEmailError: true,
        newEmailErrorMessage: "Некорректный формат почты",
      });
      return false;
    }

    // Дополнительные проверки
    if (trimmedEmail.length < 5) {
      set({
        newEmailError: true,
        newEmailErrorMessage: "Слишком короткий адрес почты",
      });
      return false;
    }

    if (trimmedEmail.length > 254) {
      set({
        newEmailError: true,
        newEmailErrorMessage: "Слишком длинный адрес почты",
      });
      return false;
    }

    set({ newEmailError: false, newEmailErrorMessage: "" });
    return true;
  },

  validateCode: () => {
    const state = get();
    const trimmedCode = state.verificationCode.trim();

    if (!trimmedCode) {
      set({
        codeError: true,
        codeErrorMessage: "Введите код подтверждения",
      });
      return false;
    }

    if (trimmedCode.length !== 6) {
      set({
        codeError: true,
        codeErrorMessage: "Код должен содержать 6 цифр",
      });
      return false;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      set({
        codeError: true,
        codeErrorMessage: "Код должен содержать только цифры",
      });
      return false;
    }

    set({ codeError: false, codeErrorMessage: "" });
    return true;
  },

  // Reset form
  resetForm: () => {
    set({
      step: "email",
      newEmail: "",
      verificationCode: "",
      newEmailError: false,
      newEmailErrorMessage: "",
      codeError: false,
      codeErrorMessage: "",
      isLoading: false,
      resendTimer: 0,
      canResend: true,
    });
  },

  // Clear errors manually
  clearErrors: () => {
    set({
      newEmailError: false,
      newEmailErrorMessage: "",
      codeError: false,
      codeErrorMessage: "",
    });
  },

  // Timer management
  startResendTimer: () => {
    set({ canResend: false, resendTimer: 30 });

    const interval = setInterval(() => {
      const currentTimer = get().resendTimer;
      if (currentTimer <= 1) {
        set({ canResend: true, resendTimer: 0 });
        clearInterval(interval);
      } else {
        set({ resendTimer: currentTimer - 1 });
      }
    }, 1000);
  },

  // Send code to new email
  sendCode: async () => {
    const state = get();

    if (!state.validateNewEmail()) {
      return false;
    }

    set({ isLoading: true });

    try {
      // Here you would make API call to send verification code
      // const response = await UserApi.sendEmailVerificationCode({
      //   newEmail: state.newEmail
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({ isLoading: false, step: "code" });
      return true;
    } catch (error) {
      console.error("Error sending code:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Verify code and change email
  verifyCode: async () => {
    const state = get();

    if (!state.validateCode()) {
      return false;
    }

    set({ isLoading: true });

    try {
      // Here you would make API call to verify code and change email
      // const response = await UserApi.verifyEmailChange({
      //   newEmail: state.newEmail,
      //   code: state.verificationCode
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Моковая валидация: правильный код - "123456"
      if (state.verificationCode !== "123456") {
        set({
          isLoading: false,
          codeError: true,
          codeErrorMessage: "Неправильный код",
        });
        return false;
      }

      // Переход к экрану успеха
      set({ isLoading: false, step: "success" });
      return true;
    } catch (error) {
      console.error("Error verifying code:", error);
      set({ isLoading: false });
      return false;
    }
  },
}));
