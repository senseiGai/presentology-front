import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores";

// Типы для генерации инфографики
export interface InfographicSlide {
  userPrompt: string;
  slideContext: string;
  csv: string;
  orientation?: string;
  format?: string;
  response?: string;
}

export interface GenerateInfographicsRequest {
  deckTitle: string;
  slides: InfographicSlide[];
}

export interface InfographicsResponse {
  success: boolean;
  data: {
    slides: Array<{
      userPrompt: string;
      slideContext: string;
      infographic?: {
        dataUrl?: string;
        spec?: any;
        error?: string;
      };
    }>;
  };
  statusCode: number;
  timestamp: string;
}

export interface RegenerateInfographicsRequest {
  deckTitle: string;
  slideContext: string;
  userPrompt: string;
  csv: string;
  orientation?: string;
  format?: string;
  response?: string;
}

// API функции
const generateInfographics = async (
  request: GenerateInfographicsRequest
): Promise<InfographicsResponse> => {
  const { accessToken } = useAuthStore.getState();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  const response = await fetch(
    `${baseUrl}/ai-proxy/slides/generate-infographics`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to generate infographics: ${response.statusText}`);
  }

  return response.json();
};

const regenerateInfographics = async (
  request: RegenerateInfographicsRequest
): Promise<InfographicsResponse> => {
  const { accessToken } = useAuthStore.getState();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  const queryParams = new URLSearchParams();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `${baseUrl}/ai-proxy/slides/regenerate-infographics?${queryParams}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to regenerate infographics: ${response.statusText}`
    );
  }

  return response.json();
};

// React Query хуки
export const useInfographicsGeneration = () => {
  return useMutation({
    mutationFn: generateInfographics,
    onSuccess: (data) => {
      console.log("Infographics generation successful:", data);
    },
    onError: (error) => {
      console.error("Infographics generation failed:", error);
    },
  });
};

export const useInfographicsRegeneration = () => {
  return useMutation({
    mutationFn: regenerateInfographics,
    onSuccess: (data) => {
      console.log("Infographics regeneration successful:", data);
    },
    onError: (error) => {
      console.error("Infographics regeneration failed:", error);
    },
  });
};

// Утилиты для работы с CSV данными
export const convertTableToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Экранируем значения, содержащие запятые или кавычки
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\\n");
};

export const buildInfographicPrompt = (
  userRequest: string,
  chartType?: string,
  style?: string
): string => {
  let prompt = userRequest;

  if (chartType) {
    const chartTypeMap: Record<string, string> = {
      bar: "столбчатую диаграмму",
      line: "линейный график",
      pie: "круговую диаграмму",
      area: "диаграмму с областями",
      scatter: "точечную диаграмму",
      table: "таблицу",
    };

    const chartDescription = chartTypeMap[chartType] || chartType;
    prompt = `Создай ${chartDescription}. ${prompt}`;
  }

  if (style) {
    const styleMap: Record<string, string> = {
      modern: "Используй современный минималистичный стиль",
      corporate: "Используй корпоративный деловой стиль",
      colorful: "Используй яркие насыщенные цвета",
      minimal: "Используй минималистичный монохромный стиль",
    };

    const styleDescription = styleMap[style];
    if (styleDescription) {
      prompt += `. ${styleDescription}`;
    }
  }

  return prompt;
};
