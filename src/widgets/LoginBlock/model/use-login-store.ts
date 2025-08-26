import { create } from "zustand";
import { AuthApi } from "@/shared/api/auth.api";
import type { LoginRequest } from "@/shared/api/types";

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
  login: (email: string, password: string) => Promise<boolean>;
  reset: () => void;
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

  login: async (email: string, password: string): Promise<boolean> => {
    set({
      isLoading: true,
      emailError: null,
      passwordError: null,
      unknownError: null,
    });

    try {
      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        set({ isLoading: false, emailError: "Некорректный email" });
        return false;
      }

      // Валидация пароля
      if (!password || password.length < 6) {
        set({
          isLoading: false,
          passwordError: "Пароль должен содержать минимум 6 символов",
        });
        return false;
      }

      const loginData: LoginRequest = { email, password };
      const response = await AuthApi.login(loginData);

      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Сохраняем информацию о пользователе
      localStorage.setItem("user", JSON.stringify(response.user));

      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Что-то пошло не так. Попробуйте позже";

      if (error.response?.status === 401) {
        errorMessage = "Неверный email или пароль";
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
      isLoading: false,
      emailError: null,
      passwordError: null,
      unknownError: null,
    }),
}));
