import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SurveyApi } from "../api/survey.api";
import { QUERY_KEYS } from "../api/types";
import type { SurveyRequest } from "../api/types";
import { toast } from "sonner";

// Hook для получения статуса опроса
export const useSurveyStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SURVEY.STATUS,
    queryFn: () => SurveyApi.getSurveyStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// Hook для отправки опроса
export const useSubmitSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SurveyRequest) => SurveyApi.submitSurvey(data),
    onSuccess: (data) => {
      toast.success(
        `Спасибо за участие в опросе! Вы получили ${data.pointsEarned} баллов.`
      );

      // Обновляем кэш статуса опроса
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SURVEY.STATUS });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Произошла ошибка при отправке опроса";
      toast.error(errorMessage);
      console.error("Survey submission error:", error);
    },
  });
};
