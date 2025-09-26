import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/shared/stores/auth.store";

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  htmlContent: string;
  type: "GENERATED" | "IMPROVED" | "BRANDBOOK";
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PresentationsResponse {
  presentations: Presentation[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
    total?: number;
  };
}

// API функции
const fetchPresentations = async (params?: {
  limit?: number;
  cursor?: string;
}): Promise<PresentationsResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.cursor) searchParams.append("cursor", params.cursor);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(`${baseUrl}/presentations/my?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch presentations");
  }

  return response.json();
};

// React Query хуки
export const usePresentations = (params?: {
  limit?: number;
  cursor?: string;
}) => {
  return useQuery({
    queryKey: ["presentations", params],
    queryFn: () => fetchPresentations(params),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

export const useUserPresentations = () => {
  return usePresentations({ limit: 50 }); // Загружаем до 50 презентаций пользователя
};

// Функция для создания презентации с данными
export const createPresentationWithData = async (data: {
  title: string;
  description?: string;
  slug: string;
  generatedData: any;
  presentationState: any;
  templateIds?: string[];
  isPublic?: boolean;
}): Promise<Presentation> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(`${baseUrl}/presentations/create-with-data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create presentation");
  }

  return response.json();
};

// React Query хук для создания презентации с данными
export const useCreatePresentationWithData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPresentationWithData,
    onSuccess: () => {
      // Инвалидируем кэш презентаций после создания новой
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
  });
};
