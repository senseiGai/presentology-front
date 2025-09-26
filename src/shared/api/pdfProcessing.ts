import { apiClient } from "./client";
import { useMutation } from "@tanstack/react-query";

export interface PdfExtractAndBriefResponse {
  success: boolean;
  data: {
    extractedTexts: string[];
    brief: {
      topic: string;
      goal: string;
      audience: string;
      keyIdea: string;
      expectedAction: string;
    };
    filesProcessed: number;
  };
}

// API функция для извлечения текста из PDF и генерации брифа
export const extractPdfAndGenerateBrief = async (
  files: File[]
): Promise<PdfExtractAndBriefResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await apiClient.postFormData<PdfExtractAndBriefResponse>(
      "/pdf/extract-and-brief",
      formData
    );

    return response;
  } catch (error) {
    console.error("Error extracting PDF and generating brief:", error);
    throw new Error("Не удалось обработать PDF файлы и создать бриф");
  }
};

// React Query хук
export const useExtractPdfAndGenerateBrief = () => {
  return useMutation({
    mutationFn: extractPdfAndGenerateBrief,
    onError: (error: Error) => {
      console.error("PDF extraction and brief generation error:", error);
    },
  });
};
