import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
  };
  statusCode: number;
  timestamp: string;
}

export interface ExtractedFile {
  name: string;
  type: string;
  size: number;
  text: string;
}

export interface ExtractFilesResponse {
  success: boolean;
  data: {
    files: ExtractedFile[];
  };
}

export interface BriefRequest {
  texts: string[];
}

export interface BriefResponse {
  success: boolean;
  data: {
    topic: string;
    goal: string;
    audience: string;
    keyIdea: string;
    expectedAction: string;
  };
}

export interface AnalyzeStructureRequest {
  texts: string[];
}

export interface AnalyzeStructureResponse {
  success: boolean;
  data: {
    hasStructure: boolean;
    slideCount: number;
    slides: Array<{
      title: string;
      summary: string;
    }>;
  };
}

// API функции для загрузки файлов
const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.postFormData<UploadResponse>("/uploads/image", formData);
};

// API функция для извлечения текста из файлов
const extractTextFromFiles = async (
  files: File[]
): Promise<ExtractFilesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    return await apiClient.postFormData<ExtractFilesResponse>(
      "/ai-proxy/files/extract",
      formData
    );
  } catch (error: any) {
    if (error.message.includes("400") || error.message.includes("файл")) {
      throw new Error("Добавьте хотя бы один файл");
    }
    throw new Error("Не удалось обработать файлы");
  }
};

// API функция для создания брифа
const generateBrief = async (request: BriefRequest): Promise<BriefResponse> => {
  try {
    return await apiClient.post<BriefResponse>(
      "/ai-proxy/openai/brief",
      request
    );
  } catch (error) {
    throw new Error("Не удалось создать бриф");
  }
};

// API функция для анализа структуры
const analyzeStructure = async (
  request: AnalyzeStructureRequest
): Promise<AnalyzeStructureResponse> => {
  try {
    return await apiClient.post<AnalyzeStructureResponse>(
      "ai-proxy/openai/analyze-structure",
      request
    );
  } catch (error) {
    throw new Error("Не удалось проанализировать структуру");
  }
};

// React Query хуки
export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};

export const useExtractFiles = () => {
  return useMutation({
    mutationFn: extractTextFromFiles,
  });
};

export const useGenerateBrief = () => {
  return useMutation({
    mutationFn: generateBrief,
  });
};

export const useAnalyzeStructure = () => {
  return useMutation({
    mutationFn: analyzeStructure,
  });
};
