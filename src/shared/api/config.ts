"use client";
import axios from "axios";
import { useAuthStore } from "@/shared/stores/auth-store";

export const API_BASE_URL =
  "https://presentology-back-production.up.railway.app/";

// Создаем экземпляр axios с базовой конфигурацией
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для добавления токена в каждый запрос
apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из Zustand store
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов и обновления токенов
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Обновляем токены в Zustand store
          authStore.setTokens(access_token, refresh_token || "");

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Очищаем store при ошибке обновления токена
          authStore.logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // Нет refresh токена - разлогиниваем
        authStore.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    GOOGLE: "/auth/google",
    VK: "/auth/vk",
    YANDEX: "/auth/yandex",
    TELEGRAM: "/auth/telegram",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    SURVEY_SUBMIT: "/auth/survey",
    SURVEY_STATUS: "/auth/survey/status",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    SEND_EMAIL_VERIFICATION: "/users/send-email-verification",
    VERIFY_EMAIL_CHANGE: "/users/verify-email-change",
    UPLOAD_AVATAR: "/users/avatar",
    DELETE_AVATAR: "/users/avatar",
  },
  PRESENTATIONS: {
    LIST: "/presentations",
    CREATE: "/presentations",
    GET_BY_ID: (id: string) => `/presentations/${id}`,
    UPDATE: (id: string) => `/presentations/${id}`,
    DELETE: (id: string) => `/presentations/${id}`,
  },
} as const;
