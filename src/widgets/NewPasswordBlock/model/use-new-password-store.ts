import { create } from "zustand";

interface NewPasswordState {
  password: string;
  confirmPassword: string;

  isLoading: boolean;

  passwordError: string | null;
  confirmPasswordError: string | null;

  passwordTouched: boolean;
  confirmPasswordTouched: boolean;

  passwordStatus: boolean[];

  setPassword: (password: string) => void;
  setConfirmPassword: (confirm: string) => void;

  setPasswordTouched: () => void;
  setConfirmPasswordTouched: () => void;

  validateAndSubmit: () => Promise<void>;
  reset: () => void;
  success: boolean;
}

export const useNewPasswordStore = create<NewPasswordState>((set, get) => ({
  success: false,
  password: "",
  confirmPassword: "",

  isLoading: false,

  passwordError: null,
  confirmPasswordError: null,

  passwordTouched: false,
  confirmPasswordTouched: false,

  passwordStatus: [false, false, false, false],

  setPassword: (password) => {
    const { passwordTouched, confirmPassword, confirmPasswordTouched } = get();

    const statusArray = [
      password.length >= 8,
      /[A-ZА-Я]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    ];

    let passwordError = null;
    if (passwordTouched && !statusArray.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    let confirmPasswordError = null;
    if (confirmPasswordTouched && confirmPassword !== password) {
      confirmPasswordError = "Пароли не совпадают";
    }

    set({
      password,
      passwordStatus: statusArray,
      passwordError,
      confirmPasswordError,
    });
  },

  setConfirmPassword: (confirm) => {
    const { confirmPasswordTouched, password } = get();

    let confirmPasswordError = null;
    if (confirmPasswordTouched && confirm !== password) {
      confirmPasswordError = "Пароли не совпадают";
    }

    set({ confirmPassword: confirm, confirmPasswordError });
  },

  setPasswordTouched: () => {
    const { passwordStatus } = get();
    let passwordError = null;

    if (!passwordStatus.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    set({ passwordTouched: true, passwordError });
  },

  setConfirmPasswordTouched: () => {
    const { password, confirmPassword } = get();
    let confirmPasswordError = null;

    if (password !== confirmPassword) {
      confirmPasswordError = "Пароли не совпадают";
    }

    set({ confirmPasswordTouched: true, confirmPasswordError });
  },

  validateAndSubmit: async () => {
    const { password, confirmPassword, passwordStatus } = get();

    let passwordError = null;
    let confirmPasswordError = null;

    if (!passwordStatus.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    if (password !== confirmPassword) {
      confirmPasswordError = "Пароли не совпадают";
    }

    if (passwordError || confirmPasswordError) {
      set({
        passwordError,
        confirmPasswordError,
        passwordTouched: true,
        confirmPasswordTouched: true,
      });
      return;
    }

    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Пароль успешно сохранён");
      set({ success: true }); // ✅ редирект триггер
    } catch (e) {
      set({ passwordError: "Произошла ошибка. Попробуйте позже." });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      password: "",
      confirmPassword: "",
      isLoading: false,
      passwordError: null,
      confirmPasswordError: null,
      passwordTouched: false,
      confirmPasswordTouched: false,
      success: false,
      passwordStatus: [false, false, false, false],
    }),
}));
