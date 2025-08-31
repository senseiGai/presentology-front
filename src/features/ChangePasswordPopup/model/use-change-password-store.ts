import { create } from "zustand";
import { AuthApi } from "@/shared/api/auth.api";
import type { ChangePasswordRequest } from "@/shared/api/types";

interface ChangePasswordState {
  // UI state
  isOpen: boolean;
  isLoading: boolean;
  isSuccess: boolean;

  // Form data
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

  // Form errors
  oldPasswordError: boolean;
  oldPasswordErrorMessage: string;
  newPasswordError: boolean;
  newPasswordErrorMessage: string;
  confirmPasswordError: boolean;
  confirmPasswordErrorMessage: string;

  // Actions
  openPopup: () => void;
  closePopup: () => void;
  setLoading: (loading: boolean) => void;
  setSuccess: (success: boolean) => void;

  // Form setters
  setOldPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;

  // Error setters
  setOldPasswordError: (error: boolean, message?: string) => void;
  setNewPasswordError: (error: boolean, message?: string) => void;
  setConfirmPasswordError: (error: boolean, message?: string) => void;

  // Validation
  validateOldPassword: () => boolean;
  validateNewPassword: () => boolean;
  validateConfirmPassword: () => boolean;
  validateForm: () => boolean;

  // Password requirement checks
  hasMinLength: () => boolean;
  hasUpperCase: () => boolean;
  hasDigit: () => boolean;
  hasSpecialChar: () => boolean;

  // Reset form
  resetForm: () => void;

  // Clear errors
  clearErrors: () => void;

  // Actions
  changePassword: () => Promise<boolean>;
}

