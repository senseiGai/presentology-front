import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores";

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
  files: ExtractedFile[];
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
  files: ExtractedFile[];
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

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json();
};

// API функция для извлечения текста из файлов
const extractTextFromFiles = async (
  files: File[]
): Promise<ExtractFilesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${baseUrl}/api/files/extract`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Добавьте хотя бы один файл");
    }
    throw new Error("Не удалось обработать файлы");
  }

  return response.json();
};

// API функция для создания брифа
const generateBrief = async (request: BriefRequest): Promise<BriefResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${baseUrl}/api/openai/brief`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать бриф");
  }

  return response.json();
};

// API функция для анализа структуры
const analyzeStructure = async (
  request: AnalyzeStructureRequest
): Promise<AnalyzeStructureResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${baseUrl}/api/openai/analyze-structure`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Не удалось проанализировать структуру");
  }

  return response.json();
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
