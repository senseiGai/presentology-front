import { apiClient, API_ENDPOINTS } from "./config";
import type {
  Presentation,
  CreatePresentationRequest,
  UpdatePresentationRequest,
} from "./types";

export class PresentationsApi {
  // Получить все презентации пользователя
  static async getAll(): Promise<Presentation[]> {
    const response = await apiClient.get(API_ENDPOINTS.PRESENTATIONS.LIST);
    return response.data;
  }

  // Получить презентацию по ID
  static async getById(id: string): Promise<Presentation> {
    const response = await apiClient.get(
      API_ENDPOINTS.PRESENTATIONS.GET_BY_ID(id)
    );
    return response.data;
  }

  // Создать новую презентацию
  static async create(data: CreatePresentationRequest): Promise<Presentation> {
    const response = await apiClient.post(
      API_ENDPOINTS.PRESENTATIONS.CREATE,
      data
    );
    return response.data;
  }

  // Обновить презентацию
  static async update(
    id: string,
    data: UpdatePresentationRequest
  ): Promise<Presentation> {
    const response = await apiClient.patch(
      API_ENDPOINTS.PRESENTATIONS.UPDATE(id),
      data
    );
    return response.data;
  }

  // Удалить презентацию
  static async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRESENTATIONS.DELETE(id));
  }

  // Скачать презентацию в формате PPTX
  static async downloadPPTX(id: string): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.PRESENTATIONS.DOWNLOAD_PPTX(id),
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  // Скачать презентацию в формате PPTX с кастомными данными
  static async downloadPPTXWithCustomData(
    id: string,
    customData: any
  ): Promise<Blob> {
    const response = await apiClient.post(
      API_ENDPOINTS.PRESENTATIONS.DOWNLOAD_PPTX_CUSTOM(id),
      customData,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}