export const useChangePasswordStore = create<ChangePasswordState>(
  (set, get) => ({
    // Initial state
    isOpen: false,
    isLoading: false,
    isSuccess: false,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    oldPasswordError: false,
    oldPasswordErrorMessage: "",
    newPasswordError: false,
    newPasswordErrorMessage: "",
    confirmPasswordError: false,
    confirmPasswordErrorMessage: "",

    // Actions
    openPopup: () =>
      set({
        isOpen: true,
        isSuccess: false,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        oldPasswordError: false,
        oldPasswordErrorMessage: "",
        newPasswordError: false,
        newPasswordErrorMessage: "",
        confirmPasswordError: false,
        confirmPasswordErrorMessage: "",
      }),
    closePopup: () => set({ isOpen: false }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setSuccess: (success: boolean) => set({ isSuccess: success }),

    // Form setters
    setOldPassword: (oldPassword: string) => {
      set({ oldPassword });
      // Очищаем ошибки при вводе
      if (get().oldPasswordError && oldPassword.length > 0) {
        set({ oldPasswordError: false, oldPasswordErrorMessage: "" });
      }
    },

    setNewPassword: (newPassword: string) => {
      set({ newPassword });
      // Очищаем ошибки при вводе
      if (get().newPasswordError && newPassword.length > 0) {
        set({ newPasswordError: false, newPasswordErrorMessage: "" });
      }
    },

    setConfirmPassword: (confirmPassword: string) => {
      set({ confirmPassword });
      // Очищаем ошибки при вводе
      if (get().confirmPasswordError && confirmPassword.length > 0) {
        set({ confirmPasswordError: false, confirmPasswordErrorMessage: "" });
      }
    },

    // Error setters
    setOldPasswordError: (error: boolean, message: string = "") =>
      set({
        oldPasswordError: error,
        oldPasswordErrorMessage: message,
      }),

    setNewPasswordError: (error: boolean, message: string = "") =>
      set({
        newPasswordError: error,
        newPasswordErrorMessage: message,
      }),

    setConfirmPasswordError: (error: boolean, message: string = "") =>
      set({
        confirmPasswordError: error,
        confirmPasswordErrorMessage: message,
      }),

    // Validation
    validateOldPassword: () => {
      const state = get();
      const trimmedPassword = state.oldPassword.trim();

      if (!trimmedPassword) {
        set({
          oldPasswordError: true,
          oldPasswordErrorMessage: "Введите текущий пароль",
        });
        return false;
      }

      if (trimmedPassword.length < 6) {
        set({
          oldPasswordError: true,
          oldPasswordErrorMessage:
            "Пароль должен содержать не менее 6 символов",
        });
        return false;
      }

      set({ oldPasswordError: false, oldPasswordErrorMessage: "" });
      return true;
    },

    validateNewPassword: () => {
      const state = get();
      const trimmedPassword = state.newPassword.trim();

      if (!trimmedPassword) {
        set({
          newPasswordError: true,
          newPasswordErrorMessage: "Введите новый пароль",
        });
        return false;
      }

      if (trimmedPassword.length < 8) {
        set({
          newPasswordError: true,
          newPasswordErrorMessage:
            "Пароль должен содержать не менее 8 символов",
        });
        return false;
      }

      // Проверка на наличие заглавной буквы
      if (!/[A-Z]/.test(trimmedPassword)) {
        set({
          newPasswordError: true,
          newPasswordErrorMessage:
            "Пароль должен содержать хотя бы одну заглавную букву",
        });
        return false;
      }

      // Проверка на наличие цифры
      if (!/\d/.test(trimmedPassword)) {
        set({
          newPasswordError: true,
          newPasswordErrorMessage: "Пароль должен содержать хотя бы одну цифру",
        });
        return false;
      }

      // Проверка на наличие специального символа
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword)) {
        set({
          newPasswordError: true,
          newPasswordErrorMessage:
            "Пароль должен содержать хотя бы один специальный символ",
        });
        return false;
      }

      set({ newPasswordError: false, newPasswordErrorMessage: "" });
      return true;
    },

    validateConfirmPassword: () => {
      const state = get();
      const trimmedPassword = state.confirmPassword.trim();

      if (!trimmedPassword) {
        set({
          confirmPasswordError: true,
          confirmPasswordErrorMessage: "Подтвердите новый пароль",
        });
        return false;
      }

      if (trimmedPassword !== state.newPassword) {
        set({
          confirmPasswordError: true,
          confirmPasswordErrorMessage: "Пароли не совпадают",
        });
        return false;
      }

      set({ confirmPasswordError: false, confirmPasswordErrorMessage: "" });
      return true;
    },

    validateForm: () => {
      const state = get();
      const isOldPasswordValid = state.validateOldPassword();
      const isNewPasswordValid = state.validateNewPassword();
      const isConfirmPasswordValid = state.validateConfirmPassword();

      return isOldPasswordValid && isNewPasswordValid && isConfirmPasswordValid;
    },

    // Password requirement checks
    hasMinLength: () => {
      const state = get();
      return state.newPassword.length >= 8;
    },

    hasUpperCase: () => {
      const state = get();
      return /[A-Z]/.test(state.newPassword);
    },

    hasDigit: () => {
      const state = get();
      return /\d/.test(state.newPassword);
    },

    hasSpecialChar: () => {
      const state = get();
      return /[!@#$%^&*(),.?":{}|<>]/.test(state.newPassword);
    },

    // Reset form
    resetForm: () => {
      set({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        oldPasswordError: false,
        oldPasswordErrorMessage: "",
        newPasswordError: false,
        newPasswordErrorMessage: "",
        confirmPasswordError: false,
        confirmPasswordErrorMessage: "",
        isLoading: false,
        isSuccess: false,
      });
    },

    // Clear errors manually
    clearErrors: () => {
      set({
        oldPasswordError: false,
        oldPasswordErrorMessage: "",
        newPasswordError: false,
        newPasswordErrorMessage: "",
        confirmPasswordError: false,
        confirmPasswordErrorMessage: "",
      });
    },

    // Change password
    changePassword: async () => {
      const state = get();

      if (!state.validateForm()) {
        return false;
      }

      set({ isLoading: true });

      try {
        const changePasswordData: ChangePasswordRequest = {
          oldPassword: state.oldPassword,
          newPassword: state.newPassword,
        };

        await AuthApi.changePassword(changePasswordData);

        set({ isLoading: false, isSuccess: true });
        return true;
      } catch (error: any) {
        console.error("Error changing password:", error);

        let errorMessage = "Произошла ошибка при изменении пароля";

        if (error?.response?.status === 400) {
          errorMessage =
            error.response.data?.message || "Неверный текущий пароль";
        } else if (error?.response?.status === 401) {
          errorMessage = "Необходимо войти в систему";
        }

        set({
          isLoading: false,
          oldPasswordError: true,
          oldPasswordErrorMessage: errorMessage,
        });
        return false;
      }
    },
  })
);
