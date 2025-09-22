import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  Brief,
  ExtractedFile,
  DetectedStructure,
  GlobalFonts,
  CreateDeckFromBriefResponse,
} from "@/shared/api/presentation-generation";

// Типы для пошагового процесса создания презентации
export type PresentationFlowStep =
  | "file-upload" // Экран загрузки файлов
  | "brief" // Экран брифа
  | "style" // Экран выбора стиля
  | "editor"; // Редактор презентации

// Режимы работы с количеством слайдов
export type SlideCountMode = "auto" | "fixed";

// Режимы перезаписи контента
export type RewriteMode = "preserve" | "mixed" | "generate";

// Состояние процесса создания презентации
export interface PresentationFlowState {
  // === Шаг и навигация ===
  currentStep: PresentationFlowStep;

  // === Загрузка файлов (Шаг 1) ===
  isUploadingFiles: boolean;
  uploadError: string | null;
  extractedFiles: ExtractedFile[];

  // === Бриф (Шаг 2) ===
  brief: Brief;
  slideCountMode: SlideCountMode;
  slideCount?: number;
  briefInitial?: Brief; // Предзаполненный бриф от API
  detected?: DetectedStructure; // Обнаруженная структура

  // === Настройки контента ===
  rewrite: RewriteMode;
  textVolume: "Минимальный" | "Средний" | "Большой";
  imageSource: "Flux" | "Из интернета" | "Смешанный";
  extraInstructions?: string;

  // === Стиль (Шаг 3) ===
  selectedTheme?: string;
  selectedTemplate?: string;

  // === Генерация презентации ===
  isGenerating: boolean;
  generationProgress: number; // 0-100
  generationError: string | null;

  // === Результат генерации ===
  deckTitle?: string;
  uiSlides?: Array<{
    title: string;
    summary: string;
  }>;
  templateIds?: string[];
  globalFonts?: GlobalFonts;
  slides?: any[]; // Данные слайдов для редактора
  meta?: {
    source: string;
    rewrite: string;
    textVolume: string;
    imageSource: string;
  };

  // === Действия ===

  // Навигация
  setCurrentStep: (step: PresentationFlowStep) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;

  // Загрузка файлов
  setIsUploadingFiles: (loading: boolean) => void;
  setUploadError: (error: string | null) => void;
  setExtractedFiles: (files: ExtractedFile[]) => void;
  addExtractedFile: (file: ExtractedFile) => void;
  removeExtractedFile: (fileName: string) => void;

  // Бриф
  setBrief: (brief: Partial<Brief>) => void;
  setBriefInitial: (brief: Brief) => void;
  setSlideCountMode: (mode: SlideCountMode) => void;
  setSlideCount: (count: number) => void;
  setDetected: (detected: DetectedStructure) => void;

  // Настройки
  setRewrite: (mode: RewriteMode) => void;
  setTextVolume: (volume: "Минимальный" | "Средний" | "Большой") => void;
  setImageSource: (source: "Flux" | "Из интернета" | "Смешанный") => void;
  setExtraInstructions: (instructions: string) => void;

  // Стиль
  setSelectedTheme: (theme: string) => void;
  setSelectedTemplate: (template: string) => void;

  // Генерация
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationError: (error: string | null) => void;

  // Результат
  setGenerationResult: (result: CreateDeckFromBriefResponse) => void;

  // Сброс состояния
  resetFlow: () => void;
  resetToStep: (step: PresentationFlowStep) => void;

  // Валидация
  canProceedFromStep: (step: PresentationFlowStep) => boolean;
  getValidationErrors: (step: PresentationFlowStep) => string[];
}

// Начальное состояние
const initialState = {
  // Навигация
  currentStep: "file-upload" as PresentationFlowStep,

  // Загрузка файлов
  isUploadingFiles: false,
  uploadError: null as string | null,
  extractedFiles: [] as ExtractedFile[],

  // Бриф
  brief: {
    topic: "",
    goal: "",
    audience: "",
    keyIdea: "",
    expectedAction: "",
    tones: [],
  } as Brief,
  slideCountMode: "auto" as SlideCountMode,

  // Настройки
  rewrite: "mixed" as RewriteMode,
  textVolume: "Средний" as "Минимальный" | "Средний" | "Большой",
  imageSource: "Смешанный" as "Flux" | "Из интернета" | "Смешанный",

  // Генерация
  isGenerating: false,
  generationProgress: 0,
  generationError: null as string | null,
};

