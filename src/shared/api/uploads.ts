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

// React Query хуки
export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};
