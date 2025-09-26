import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PresentationsApi } from "../api/presentations.api";
import { QUERY_KEYS } from "../api/types";
import type {
  CreatePresentationRequest,
  UpdatePresentationRequest,
  Presentation,
} from "../api/types";

// Hook для получения всех презентаций
export const usePresentations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PRESENTATIONS.LIST,
    queryFn: () => PresentationsApi.getAll(),
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Hook для получения презентации по ID
export const usePresentation = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRESENTATIONS.DETAIL(id),
    queryFn: () => PresentationsApi.getById(id),
    enabled: !!id && !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Hook для создания презентации
export const useCreatePresentation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePresentationRequest) =>
      PresentationsApi.create(data),
    onSuccess: (newPresentation: Presentation) => {
      // Обновляем список презентаций
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.LIST,
        (old: Presentation[] | undefined) => {
          if (!old) return [newPresentation];
          return [...old, newPresentation];
        }
      );

      // Добавляем в кэш детальную информацию о презентации
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.DETAIL(newPresentation.id),
        newPresentation
      );
    },
    onError: (error) => {
      console.error("Create presentation error:", error);
    },
  });
};

// Hook для создания презентации с данными
export const useCreatePresentationWithData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      slug: string;
      generatedData: any;
      presentationState: any;
      templateIds?: string[];
      isPublic?: boolean;
    }) => PresentationsApi.createWithData(data),
    onSuccess: (newPresentation: Presentation) => {
      // Обновляем список презентаций
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.LIST,
        (old: Presentation[] | undefined) => {
          if (!old) return [newPresentation];
          return [newPresentation, ...old];
        }
      );

      // Добавляем в кэш детальную информацию о презентации
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.DETAIL(newPresentation.id),
        newPresentation
      );

      // Инвалидируем кэш презентаций для обновления
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRESENTATIONS.LIST,
      });
    },
    onError: (error) => {
      console.error("Create presentation with data error:", error);
    },
  });
};

// Hook для обновления презентации
export const useUpdatePresentation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePresentationRequest;
    }) => PresentationsApi.update(id, data),
    onSuccess: (updatedPresentation: Presentation) => {
      // Обновляем список презентаций
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.LIST,
        (old: Presentation[] | undefined) => {
          if (!old) return [updatedPresentation];
          return old.map((p) =>
            p.id === updatedPresentation.id ? updatedPresentation : p
          );
        }
      );

      // Обновляем кэш детальной информации о презентации
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.DETAIL(updatedPresentation.id),
        updatedPresentation
      );
    },
    onError: (error) => {
      console.error("Update presentation error:", error);
    },
  });
};

// Hook для удаления презентации
export const useDeletePresentation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PresentationsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем из списка презентаций
      queryClient.setQueryData(
        QUERY_KEYS.PRESENTATIONS.LIST,
        (old: Presentation[] | undefined) => {
          if (!old) return [];
          return old.filter((p) => p.id !== deletedId);
        }
      );

      // Удаляем из кэша детальную информацию о презентации
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.PRESENTATIONS.DETAIL(deletedId),
      });
    },
    onError: (error) => {
      console.error("Delete presentation error:", error);
    },
  });
};
