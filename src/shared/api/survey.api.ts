import { apiClient, API_ENDPOINTS } from "./config";
import type {
  SurveyRequest,
  SurveyResponse,
  SurveyStatusResponse,
} from "./types";

export class SurveyApi {
  // Submit survey response
  static async submitSurvey(data: SurveyRequest): Promise<SurveyResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.SURVEY_SUBMIT,
      data
    );
    return response.data;
  }

  // Check if user has completed survey
  static async getSurveyStatus(): Promise<SurveyStatusResponse> {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.SURVEY_STATUS);
    return response.data;
  }
}
