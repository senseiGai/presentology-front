import { create } from "zustand";
import { AuthApi } from "@/shared/api/auth.api";

interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  passwordError: string | null;
  confirmPasswordError: string | null;
  successMessage: string | null;
  errorMessage: string | null;
  isLoading: boolean;
  passwordStatus: boolean[];

  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>;
  reset: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set, get) => ({
  password: "",
  confirmPassword: "",
  passwordError: null,
  confirmPasswordError: null,
  successMessage: null,
  errorMessage: null,
  isLoading: false,
  passwordStatus: [false, false, false, false],

  setPassword: (password) => {
    const { confirmPassword } = get();

    const statusArray = [
      password.length >= 8,
      /[A-ZА-Я]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    ];

    let passwordError = null;
    if (password && !statusArray.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    let confirmPasswordError = null;
    if (confirmPassword && confirmPassword !== password) {
      confirmPasswordError = "Пароли не совпадают";
    }

    set({
      password,
      passwordStatus: statusArray,
      passwordError,
      confirmPasswordError,
      errorMessage: null,
    });
  },

  setConfirmPassword: (confirmPassword) => {
    const { password } = get();

    let confirmPasswordError = null;
    if (confirmPassword !== password) {
      confirmPasswordError = "Пароли не совпадают";
    }

    set({
      confirmPassword,
      confirmPasswordError,
      errorMessage: null,
    });
  },

  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> => {
    const { passwordStatus } = get();

    // Валидация
    if (!passwordStatus.every(Boolean)) {
      set({ passwordError: "Пароль не соответствует требованиям" });
      return false;
    }

    if (password !== confirmPassword) {
      set({ confirmPasswordError: "Пароли не совпадают" });
      return false;
    }

    set({
      isLoading: true,
      errorMessage: null,
      passwordError: null,
      confirmPasswordError: null,
    });

    try {
      await AuthApi.resetPassword({ token, newPassword: password });

      set({
        isLoading: false,
        successMessage: "Пароль успешно изменен!",
      });

      return true;
    } catch (error: any) {
      console.error("Reset password error:", error);

      let errorMessage = "Произошла ошибка при изменении пароля";

      if (error.response?.status === 400) {
        errorMessage = "Недействительная или истёкшая ссылка";
      } else if (error.response?.status === 404) {
        errorMessage = "Токен не найден";
      } else if (error.response?.status === 429) {
        errorMessage = "Слишком много попыток. Попробуйте позже";
      }

      set({
        isLoading: false,
        errorMessage,
      });

      return false;
    }
  },

  reset: () =>
    set({
      password: "",
      confirmPassword: "",
      passwordError: null,
      confirmPasswordError: null,
      successMessage: null,
      errorMessage: null,
      isLoading: false,
      passwordStatus: [false, false, false, false],
    }),
}));
