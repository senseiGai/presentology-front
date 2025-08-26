import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "../api/auth.api";
import { QUERY_KEYS } from "../api/types";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  AuthResponse,
  User,
} from "../api/types";

// Hook для логина
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthApi.login(data),
    onSuccess: (data: AuthResponse) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

// Hook для регистрации
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthApi.register(data),
    onSuccess: (data: AuthResponse) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("Register error:", error);
    },
  });
};

// Hook для выхода из системы
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthApi.logout(),
    onSuccess: () => {
      // Удаляем токены из localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Очищаем кэш
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });
};

// Hook для получения профиля пользователя
export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: () => AuthApi.getProfile(),
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: false,
  });
};

// Hook для обновления профиля
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => AuthApi.updateProfile(data),
    onSuccess: (data: User) => {
      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });
};

// Hook для социальной авторизации Google
export const useGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => AuthApi.googleAuth(code),
    onSuccess: (data) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("Google auth error:", error);
    },
  });
};

// Hook для социальной авторизации Yandex
export const useYandexAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => AuthApi.yandexAuth(code),
    onSuccess: (data) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("Yandex auth error:", error);
    },
  });
};

// Hook для социальной авторизации VK
export const useVkAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => AuthApi.vkAuth(code),
    onSuccess: (data) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("VK auth error:", error);
    },
  });
};

// Hook для социальной авторизации Telegram
export const useTelegramAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (telegramData: any) => AuthApi.telegramAuth(telegramData),
    onSuccess: (data) => {
      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Обновляем кэш пользователя
      queryClient.setQueryData(QUERY_KEYS.AUTH.USER, data.user);
    },
    onError: (error) => {
      console.error("Telegram auth error:", error);
    },
  });
};
