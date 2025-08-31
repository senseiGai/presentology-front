"use client";
import axios from "axios";
import { useAuthStore } from "@/shared/stores/auth-store";

export const API_BASE_URL =
  "https://presentology-back-production.up.railway.app/";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из Zustand store
    const token = useAuthStore.getState().accessToken;
    console.log(
      "🔐 [API Request] Token from store:",
      token ? "Token exists" : "No token"
    );
    console.log("🔗 [API Request] URL:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ [API Request] Bearer token added to headers");
    } else {
      console.log("❌ [API Request] No token found in store");
    }

    console.log("📤 [API Request] Final headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ [API Request] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "✅ [API Response] Success:",
      response.status,
      response.config.url
    );
    return response;
  },
  async (error) => {
    console.error("❌ [API Response] Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 [API Response] 401 error, attempting token refresh...");
      originalRequest._retry = true;

      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (refreshToken) {
        try {
          console.log("🔄 [API Response] Refreshing token...");
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Обновляем токены в Zustand store
          authStore.setTokens(access_token, refresh_token || "");
          console.log("✅ [API Response] Token refreshed successfully");

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error(
            "❌ [API Response] Token refresh failed:",
            refreshError
          );
          // Очищаем store при ошибке обновления токена
          authStore.logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        console.log("❌ [API Response] No refresh token, logging out");
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
