import { create } from "zustand";

type LoginState = {
  email: string;
  password: string;
  isLoading: boolean;
  emailError: string | null;
  passwordError: string | null;
  unknownError: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  setEmailError: (error: string | null) => void;
  setPasswordError: (error: string | null) => void;
  setUnknownError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  reset: () => void;
};

const TEST_ACCOUNT = {
  email: "test@example.com",
  password: "password123",
};

export const useLoginStore = create<LoginState>((set) => ({
  email: "",
  password: "",
  isLoading: false,
  emailError: null,
  passwordError: null,
  unknownError: null,

  setEmail: (email) => set({ email, emailError: null }),
  setPassword: (password) => set({ password, passwordError: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setEmailError: (emailError) => set({ emailError }),
  setPasswordError: (passwordError) => set({ passwordError }),
  setUnknownError: (unknownError) => set({ unknownError }),

  login: async (email: string, password: string) => {
    set({
      isLoading: true,
      emailError: null,
      passwordError: null,
      unknownError: null,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        set({ isLoading: false, emailError: "Некорректный email" });
        return;
      }

      if (email !== TEST_ACCOUNT.email) {
        set({
          isLoading: false,
          emailError: "Пользователь с таким email не найден",
        });
        return;
      }

      if (password !== TEST_ACCOUNT.password) {
        set({
          isLoading: false,
          passwordError: "Неверный пароль. Попробуйте еще раз",
        });
        return;
      }

      // Успешный вход
      console.log("Успешный вход:", email);
      set({ isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        unknownError: "Что-то пошло не так. Попробуйте позже",
      });
    }
  },

  reset: () =>
    set({
      email: "",
      password: "",
      isLoading: false,
      emailError: null,
      passwordError: null,
      unknownError: null,
    }),
}));
