import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/shared/stores/auth.store";

// Типы для создания структуры презентации
export interface UserData {
  topic: string;
  goal: string;
  audience: string;
  context?: string;
  materials?: string[];
}

export interface BriefData {
  topic: string;
  goal: string;
  audience: string;
  context?: string;
  materials?: string[];
}

export interface SlideStructure {
  title: string;
  summary: string;
  id?: string;
}

export interface UISlide {
  title: string;
  summary: string;
  template?: string;
}

// Запросы для добавления слайда
export interface AddSlideRequest {
  newSlidePrompt: string;
  brief: BriefData;
  currentSlides?: SlideStructure[];
  structureText?: string;
}

export interface AddSlideResponse {
  success: boolean;
  data?: {
    title: string;
    summary: string;
  };
  error?: string;
}

// Запросы для генерации слайдов
export interface GenerateSlidesRequest {
  deckTitle: string;
  uiSlides: UISlide[];
  brief?: BriefData;
  materials?: string[];
  stylePreferences?: {
    tone?: string;
    complexity?: string;
    format?: string;
  };
}

export interface GeneratedSlide {
  id: string;
  title: string;
  content: any; // Может содержать различные типы контента
  template: string;
  order: number;
}

export interface GenerateSlidesResponse {
  success: boolean;
  data?: {
    templateIds: string[];
    deck: {
      title: string;
      slides: GeneratedSlide[];
    };
    slides: GeneratedSlide[];
  };
  error?: string;
}

// Запросы для превью структуры
export interface PreviewStructureRequest {
  userData?: UserData;
  generatedStructure?: {
    slides: SlideStructure[];
    title?: string;
  };
}

export interface PreviewStructureResponse {
  success: boolean;
  data?: {
    preview: {
      title: string;
      slides: SlideStructure[];
      estimatedDuration?: number;
      complexity?: string;
    };
  };
  error?: string;
}

// Запросы для выбора структуры
export interface SelectStructureRequest {
  userData: UserData;
  mode: "auto" | "fixed";
  slideCount: number;
  preferences?: {
    includeIntroduction?: boolean;
    includeConclusion?: boolean;
    detailLevel?: "brief" | "detailed" | "comprehensive";
  };
}

export interface SelectStructureResponse {
  success: boolean;
  data?: {
    structure: {
      slides: SlideStructure[];
      title: string;
      totalSlides: number;
    };
    alternatives?: SlideStructure[][];
  };
  error?: string;
}

// Запросы для создания заголовка и слайдов
export interface CreateTitleAndSlidesRequest {
  userData: UserData;
  chosenStructure: {
    slides: SlideStructure[];
    title?: string;
  };
  preferences?: {
    tone?: string;
    complexity?: string;
    includeImages?: boolean;
  };
}

export interface SlideContent {
  title: string;
  bullets?: string[];
  content?: string;
  images?: string[];
  notes?: string;
}

export interface CreateTitleAndSlidesResponse {
  success: boolean;
  data?: {
    title: string;
    slides: SlideContent[];
    metadata?: {
      estimatedDuration: number;
      complexity: string;
      slideCount: number;
    };
  };
  error?: string;
}

// Базовая функция для выполнения API запросов
const makeApiRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для выполнения запроса");
  }

  const response = await fetch(`${baseUrl}/ai-proxy/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

// API функции
export const addSlideToStructure = async (
  data: AddSlideRequest
): Promise<AddSlideResponse> => {
  return makeApiRequest<AddSlideResponse>(
    "v1/create/structure/add-slide",
    data
  );
};

export const generateSlidesForStructure = async (
  data: GenerateSlidesRequest
): Promise<GenerateSlidesResponse> => {
  return makeApiRequest<GenerateSlidesResponse>(
    "v1/create/structure/generate-slides",
    data
  );
};

export const previewStructure = async (
  data: PreviewStructureRequest
): Promise<PreviewStructureResponse> => {
  return makeApiRequest<PreviewStructureResponse>(
    "create/structure/preview",
    data
  );
};

export const selectStructure = async (
  data: SelectStructureRequest
): Promise<SelectStructureResponse> => {
  return makeApiRequest<SelectStructureResponse>(
    "create/structure/select",
    data
  );
};

export const createTitleAndSlides = async (
  data: CreateTitleAndSlidesRequest
): Promise<CreateTitleAndSlidesResponse> => {
  return makeApiRequest<CreateTitleAndSlidesResponse>(
    "create/title-and-slides",
    data
  );
};

// React Query хуки для удобного использования
export const useAddSlideToStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSlideToStructure,
    onSuccess: () => {
      // Инвалидируем кэш презентаций после успешного добавления слайда
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error adding slide to structure:", error);
    },
  });
};

export const useGenerateSlidesForStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateSlidesForStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error generating slides for structure:", error);
    },
  });
};

export const usePreviewStructure = () => {
  return useMutation({
    mutationFn: previewStructure,
    onError: (error) => {
      console.error("Error previewing structure:", error);
    },
  });
};

export const useSelectStructure = () => {
  return useMutation({
    mutationFn: selectStructure,
    onError: (error) => {
      console.error("Error selecting structure:", error);
    },
  });
};

export const useCreateTitleAndSlides = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTitleAndSlides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error creating title and slides:", error);
    },
  });
};

// Вспомогательные функции для валидации данных
export const validateUserData = (
  userData: Partial<UserData>
): userData is UserData => {
  return !!(
    userData.topic &&
    userData.goal &&
    userData.audience &&
    userData.topic.trim() !== "" &&
    userData.goal.trim() !== "" &&
    userData.audience.trim() !== ""
  );
};

export const validateSlideStructure = (
  slides: any[]
): slides is SlideStructure[] => {
  return slides.every(
    (slide) =>
      slide &&
      typeof slide.title === "string" &&
      typeof slide.summary === "string" &&
      slide.title.trim() !== "" &&
      slide.summary.trim() !== ""
  );
};

// Константы для настроек по умолчанию
export const DEFAULT_PREFERENCES = {
  tone: "professional",
  complexity: "medium",
  format: "business",
  includeIntroduction: true,
  includeConclusion: true,
  detailLevel: "detailed" as const,
  includeImages: true,
};

export const SLIDE_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20] as const;
export const COMPLEXITY_LEVELS = [
  "brief",
  "detailed",
  "comprehensive",
] as const;
export const TONE_OPTIONS = [
  "professional",
  "casual",
  "academic",
  "creative",
] as const;
