import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface PresentationState {
  // Slide management
  currentSlide: number;
  totalSlides: number;
  generatedSlides: number[];
  isGenerating: boolean;

  // UI state
  showFeedback: boolean;
  selectedElement: string;
  isSidebarCollapsed: boolean;
  isToolsPanelCollapsed: boolean;

  // Actions
  setCurrentSlide: (slide: number) => void;
  setTotalSlides: (total: number) => void;
  addGeneratedSlide: (slide: number) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  setSelectedElement: (element: string) => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsToolsPanelCollapsed: (collapsed: boolean) => void;

  // Reset functions
  resetPresentation: () => void;
  startGeneration: () => void;
}

const initialState = {
  currentSlide: 1,
  totalSlides: 15,
  generatedSlides: [],
  isGenerating: true,
  showFeedback: false,
  selectedElement: "",
  isSidebarCollapsed: false,
  isToolsPanelCollapsed: false,
};

export const usePresentationStore = create<PresentationState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Actions
    setCurrentSlide: (slide: number) => set({ currentSlide: slide }),

    setTotalSlides: (total: number) => set({ totalSlides: total }),

    addGeneratedSlide: (slide: number) =>
      set((state) => ({
        generatedSlides: [...state.generatedSlides, slide],
        currentSlide: slide, // Автоматически переключаемся на новый слайд
      })),

    setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),

    setShowFeedback: (show: boolean) => set({ showFeedback: show }),

    setSelectedElement: (element: string) => set({ selectedElement: element }),

    toggleSidebar: () =>
      set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed,
        isToolsPanelCollapsed: !state.isToolsPanelCollapsed,
      })),

    setIsSidebarCollapsed: (collapsed: boolean) =>
      set({ isSidebarCollapsed: collapsed }),

    setIsToolsPanelCollapsed: (collapsed: boolean) =>
      set({ isToolsPanelCollapsed: collapsed }),

    resetPresentation: () => set(initialState),

    startGeneration: () =>
      set({
        isGenerating: true,
        generatedSlides: [],
        currentSlide: 1,
        showFeedback: false,
      }),
  }))
);

// Селекторы для оптимизации ре-рендеров
export const useCurrentSlide = () =>
  usePresentationStore((state) => state.currentSlide);
export const useTotalSlides = () =>
  usePresentationStore((state) => state.totalSlides);
export const useGeneratedSlides = () =>
  usePresentationStore((state) => state.generatedSlides);
export const useIsGenerating = () =>
  usePresentationStore((state) => state.isGenerating);
export const useShowFeedback = () =>
  usePresentationStore((state) => state.showFeedback);
export const useSelectedElement = () =>
  usePresentationStore((state) => state.selectedElement);
export const useIsSidebarCollapsed = () =>
  usePresentationStore((state) => state.isSidebarCollapsed);
export const useIsToolsPanelCollapsed = () =>
  usePresentationStore((state) => state.isToolsPanelCollapsed);

// Составные селекторы
export const useSlideState = () =>
  usePresentationStore((state) => ({
    currentSlide: state.currentSlide,
    totalSlides: state.totalSlides,
    generatedSlides: state.generatedSlides,
    isGenerating: state.isGenerating,
  }));

export const useUIState = () =>
  usePresentationStore((state) => ({
    showFeedback: state.showFeedback,
    selectedElement: state.selectedElement,
    isSidebarCollapsed: state.isSidebarCollapsed,
    isToolsPanelCollapsed: state.isToolsPanelCollapsed,
  }));
