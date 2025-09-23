import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/shared/stores/auth.store";

// ==================== Базовые типы ====================

// Извлеченный файл (результат /api/files/extract)
export interface ExtractedFile {
  name: string;
  type: string;
  size: number;
  text: string;
}

// Легкий формат файла для брифа
export interface FileLiteIn {
  name: string;
  type: string;
  size: number;
  text: string;
}

// Расширенный формат файла для анализа структуры
export interface ExtractedFileIn {
  name: string;
  type: string;
  size: number;
  text: string;
}

// Полный бриф презентации
export interface Brief {
  topic: string;
  goal: string;
  audience: string;
  keyIdea?: string;
  expectedAction?: string;
  tones?: string[];
}

// Обнаруженная структура
export interface DetectedStructure {
  hasStructure: boolean;
  slideCount: number;
  slides: Array<{
    title: string;
    summary: string;
  }>;
}

// Глобальные шрифты
export interface GlobalFonts {
  _fontScale?: number;
  _fontSizes?: {
    title: number;
    subtitle: number;
    t1: number;
    t2: number;
    badge: number;
  };
  _fontCaps?: Record<string, number>;
}

// ==================== API Requests/Responses ====================

// 1. Извлечение файлов
export interface ExtractFilesRequest {
  files: FileList | File[];
}

export interface ExtractFilesResponse {
  files: ExtractedFile[];
}

// 2. Генерация брифа
export interface GenerateBriefRequest {
  files: FileLiteIn[];
}

export interface GenerateBriefResponse {
  result: Brief;
}

// 3. Анализ структуры
export interface AnalyzeStructureRequest {
  files: ExtractedFileIn[];
}

export interface AnalyzeStructureResponse {
  hasStructure: boolean;
  slideCount: number;
  slides: Array<{
    title: string;
    summary: string;
  }>;
}

// 4. Выбор структуры
export interface SelectStructureRequest {
  mode: "auto" | "fixed";
  slideCount?: string; // API ожидает строку
  userData: {
    topic: string;
    goal: string;
    audience: string;
    keyIdea?: string;
    expectedAction?: string;
    tones?: string[];
    files?: ExtractedFile[];
  };
}

export interface SelectStructureResponse {
  ok: boolean;
  mode: "auto" | "fixed";
  slideCount: number;
  structureText: string;
  chosenStructure: string;
}

// 5. Создание названия и черновых слайдов
export interface CreateTitleAndSlidesRequestNew {
  userData: {
    topic: string;
    goal: string;
    audience: string;
    keyIdea?: string;
    expectedAction?: string;
    tones?: string[];
    files?: ExtractedFile[];
  };
  chosenStructure: string;
}

export interface CreateTitleAndSlidesResponseNew {
  title: string;
  slides: Array<{
    title: string;
    summary: string;
  }>;
}

// 6. Добавление слайда к структуре
export interface AddSlideToStructureRequest {
  newSlidePrompt: string;
  brief: {
    topic: string;
    goal: string;
    audience: string;
    expectedAction?: string;
    tones?: string[];
  };
  slides: Array<{
    title: string;
    summary: string;
  }>;
}

export interface AddSlideToStructureResponse {
  title: string;
  summary: string;
}
slides: Array<{
  title: string;
  summary: string;
}>;

export interface AddSlideToStructureResponse {
  title: string;
  summary: string;
}

// 7. Генерация полной презентации из брифа (ГЛАВНЫЙ ENDPOINT)
export interface CreateDeckFromBriefRequest {
  brief: Brief;
  rewrite: "preserve" | "mixed" | "generate";
  textVolume: "Минимальный" | "Средний" | "Большой";
  imageSource: "Flux" | "Из интернета" | "Смешанный";
  autoSlideCount?: boolean;
  slideCount?: number;
  extraInstructions?: string;
  detected?: DetectedStructure;
  files: ExtractedFile[];
  seed?: number;
  concurrency?: number;
}

export interface CreateDeckFromBriefResponse {
  deckTitle: string;
  uiSlides: Array<{
    title: string;
    summary: string;
  }>;
  templateIds: string[];
  templatesMetaVersion: string;
  deck: {
    _globalFonts: GlobalFonts;
    [key: string]: any;
  };
  slides: any[];
  meta: {
    source: string;
    rewrite: string;
    textVolume: string;
    imageSource: string;
  };
}

