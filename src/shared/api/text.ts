import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores";

// Типы для генерации текста
export interface TextGenerationRequest {
  prompt: string;
}

export interface TextGenerationResponse {
  success: boolean;
  data: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  statusCode: number;
  timestamp: string;
}

// API функции
const generateText = async (
  request: TextGenerationRequest
): Promise<TextGenerationResponse> => {
  const { accessToken } = useAuthStore.getState();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  const response = await fetch(`${baseUrl}/ai-proxy/openai/slides`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate text: ${response.statusText}`);
  }

  return response.json();
};

// React Query хуки
export const useTextGeneration = () => {
  return useMutation({
    mutationFn: generateText,
    onSuccess: (data) => {
      console.log("Text generation successful:", data);
    },
    onError: (error) => {
      console.error("Text generation failed:", error);
    },
  });
};

// Утилиты для работы с стилями
export const getStylePrompt = (styles: string[]): string => {
  const styleMap: Record<string, string> = {
    Научный: "используй научный стиль, академические термины, объективный тон",
    Деловой:
      "используй деловой стиль, четкие формулировки, профессиональную лексику",
    Разговорный: "используй разговорный стиль, простые слова, дружелюбный тон",
    Продающий:
      "используй продающий стиль, убедительные фразы, призывы к действию",
    Эмоциональный:
      "используй эмоциональный стиль, яркие эпитеты, вовлекающие фразы",
    Дружелюбный:
      "используй дружелюбный стиль, теплые обращения, позитивный тон",
    Креативный:
      "используй креативный стиль, нестандартные обороты, оригинальные метафоры",
    "С юмором": "добавь элементы юмора, легкие шутки, игру слов",
  };

  const selectedStyles = styles.map((style) => styleMap[style]).filter(Boolean);
  return selectedStyles.length > 0 ? selectedStyles.join(", ") : "";
};

export const getVolumePrompt = (volume: "more" | "less"): string => {
  return volume === "more"
    ? "сделай текст более подробным, добавь детали и примеры"
    : "сделай текст более кратким, убери лишние детали";
};

export const buildTextPrompt = (
  originalText: string,
  userRequest: string,
  styles: string[] = [],
  volume?: "more" | "less"
): string => {
  let prompt = `Исходный текст: "${originalText}"\n\n`;
  prompt += `Пожелания пользователя: ${userRequest}\n\n`;

  if (styles.length > 0) {
    const stylePrompt = getStylePrompt(styles);
    prompt += `Стиль текста: ${stylePrompt}\n\n`;
  }

  if (volume) {
    const volumePrompt = getVolumePrompt(volume);
    prompt += `Объем текста: ${volumePrompt}\n\n`;
  }

  prompt += "Верни ТОЛЬКО исправленный текст без дополнительных объяснений.";

  return prompt;
};
