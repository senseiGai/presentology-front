import { useMutation } from "@tanstack/react-query";
import { getAuthToken } from "@/shared/stores/auth.store";

// Типы для генерации изображений
export interface FluxImageRequest {
  prompt: string;
  count?: number; // 1-4 изображений
  size?: string; // "1792x1024", "1024x1792", "1024x1024"
}

export interface MixedImageRequest {
  model: string; // "auto", "flux", "unsplash"
  count?: number; // количество изображений
  fluxSize?: string; // размер для Flux
  unsplashOrientation?: string; // ориентация для Unsplash
  prompts?: string[]; // массив промптов
}

export interface ImageGenerationResponse {
  success: boolean;
  data?: {
    urls?: string[]; // URLs изображений для Flux
    images?: string[]; // URLs изображений для Mixed
    message?: string;
  };
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

// API функции
const generateFluxImage = async (
  data: FluxImageRequest
): Promise<ImageGenerationResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для генерации изображений");
  }

  const response = await fetch(`${baseUrl}/ai-proxy/images/flux`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate image: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

const generateMixedImage = async (
  data: MixedImageRequest
): Promise<ImageGenerationResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для генерации изображений");
  }

  const response = await fetch(`${baseUrl}/ai-proxy/images/mixed`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate mixed image: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

// React Query хуки
export const useFluxImageGeneration = () => {
  return useMutation({
    mutationFn: generateFluxImage,
    onError: (error) => {
      console.error("Flux image generation error:", error);
    },
  });
};

export const useMixedImageGeneration = () => {
  return useMutation({
    mutationFn: generateMixedImage,
    onError: (error) => {
      console.error("Mixed image generation error:", error);
    },
  });
};

// Утилиты для размеров изображений
export const getImageSizeForStyle = (
  style: "photo" | "blackwhite" | "illustration"
): string => {
  // Возвращаем стандартный размер 1024x1024 для всех стилей
  // Можно настроить разные размеры для разных стилей
  return "1024x1024";
};

// Утилиты для создания промпта
export const enhancePromptForStyle = (
  prompt: string,
  style: "photo" | "blackwhite" | "illustration"
): string => {
  const stylePrompts = {
    photo: "realistic photograph, high quality, professional photography",
    blackwhite:
      "black and white photograph, monochrome, high contrast, artistic",
    illustration:
      "digital illustration, vector art, clean design, modern style",
  };

  return `${prompt}, ${stylePrompts[style]}`;
};