// 7.1. Генерация слайдов для структуры (новый основной API)
export interface GenerateSlidesForStructureRequest {
  deckTitle: string;
  uiSlides: Array<{
    title: string;
    summary: string;
  }>;
  userData: {
    topic: string;
    goal: string;
    audience: string;
    expectedAction?: string;
    keyIdea?: string;
    tones?: string[];
    files?: Array<{
      name: string;
      type: string;
      size: number;
      text: string;
    }>;
  };
  volume: "Минимальный" | "Средний" | "Большой";
  imageSource: "Flux" | "Из интернета" | "Смешанный";
  seed?: number;
  concurrency?: number;
}

export interface GenerateSlidesForStructureResponse {
  templateIds: string[];
  templatesMetaVersion: string;
  deck: {
    _globalFonts: {
      _fontScale: number;
      _fontSizes: {
        title: number;
        subtitle: number;
        t1: number;
        t2: number;
        badge: number;
      };
      _fontCaps: {
        title: number;
        subtitle: number;
        t1: number;
        t2: number;
        badge: number;
      };
    };
  };
  slides: Array<{
    title: string;
    text1?: string | { t1: string; t2: string };
    table?: string[][];
    _images?: Array<{
      url: string;
      kind: string;
    }>;
    [key: string]: any;
  }>;
}

// 8. Подбор шаблонов
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
    uiSlides: Array<{
      title: string;
      summary: string;
      protoId?: string;
    }>;
  };
  error?: string;
}

// ==================== Старые типы (для совместимости) ====================

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

// Запросы для выбора структуры (используем новый тип выше)
export interface SelectStructureResponseOld {
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
    "api/v1/create/structure/add-slide",
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
    "api/v1/create/structure/generate-slides",
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

// ==================== Новые API функции ====================

// Базовая функция для multipart запросов
const makeMultipartRequest = async <T>(
  endpoint: string,
  files: FileList | File[]
): Promise<T> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";
  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const formData = new FormData();

