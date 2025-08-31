"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { AuthApi } from "@/shared/api/auth.api";
import { SurveyApi } from "@/shared/api/survey.api";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const provider = searchParams.get("state") || "google"; // По умолчанию google
      const error = searchParams.get("error");

      if (error) {
        toast.error("Ошибка авторизации");
        router.push("/login");
        return;
      }

      if (!code) {
        router.push("/login");
        return;
      }

      try {
        let response;

        switch (provider) {
          case "google":
            response = await AuthApi.googleAuth(code);
            break;
          case "yandex":
            response = await AuthApi.yandexAuth(code);
            break;
          case "vk":
            response = await AuthApi.vkAuth(code);
            break;
          default:
            throw new Error("Неизвестный провайдер");
        }

        // Сохраняем токены
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Обновляем глобальный стейт
        setUser(response.user);

        toast.success("Успешная авторизация!");

        // Для новых пользователей всегда показываем опрос
        if (response.isNewUser) {
          router.push("/survey");
        } else {
          // Для существующих пользователей проверяем статус опроса
          try {
            const surveyStatus = await SurveyApi.getSurveyStatus();

            if (surveyStatus.hasCompletedSurvey) {
              router.push("/home");
            } else {
              router.push("/survey");
            }
          } catch (error) {
            console.error("Error checking survey status:", error);
            // В случае ошибки проверки опроса идем на главную для существующих пользователей
            router.push("/home");
          }
        }
      } catch (error: any) {
        console.error("Social auth error:", error);
        toast.error("Ошибка при авторизации через социальную сеть");
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Обработка авторизации...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Загрузка...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
