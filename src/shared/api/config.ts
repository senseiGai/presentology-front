"use client";
import axios from "axios";
import { useAuthStore, forceLogout } from "@/shared/stores";

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
    // Middleware для удаления двойных слэшей из URL
    if (config.url) {
      // Заменяем все двойные слэши на одинарные, кроме протокола (http:// или https://)
      config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
    }

    // Аналогично для baseURL, если он есть
    if (config.baseURL) {
      config.baseURL = config.baseURL.replace(/([^:]\/)\/+/g, "$1");
    }

    // Получаем токен из Zustand store
    const token = useAuthStore.getState().accessToken;
    console.log(
      "🔐 [API Request] Token from store:",
      token ? "Token exists" : "No token"
    );
    console.log("🔗 [API Request] Original URL:", config.url);

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

    // Если ошибка 401 (токен устарел)
    if (error.response?.status === 401) {
      console.log("🔄 [API Response] 401 error detected - token expired");

      // Если это не первая попытка refresh
      if (originalRequest._retry) {
        console.log(
          "❌ [API Response] Token refresh already failed, logging out"
        );
        forceLogout("Token refresh retry failed");
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (refreshToken) {
        try {
          console.log("🔄 [API Response] Attempting token refresh...");
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Обновляем токены в Zustand store
          authStore.setTokens(access_token, refresh_token || refreshToken);
          console.log("✅ [API Response] Token refreshed successfully");

          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error(
            "❌ [API Response] Token refresh failed:",
            refreshError
          );

          // Используем централизованную функцию logout
          forceLogout("Token refresh failed");
          return Promise.reject(refreshError);
        }
      } else {
        console.log(
          "❌ [API Response] No refresh token available, logging out"
        );

        // Используем централизованную функцию logout
        forceLogout("No refresh token available");
        return Promise.reject(error);
      }
    }

    // Если ошибка 403 (токен недействителен)
    if (error.response?.status === 403) {
      console.log("❌ [API Response] 403 error - token invalid, logging out");
      forceLogout("Token invalid (403)");
      return Promise.reject(error);
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
  AI_PROXY: {
    STRUCTURE: {
      ADD_SLIDE: "/ai-proxy/v1/create/structure/add-slide",
      GENERATE_SLIDES: "/ai-proxy/v1/create/structure/generate-slides",
      PREVIEW: "/ai-proxy/create/structure/preview",
      SELECT: "/ai-proxy/create/structure/select",
    },
    CREATE: {
      TITLE_AND_SLIDES: "/ai-proxy/create/title-and-slides",
    },
    IMAGES: {
      UNSPLASH: "/ai-proxy/images/unsplash",
      FLUX: "/ai-proxy/images/flux",
      MIXED: "/ai-proxy/images/mixed",
    },
    TEXT: {
      GENERATE: "/ai-proxy/text/generate",
      CORRECT: "/ai-proxy/text/correct",
    },
    INFOGRAPHICS: {
      GENERATE: "/ai-proxy/infographics/generate",
    },
  },
} as const;
