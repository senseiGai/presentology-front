import { useMutation } from "@tanstack/react-query";
import { getAuthToken } from "@/shared/stores/auth.store";

// Типы для поиска изображений
export interface UnsplashSearchRequest {
  query: string;
  count?: number; // количество изображений (1-30)
  orientation?: "landscape" | "portrait" | "squarish"; // ориентация
}

export interface UnsplashSearchResponse {
  success: boolean;
  data?: {
    images?: string[]; // URLs изображений
    message?: string;
  };
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

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
const searchUnsplashImages = async (
  data: UnsplashSearchRequest
): Promise<UnsplashSearchResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для поиска изображений");
  }

  // Используем прямой endpoint для unsplash
  try {
    const directResponse = await fetch(`${baseUrl}/ai-proxy/images/unsplash`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: data.query,
        count: data.count || 6,
        orientation: data.orientation || "landscape",
      }),
    });

    if (directResponse.ok) {
      const directResult = await directResponse.json();
      console.log("Direct Unsplash API Response:", directResult);

      // API возвращает массив URL в поле data.urls
      return {
        success: directResult.success,
        data: {
          images: directResult.data?.urls || directResult.data || [],
          message: directResult.message,
        },
        error: directResult.error,
        statusCode: directResult.statusCode,
        timestamp: directResult.timestamp,
      };
    }
  } catch (directError) {
    console.log("Direct Unsplash endpoint error:", directError);
  }

  // Используем существующий endpoint для mixed изображений с моделью unsplash
  // Попробуем разные форматы запроса
  const mixedRequest = {
    model: "unsplash",
    count: data.count || 6,
    unsplashOrientation: data.orientation || "landscape",
    prompts: [data.query],
  };

  console.log("Sending request to mixed API:", mixedRequest);

  const response = await fetch(`${baseUrl}/ai-proxy/images/mixed`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mixedRequest),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to search images: ${response.status} ${response.statusText}`
    );
  }

  const result: ImageGenerationResponse = await response.json();

  console.log("API Response:", result);

  // Получаем URLs из разных полей ответа
  let imageUrls: string[] = [];
  if (result.data?.images) {
    imageUrls = result.data.images;
  } else if (result.data?.urls) {
    imageUrls = result.data.urls;
  }

  // Фильтруем пустые URL
  const validUrls = imageUrls.filter((url) => url && url.trim() !== "");

  console.log("Valid URLs found:", validUrls);

  // Преобразуем ответ в формат для поиска изображений
  return {
    success: result.success,
    data: {
      images: validUrls,
      message: result.data?.message,
    },
    error: result.error,
    statusCode: result.statusCode,
    timestamp: result.timestamp,
  };
};

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
export const useUnsplashImageSearch = () => {
  return useMutation({
    mutationFn: searchUnsplashImages,
    onError: (error) => {
      console.error("Unsplash image search error:", error);
    },
  });
};

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
