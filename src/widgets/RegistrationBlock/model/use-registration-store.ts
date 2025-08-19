import { create } from "zustand";

interface RegisterState {
  email: string;
  password: string;
  confirmPassword: string;

  isLoading: boolean;

  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;

  emailTouched: boolean;
  passwordTouched: boolean;
  confirmPasswordTouched: boolean;

  passwordStatus: boolean[];

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirm: string) => void;

  setEmailTouched: () => void;
  setPasswordTouched: () => void;
  setConfirmPasswordTouched: () => void;

  validateAndSubmit: () => Promise<void>;
  reset: () => void;
}

const TEST_ACCOUNTS = ["example@provider.com", "admin@test.ru"];

export const useRegisterStore = create<RegisterState>((set, get) => ({
  email: "",
  password: "",
  confirmPassword: "",

  isLoading: false,

  emailError: null,
  passwordError: null,
  confirmPasswordError: null,

  emailTouched: false,
  passwordTouched: false,
  confirmPasswordTouched: false,

  passwordStatus: [false, false, false, false],

  setEmail: (email) => {
    const { emailTouched } = get();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let emailError = null;
    if (emailTouched) {
      if (!emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      } else if (TEST_ACCOUNTS.includes(email)) {
        emailError = "Пользователь с такой почтой уже существует";
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

  setEmailTouched: () => {
    const { email } = get();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let emailError = null;

    if (email.trim() !== "") {
      if (!emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      } else if (TEST_ACCOUNTS.includes(email)) {
        emailError = "Пользователь с такой почтой уже существует";
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

  validateAndSubmit: async () => {
    const { email, password, confirmPassword, passwordStatus } = get();

    let emailError = null;
    let passwordError = null;
    let confirmPasswordError = null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError = "Некорректный формат почты";
    } else if (TEST_ACCOUNTS.includes(email)) {
      emailError = "Пользователь с такой почтой уже существует";
    }

    if (!passwordStatus.every(Boolean)) {
      passwordError = "Пароль не соответствует требованиям";
    }

    if (password !== confirmPassword) {
      confirmPasswordError = "Пароли не совпадают";
    }

    if (emailError || passwordError || confirmPasswordError) {
      set({
        emailError,
        passwordError,
        confirmPasswordError,
        emailTouched: true,
        passwordTouched: true,
        confirmPasswordTouched: true,
      });
      return;
    }

    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Успешная регистрация:", email);
    } catch (e) {
      set({ emailError: "Произошла неизвестная ошибка. Попробуйте позже." });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      email: "",
      password: "",
      confirmPassword: "",
      isLoading: false,
      emailError: null,
      passwordError: null,
      confirmPasswordError: null,
      emailTouched: false,
      passwordTouched: false,
      confirmPasswordTouched: false,
      passwordStatus: [false, false, false, false],
    }),
}));