export const usePresentationFlowStore = create<PresentationFlowState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // === Навигация ===
    setCurrentStep: (step) => set({ currentStep: step }),

    goToNextStep: () => {
      const current = get().currentStep;
      const steps: PresentationFlowStep[] = [
        "file-upload",
        "brief",
        "style",
        "editor",
      ];
      const currentIndex = steps.indexOf(current);

      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        if (get().canProceedFromStep(current)) {
          set({ currentStep: nextStep });
        }
      }
    },

    goToPrevStep: () => {
      const current = get().currentStep;
      const steps: PresentationFlowStep[] = [
        "file-upload",
        "brief",
        "style",
        "editor",
      ];
      const currentIndex = steps.indexOf(current);

      if (currentIndex > 0) {
        set({ currentStep: steps[currentIndex - 1] });
      }
    },

    // === Загрузка файлов ===
    setIsUploadingFiles: (loading) => set({ isUploadingFiles: loading }),
    setUploadError: (error) => set({ uploadError: error }),
    setExtractedFiles: (files) => set({ extractedFiles: files }),
    addExtractedFile: (file) =>
      set((state) => ({
        extractedFiles: [...state.extractedFiles, file],
      })),
    removeExtractedFile: (fileName) =>
      set((state) => ({
        extractedFiles: state.extractedFiles.filter((f) => f.name !== fileName),
      })),

    // === Бриф ===
    setBrief: (briefUpdate) =>
      set((state) => ({
        brief: { ...state.brief, ...briefUpdate },
      })),
    setBriefInitial: (brief) => set({ briefInitial: brief }),
    setSlideCountMode: (mode) => set({ slideCountMode: mode }),
    setSlideCount: (count) => set({ slideCount: count }),
    setDetected: (detected) => set({ detected }),

    // === Настройки ===
    setRewrite: (mode) => set({ rewrite: mode }),
    setTextVolume: (volume) => set({ textVolume: volume }),
    setImageSource: (source) => set({ imageSource: source }),
    setExtraInstructions: (instructions) =>
      set({ extraInstructions: instructions }),

    // === Стиль ===
    setSelectedTheme: (theme) => set({ selectedTheme: theme }),
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),

    // === Генерация ===
    setIsGenerating: (generating) => set({ isGenerating: generating }),
    setGenerationProgress: (progress) => set({ generationProgress: progress }),
    setGenerationError: (error) => set({ generationError: error }),

    // === Результат ===
    setGenerationResult: (result) =>
      set({
        deckTitle: result.deckTitle,
        uiSlides: result.uiSlides,
        templateIds: result.templateIds,
        globalFonts: result.deck._globalFonts,
        slides: result.slides,
        meta: result.meta,
        isGenerating: false,
        generationProgress: 100,
        currentStep: "editor",
      }),

    // === Сброс ===
    resetFlow: () => set(initialState),

    resetToStep: (step) => {
      const stepsToReset: Partial<PresentationFlowState> = {
        currentStep: step,
      };

      // Сбрасываем состояние в зависимости от шага
      switch (step) {
        case "file-upload":
          Object.assign(stepsToReset, {
            extractedFiles: [],
            briefInitial: undefined,
            detected: undefined,
          });
        // fall through
        case "brief":
          Object.assign(stepsToReset, {
            brief: initialState.brief,
            slideCountMode: initialState.slideCountMode,
            slideCount: undefined,
          });
        // fall through
        case "style":
          Object.assign(stepsToReset, {
            selectedTheme: undefined,
            selectedTemplate: undefined,
          });
        // fall through
        case "editor":
          Object.assign(stepsToReset, {
            isGenerating: false,
            generationProgress: 0,
            generationError: null,
            deckTitle: undefined,
            uiSlides: undefined,
            templateIds: undefined,
            globalFonts: undefined,
            slides: undefined,
            meta: undefined,
          });
          break;
      }

      set(stepsToReset);
    },

    // === Валидация ===
    canProceedFromStep: (step) => {
      const state = get();

      switch (step) {
        case "file-upload":
          return state.extractedFiles.length > 0 && !state.isUploadingFiles;

        case "brief":
          return !!(
            state.brief.topic &&
            state.brief.goal &&
            state.brief.audience &&
            (state.slideCountMode === "auto" || state.slideCount)
          );

        case "style":
          return true; // Стиль опциональный

        case "editor":
          return false; // Из редактора нельзя перейти дальше

        default:
          return false;
      }
    },

    getValidationErrors: (step) => {
      const state = get();
      const errors: string[] = [];

      switch (step) {
        case "file-upload":
          if (state.extractedFiles.length === 0) {
            errors.push("Загрузите хотя бы один файл");
          }
          if (state.isUploadingFiles) {
            errors.push("Дождитесь завершения загрузки файлов");
          }
          break;

        case "brief":
          if (!state.brief.topic) errors.push("Укажите тему");
          if (!state.brief.goal) errors.push("Укажите цель");
          if (!state.brief.audience) errors.push("Укажите аудиторию");
          if (state.slideCountMode === "fixed" && !state.slideCount) {
            errors.push("Укажите количество слайдов");
          }
          break;

        default:
          break;
      }

      return errors;
    },
  }))
);

// Селекторы для оптимизации ре-рендеров
export const useCurrentStep = () =>
  usePresentationFlowStore((state) => state.currentStep);

export const useExtractedFiles = () =>
  usePresentationFlowStore((state) => state.extractedFiles);

export const useBrief = () => usePresentationFlowStore((state) => state.brief);

export const useGenerationState = () =>
  usePresentationFlowStore((state) => ({
    isGenerating: state.isGenerating,
    progress: state.generationProgress,
    error: state.generationError,
  }));

export const useGenerationResult = () =>
  usePresentationFlowStore((state) => ({
    deckTitle: state.deckTitle,
    uiSlides: state.uiSlides,
    templateIds: state.templateIds,
    globalFonts: state.globalFonts,
    slides: state.slides,
    meta: state.meta,
  }));

export const useCanProceed = (step: PresentationFlowStep) =>
  usePresentationFlowStore((state) => state.canProceedFromStep(step));

export const useValidationErrors = (step: PresentationFlowStep) =>
  usePresentationFlowStore((state) => state.getValidationErrors(step));
