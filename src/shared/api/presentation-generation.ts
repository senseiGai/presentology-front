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
  userData: {
    topic: string;
    audience: string;
    goal: string;
    files?: Array<{
      name: string;
      type: string;
      text?: string;
    }>;
  };
  volume?: string;
  imageSource?: string;
  seed?: number;
  concurrency?: number;
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

// Новые типы для генерации слайдов из текста (для "Сделай дизайн")
export interface GenerateSlidesFromTextRequest {
  prompt: string; // Текст пользователя для создания слайдов
  topic?: string;
  slideCount?: number;
  style?: string;
  audience?: string;
}

export interface GeneratedSlideFromText {
  title: string;
  bullets: string[];
}

export interface GenerateSlidesFromTextResponse {
  success: boolean;
  data?: {
    slides: GeneratedSlideFromText[];
  };
  error?: string;
}

// Типы для создания презентации в БД
export interface CreatePresentationRequest {
  title: string;
  description?: string;
  htmlContent: string;
  thumbnail?: string;
  isPublic?: boolean;
}

// Типы для изменения шаблона слайда
export interface ChangeSlideTemplateRequest {
  protoId: string;
  deckTitle: string;
  slideData?: {
    title?: string;
    subtitle?: string;
    text1?: string;
    text2?: {
      t1?: string;
      t2?: string;
    };
    table?: string[][];
    [key: string]: any;
  };
  neighborLeft?: {
    title: string;
    summary: string;
  };
  neighborRight?: {
    title: string;
    summary: string;
  };
  userData?: {
    files?: Array<{
      name: string;
      type: string;
      text: string;
    }>;
    [key: string]: any;
  };
  volume?: string;
  rewrite?: {
    mode: string;
    preserveTarget: number;
    preserveMin: number;
    preserveMax: number;
  };
  globalFonts?: {
    _fontScale: number;
    _fontSizes: {
      [key: string]: number;
    };
  };
}

export interface ChangeSlideTemplateResponse {
  success: boolean;
  data?: {
    slideData: any;
    template: any;
    metadata?: any;
  };
  error?: string;
}

export interface PresentationResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  htmlContent: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Базовая функция для выполнения API запросов
const makeApiRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  console.log("🌐 makeApiRequest called");
  console.log("📍 endpoint:", endpoint);
  console.log("📦 data:", data);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  console.log("🔗 baseUrl:", baseUrl);

  const token = getAuthToken();
  console.log("🔑 token:", token ? "✅ Token exists" : "❌ No token");

  if (!token) {
    console.log("❌ No token found, throwing error");
    throw new Error("Требуется авторизация для выполнения запроса");
  }

  const fullUrl = `${baseUrl}/ai-proxy/${endpoint}`;
  console.log("🔗 Full URL:", fullUrl);

  const requestBody = JSON.stringify(data);
  console.log("📤 Request body:", requestBody);

  try {
    console.log("🚀 Making fetch request...");
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    console.log("📨 Response received");
    console.log("📊 Response status:", response.status);
    console.log("📊 Response ok:", response.ok);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.log("❌ Response not ok, trying to parse error");
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ Error data:", errorData);
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    console.log("✅ Response ok, parsing JSON...");
    const result = await response.json();
    console.log("📨 Parsed response:", result);
    return result;
  } catch (error) {
    console.error("💥 Error in makeApiRequest:", error);
    throw error;
  }
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

// Новая функция для генерации слайдов из текста
export const generateSlidesFromText = async (
  data: GenerateSlidesFromTextRequest
): Promise<GenerateSlidesFromTextResponse> => {
  return makeApiRequest<GenerateSlidesFromTextResponse>("openai/slides", data);
};

// Функция для создания презентации в БД
export const createPresentation = async (
  data: CreatePresentationRequest
): Promise<PresentationResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для создания презентации");
  }

  const response = await fetch(`${baseUrl}/presentations`, {
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

export const changeSlideTemplate = async (
  data: ChangeSlideTemplateRequest
): Promise<ChangeSlideTemplateResponse> => {
  return makeApiRequest<ChangeSlideTemplateResponse>(
    "slides/change-template",
    data
  );
};

// Типы для подбора шаблонов
export interface PickTemplatesRequest {
  uiSlides: Array<{
    title: string;
    summary: string;
  }>;
  volume?: string;
  seed?: number;
}

export interface PickTemplatesResponse {
  success: boolean;
  data?: {
    slides: Array<{
      title: string;
      summary: string;
      protoId: string;
      volume?: string;
      seed?: number;
    }>;
  };
  error?: string;
}

export const pickSlideTemplates = async (
  data: PickTemplatesRequest
): Promise<PickTemplatesResponse> => {
  return makeApiRequest<PickTemplatesResponse>("slides/pick-templates", data);
};

export const getAvailableTemplates = async (): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    type: string;
    name: string;
    category: string;
  }>;
  error?: string;
}> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для получения шаблонов");
  }

  const response = await fetch(`${baseUrl}/ai-proxy/slides/templates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

export const useChangeSlideTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeSlideTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error changing slide template:", error);
    },
  });
};

export const usePickSlideTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickSlideTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      console.error("Error picking slide templates:", error);
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

// Новые хуки для "Сделай дизайн"
export const useGenerateSlidesFromText = () => {
  return useMutation({
    mutationFn: generateSlidesFromText,
    onError: (error) => {
      console.error("Error generating slides from text:", error);
    },
  });
};

export const useCreatePresentation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPresentation,
    onSuccess: (newPresentation) => {
      // Обновляем кэш списка презентаций
      queryClient.invalidateQueries({ queryKey: ["presentations"] });

      // Добавляем новую презентацию в кэш
      queryClient.setQueryData(
        ["presentations", newPresentation.id],
        newPresentation
      );

      console.log("Презентация успешно создана:", newPresentation);
    },
    onError: (error) => {
      console.error("Error creating presentation:", error);
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
