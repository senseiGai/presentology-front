import { create } from "zustand";
import { AuthApi } from "@/shared/api/auth.api";
import type { RegisterRequest } from "@/shared/api/types";

interface RegisterState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;

  isLoading: boolean;

  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  unknownError: string | null;

  emailTouched: boolean;
  passwordTouched: boolean;
  confirmPasswordTouched: boolean;
  firstNameTouched: boolean;
  lastNameTouched: boolean;

  passwordStatus: boolean[];

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirm: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;

  setEmailTouched: () => void;
  setPasswordTouched: () => void;
  setConfirmPasswordTouched: () => void;
  setFirstNameTouched: () => void;
  setLastNameTouched: () => void;

  validateAndSubmit: () => Promise<boolean>;
  reset: () => void;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",

  isLoading: false,

  emailError: null,
  passwordError: null,
  confirmPasswordError: null,
  firstNameError: null,
  lastNameError: null,
  unknownError: null,

  emailTouched: false,
  passwordTouched: false,
  confirmPasswordTouched: false,
  firstNameTouched: false,
  lastNameTouched: false,

  passwordStatus: [false, false, false, false],

  setEmail: (email) => {
    const { emailTouched } = get();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let emailError = null;
    if (emailTouched) {
      if (!emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      }
    }

    set({ email, emailError });
  },

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

  setFirstName: (firstName) => {
    const { firstNameTouched } = get();

    let firstNameError = null;
    if (firstNameTouched && firstName.trim().length < 2) {
      firstNameError = "Имя должно содержать минимум 2 символа";
    }

    set({ firstName, firstNameError });
  },

  setLastName: (lastName) => {
    set({ lastName });
  },

  setEmailTouched: () => {
    const { email } = get();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let emailError = null;

    if (email.trim() !== "") {
      if (!emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      }
    }

    set({ emailTouched: true, emailError });
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

  setFirstNameTouched: () => {
    const { firstName } = get();
    let firstNameError = null;

    if (firstName.trim().length < 2) {
      firstNameError = "Имя должно содержать минимум 2 символа";
    }

    set({ firstNameTouched: true, firstNameError });
  },

  setLastNameTouched: () => {
    set({ lastNameTouched: true });
  },

  validateAndSubmit: async (): Promise<boolean> => {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      passwordStatus,
    } = get();

    let emailError = null;
    let passwordError = null;
    let confirmPasswordError = null;
    let firstNameError = null;

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError = "Некорректный формат почты";
    }

    // Валидация пароля
    if (!passwordStatus.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    // Валидация подтверждения пароля
    if (password !== confirmPassword) {
      confirmPasswordError = "Пароли не совпадают";
    }

    // Валидация имени
    if (firstName.trim().length < 2) {
      firstNameError = "Имя должно содержать минимум 2 символа";
    }

    if (emailError || passwordError || confirmPasswordError || firstNameError) {
      set({
        emailError,
        passwordError,
        confirmPasswordError,
        firstNameError,
        emailTouched: true,
        passwordTouched: true,
        confirmPasswordTouched: true,
        firstNameTouched: true,
      });
      return false;
    }

    set({ isLoading: true, unknownError: null });

    try {
      const registerData: RegisterRequest = {
        email,
        password,
        firstName,
        lastName: lastName || undefined,
      };

      const response = await AuthApi.register(registerData);

      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Сохраняем информацию о пользователе
      localStorage.setItem("user", JSON.stringify(response.user));

      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "Произошла неизвестная ошибка. Попробуйте позже.";

      if (error.response?.status === 409) {
        errorMessage = "Пользователь с такой почтой уже существует";
        set({ emailError: errorMessage });
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Некорректные данные";
      } else if (error.response?.status === 429) {
        errorMessage = "Слишком много попыток. Попробуйте позже";
      }

      set({
        isLoading: false,
        unknownError: errorMessage,
      });
      return false;
    }
  },

  reset: () =>
    set({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      isLoading: false,
      emailError: null,
      passwordError: null,
      confirmPasswordError: null,
      firstNameError: null,
      lastNameError: null,
      unknownError: null,
      emailTouched: false,
      passwordTouched: false,
      confirmPasswordTouched: false,
      firstNameTouched: false,
      lastNameTouched: false,
      passwordStatus: [false, false, false, false],
    }),
}));
