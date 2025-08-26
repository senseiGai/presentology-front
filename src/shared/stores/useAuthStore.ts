import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/shared/api/types";
import { AuthApi } from "@/shared/api/auth.api";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Вызываем API для выхода
          await AuthApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Очищаем локальные данные в любом случае
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          const token = localStorage.getItem("accessToken");
          const userData = localStorage.getItem("user");

          if (!token) {
            set({ isLoading: false });
            return;
          }

          if (userData) {
            // Если есть данные пользователя в localStorage, используем их
            const user = JSON.parse(userData);
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Если нет данных пользователя, получаем их с сервера
            try {
              const user = await AuthApi.getProfile();
              localStorage.setItem("user", JSON.stringify(user));
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (error) {
              console.error("Failed to get user profile:", error);
              // Если токен недействителен, очищаем auth данные
              get().clearAuth();
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          get().clearAuth();
        }
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
