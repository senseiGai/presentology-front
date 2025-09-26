import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

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

  const endpoint = searchParams.toString()
    ? `/presentations/my?${searchParams.toString()}`
    : "/presentations/my";

  try {
    const response = await apiClient.get<PresentationsResponse>(endpoint);
    return response;
  } catch (error) {
    throw new Error("Failed to fetch presentations");
  }
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
  try {
    const response = await apiClient.post<Presentation>(
      "/presentations/create-with-data",
      data
    );
    return response;
  } catch (error) {
    throw new Error("Failed to create presentation");
  }
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

// Функция для удаления презентации
export const deletePresentation = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `/presentations/${id}`
    );
    return response;
  } catch (error) {
    throw new Error("Failed to delete presentation");
  }
};

// React Query хук для удаления презентации
export const useDeletePresentation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePresentation,
    onSuccess: () => {
      // Инвалидируем кэш презентаций после удаления
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      // Также инвалидируем все связанные с презентациями запросы
      queryClient.invalidateQueries({ queryKey: ["presentations", "list"] });
    },
  });
};