  // Добавляем все файлы
  if (files instanceof FileList) {
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  } else {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await fetch(`${baseUrl}/ai-proxy/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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

// 1. Извлечение файлов
export const extractFiles = async (
  files: FileList | File[]
): Promise<ExtractFilesResponse> => {
  return makeMultipartRequest<ExtractFilesResponse>("files/extract", files);
};

// 2. Генерация брифа
export const generateBrief = async (
  data: GenerateBriefRequest
): Promise<GenerateBriefResponse> => {
  return makeApiRequest<GenerateBriefResponse>("openai/brief", data);
};

// 3. Анализ структуры
export const analyzeStructure = async (
  data: AnalyzeStructureRequest
): Promise<AnalyzeStructureResponse> => {
  return makeApiRequest<AnalyzeStructureResponse>(
    "openai/analyze-structure",
    data
  );
};

// 4. Выбор структуры
export const selectStructureNew = async (
  data: SelectStructureRequest
): Promise<SelectStructureResponse> => {
  return makeApiRequest<SelectStructureResponse>(
    "api/v1/create/structure/select",
    data
  );
};

// 5. Создание названия и черновых слайдов
export const createTitleAndSlidesNew = async (
  data: CreateTitleAndSlidesRequestNew
): Promise<CreateTitleAndSlidesResponseNew> => {
  return makeApiRequest<CreateTitleAndSlidesResponseNew>(
    "api/v1/create/title-and-slides",
    data
  );
};

// 6. Добавление слайда к структуре
export const addSlideToStructureNew = async (
  data: AddSlideToStructureRequest
): Promise<AddSlideToStructureResponse> => {
  return makeApiRequest<AddSlideToStructureResponse>(
    "api/v1/create/structure/add-slide",
    data
  );
};

// 7. ГЛАВНАЯ ФУНКЦИЯ: Создание презентации из брифа
export const createDeckFromBrief = async (
  data: CreateDeckFromBriefRequest
): Promise<CreateDeckFromBriefResponse> => {
  return makeApiRequest<CreateDeckFromBriefResponse>(
    "api/v1/create/deck-from-brief",
    data
  );
};

// 7.1. Генерация слайдов для структуры (новый основной API)
export const generateSlidesForStructureNew = async (
  data: GenerateSlidesForStructureRequest
): Promise<GenerateSlidesForStructureResponse> => {
  return makeApiRequest<GenerateSlidesForStructureResponse>(
    "api/v1/create/structure/generate-slides",
    data
  );
};

// ==================== React Query хуки для новых API ====================

// Хук для извлечения файлов
export const useExtractFiles = () => {
  return useMutation({
    mutationFn: extractFiles,
    onError: (error) => {
      console.error("Error extracting files:", error);
    },
  });
};

// Хук для генерации брифа
export const useGenerateBrief = () => {
  return useMutation({
    mutationFn: generateBrief,
    onError: (error) => {
      console.error("Error generating brief:", error);
    },
  });
};

// Хук для анализа структуры
export const useAnalyzeStructure = () => {
  return useMutation({
    mutationFn: analyzeStructure,
    onError: (error) => {
      console.error("Error analyzing structure:", error);
    },
  });
};

// Хук для выбора структуры
export const useSelectStructureNew = () => {
  return useMutation({
    mutationFn: selectStructureNew,
    onError: (error) => {
      console.error("Error selecting structure:", error);
    },
  });
};

// Хук для создания названия и черновых слайдов
export const useCreateTitleAndSlidesNew = () => {
  return useMutation({
    mutationFn: createTitleAndSlidesNew,
    onError: (error) => {
      console.error("Error creating title and slides:", error);
    },
  });
};

// Хук для добавления слайда к структуре
export const useAddSlideToStructureNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSlideToStructureNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structure"] });
    },
    onError: (error) => {
      console.error("Error adding slide to structure:", error);
    },
  });
};

// ГЛАВНЫЙ ХУК: Создание презентации из брифа
export const useCreateDeckFromBrief = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeckFromBrief,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error creating deck from brief:", error);
    },
  });
};

// Хук для генерации слайдов для структуры (новый основной API)
export const useGenerateSlidesForStructureNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateSlidesForStructureNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    },
    onError: (error) => {
      console.error("Error generating slides for structure:", error);
    },
  });
};

// ==================== Template API Functions ====================

// Получение HTML шаблона по ID
export const getTemplateHtml = async (templateId: string): Promise<string> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для выполнения запроса");
  }

  const response = await fetch(`${baseUrl}/templates/${templateId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch template ${templateId}: ${response.statusText}`
    );
  }

  return response.text(); // Возвращаем HTML как строку
};

// Заполнение шаблона данными
export const fillTemplate = async (
  templateId: string,
  data: Record<string, any>
): Promise<string> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  const token = getAuthToken();

  if (!token) {
    throw new Error("Требуется авторизация для выполнения запроса");
  }

  const response = await fetch(`${baseUrl}/templates/${templateId}/fill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fill template ${templateId}: ${response.statusText}`
    );
  }

  return response.text(); // Возвращаем заполненный HTML как строку
};

// Пакетное получение шаблонов
export const getMultipleTemplates = async (
  templateIds: string[]
): Promise<Record<string, string>> => {
  const templatePromises = templateIds.map(async (id) => {
    try {
      const html = await getTemplateHtml(id);
      return { id, html };
    } catch (error) {
      console.error(`Failed to fetch template ${id}:`, error);
      return { id, html: null };
    }
  });

  const results = await Promise.all(templatePromises);

  return results.reduce((acc, { id, html }) => {
    if (html) {
      acc[id] = html;
    }
    return acc;
  }, {} as Record<string, string>);
};

// React Query хуки для шаблонов
export const useGetTemplateHtml = (templateId: string) => {
  return useQuery({
    queryKey: ["template", templateId],
    queryFn: () => getTemplateHtml(templateId),
    enabled: !!templateId,
  });
};

export const useFillTemplate = () => {
  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: Record<string, any>;
    }) => fillTemplate(templateId, data),
  });
};

// ==================== Рендер слайдов с данными ====================

export interface SlideRenderData {
  title?: string;
  subtitle?: string;
  text1?: { t1?: string; t2?: string };
  text2?: { t1?: string; t2?: string };
  text3?: { t1?: string; t2?: string };
  _images?: string[];
}

export interface RenderedSlide {
  slideNumber: number;
  templateId: string;
  html: string;
}

export const renderSlidesWithData = async (data: {
  slides: SlideRenderData[];
  templateIds: string[];
}): Promise<RenderedSlide[]> => {
  const token = getAuthToken();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://presentology-back-production.up.railway.app";

  console.log("🎨 [API] Rendering slides with data", {
    slidesCount: data.slides?.length,
    templateIds: data.templateIds,
    baseUrl,
  });

  const response = await fetch(`${baseUrl}/ai-proxy/slides/render-with-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("❌ [API] Failed to render slides", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(`Failed to render slides: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("✅ [API] Slides rendered successfully", {
    success: result.success,
    renderedCount: result.renderedSlides?.length,
    fullResult: result,
  });

  if (!result.success || !result.renderedSlides) {
    console.error("❌ [API] Invalid response structure", result);
    throw new Error("Invalid response from render slides API");
  }

  if (result.renderedSlides.length === 0) {
    console.warn("⚠️ [API] No slides were rendered", {
      requestData: data,
      response: result,
    });
  }

  return result.renderedSlides;
};

export const useRenderSlidesWithData = () => {
  return useMutation({
    mutationFn: renderSlidesWithData,
  });
};
