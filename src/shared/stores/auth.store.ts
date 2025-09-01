"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/shared/api/types";
import { AuthApi } from "@/shared/api/auth.api";

interface AuthStore {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
  updateUser: (userData: Partial<User>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // Actions
      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // Дублируем в localStorage для совместимости
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        // Дублируем в localStorage для совместимости
        if (typeof window !== "undefined") {
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            localStorage.removeItem("user");
          }
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Вызываем API для выхода
          await AuthApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Очищаем все данные
          get().clearAuth();
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          const state = get();
          const token =
            state.accessToken || localStorage.getItem("accessToken");
          const userData = state.user
            ? JSON.stringify(state.user)
            : localStorage.getItem("user");

          if (!token) {
            set({ isLoading: false });
            return;
          }

          // Устанавливаем токен если он есть только в localStorage
          if (!state.accessToken && token) {
            const refreshToken = localStorage.getItem("refreshToken");
            set({
              accessToken: token,
              refreshToken: refreshToken || null,
            });
          }

          if (userData) {
            // Если есть данные пользователя, используем их
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
              get().setUser(user);
              set({
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
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Очищаем localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          get().setUser(updatedUser);
        }
      },
    }),
    {
      name: "auth-storage",
      // Сохраняем все важные данные
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Helper функция для получения токена
export const getAuthToken = (): string | null => {
  const state = useAuthStore.getState();
  return state.accessToken;
};
