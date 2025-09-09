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
  zoomLevel: number;

  // Text editing state
  selectedTextElement: string | null;
  textEditorContent: string;
  textPosition: { x: number; y: number; rotation: number };
  textStyle: {
    fontSize: number;
    fontWeight: string;
    textAlign: "left" | "center" | "right";
    color: string;
    style:
      | "normal"
      | "scientific"
      | "business"
      | "conversational"
      | "selling"
      | "emotional"
      | "friendly"
      | "creative"
      | "humorous";
  };

  // Image editing state
  selectedImageElement: string | null;

  // Table editing state
  selectedTableElement: string | null;

  // Actions
  setCurrentSlide: (slide: number) => void;
  setTotalSlides: (total: number) => void;
  addGeneratedSlide: (slide: number) => void;
  insertSlideAfter: (afterSlide: number) => void;
  deleteSlide: (slideNumber: number) => void;
  deleteSlideByIndex: (slideIndex: number) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  setSelectedElement: (element: string) => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsToolsPanelCollapsed: (collapsed: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Text editing actions
  setSelectedTextElement: (elementId: string | null) => void;
  setTextEditorContent: (content: string) => void;
  setTextPosition: (position: {
    x: number;
    y: number;
    rotation: number;
  }) => void;
  setTextStyle: (style: Partial<PresentationState["textStyle"]>) => void;
  clearTextSelection: () => void;

  // Image editing actions
  setSelectedImageElement: (elementId: string | null) => void;
  clearImageSelection: () => void;

  // Table editing actions
  setSelectedTableElement: (elementId: string | null) => void;
  clearTableSelection: () => void;

  // Reset functions
  resetPresentation: () => void;
  startGeneration: () => void;
}

const initialState = {
  currentSlide: 1,
  totalSlides: 5,
  generatedSlides: [],
  isGenerating: true,
  showFeedback: false,
  selectedElement: "",
  isSidebarCollapsed: false,
  isToolsPanelCollapsed: false,
  zoomLevel: 100,

  // Text editing state
  selectedTextElement: null,
  textEditorContent: "",
  textPosition: { x: 20, y: 60, rotation: 0 },
  textStyle: {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left" as const,
    color: "#000000",
    style: "normal" as const,
  },

  // Image editing state
  selectedImageElement: null,

  // Table editing state
  selectedTableElement: null,
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

    insertSlideAfter: (afterSlide: number) =>
      set((state) => {
        const newTotalSlides = state.totalSlides + 1;
        // Обновляем номера сгенерированных слайдов, которые идут после вставляемого
        const updatedGeneratedSlides = state.generatedSlides.map((slideNum) =>
          slideNum > afterSlide ? slideNum + 1 : slideNum
        );
        // Добавляем новый слайд как сгенерированный
        updatedGeneratedSlides.push(afterSlide + 1);

        return {
          totalSlides: newTotalSlides,
          generatedSlides: updatedGeneratedSlides.sort((a, b) => a - b),
          currentSlide: afterSlide + 1,
        };
      }),

    deleteSlide: (slideNumber: number) =>
      set((state) => {
        console.log(
          `STORE: deleteSlide called with slideNumber: ${slideNumber}`
        );
        console.log("STORE: Current state before delete:", {
          totalSlides: state.totalSlides,
          generatedSlides: state.generatedSlides,
          currentSlide: state.currentSlide,
        });

        // Don't allow deleting if it's the only slide or if slide is not generated
        if (
          state.totalSlides <= 1 ||
          !state.generatedSlides.includes(slideNumber)
        ) {
          console.log(
            "STORE: Delete blocked - either only slide or not generated"
          );
          return state;
        }

        // Simple approach: just reduce total slides and remove from generated array
        // All slides after the deleted one will shift down automatically in the UI
        const newTotalSlides = state.totalSlides - 1;

        // Remove the deleted slide and shift all higher-numbered slides down by 1
        const updatedGeneratedSlides = state.generatedSlides
          .filter((slideNum) => slideNum !== slideNumber)
          .map((slideNum) =>
            slideNum > slideNumber ? slideNum - 1 : slideNum
          );

        // Handle current slide adjustment
        let newCurrentSlide = state.currentSlide;
        if (state.currentSlide === slideNumber) {
          // If we're deleting the current slide, move to the previous one if possible
          newCurrentSlide = slideNumber > 1 ? slideNumber - 1 : 1;
        } else if (state.currentSlide > slideNumber) {
          // If current slide is after the deleted slide, shift it down
          newCurrentSlide = state.currentSlide - 1;
        }

        // Make sure current slide is valid
        newCurrentSlide = Math.max(
          1,
          Math.min(newCurrentSlide, newTotalSlides)
        );

        const result = {
          totalSlides: newTotalSlides,
          generatedSlides: updatedGeneratedSlides,
          currentSlide: newCurrentSlide,
        };

        console.log("STORE: Delete result:", result);
        return result;
      }),

    deleteSlideByIndex: (slideIndex: number) =>
      set((state) => {
        console.log(
          `STORE: deleteSlideByIndex called with slideIndex: ${slideIndex}`
        );
        console.log("STORE: Current state before delete:", {
          totalSlides: state.totalSlides,
          generatedSlides: state.generatedSlides,
          currentSlide: state.currentSlide,
        });

        // Don't allow deleting if it's the only slide or if index is out of bounds
        if (
          state.totalSlides <= 1 ||
          slideIndex < 0 ||
          slideIndex >= state.totalSlides
        ) {
          console.log(
            "STORE: Delete blocked - either only slide or invalid index"
          );
          return state;
        }

        const slideNumber = slideIndex + 1; // Convert index to slide number

        // Don't allow deleting if slide is not generated
        if (!state.generatedSlides.includes(slideNumber)) {
          console.log("STORE: Delete blocked - slide not generated");
          return state;
        }

        const newTotalSlides = state.totalSlides - 1;

        // Remove the slide at the given index and shift all subsequent slides
        const updatedGeneratedSlides = state.generatedSlides
          .filter((slideNum) => slideNum !== slideNumber) // Remove the deleted slide
          .map((slideNum) =>
            slideNum > slideNumber ? slideNum - 1 : slideNum
          ); // Shift subsequent slides

        // Handle current slide adjustment
        let newCurrentSlide = state.currentSlide;
        if (state.currentSlide === slideNumber) {
          // If we're deleting the current slide, move to the previous one if possible
          newCurrentSlide = slideNumber > 1 ? slideNumber - 1 : 1;
        } else if (state.currentSlide > slideNumber) {
          // If current slide is after the deleted slide, shift it down
          newCurrentSlide = state.currentSlide - 1;
        }

        // Make sure current slide is valid
        newCurrentSlide = Math.max(
          1,
          Math.min(newCurrentSlide, newTotalSlides)
        );

        const result = {
          totalSlides: newTotalSlides,
          generatedSlides: updatedGeneratedSlides,
          currentSlide: newCurrentSlide,
        };

        console.log("STORE: DeleteByIndex result:", result);
        return result;
      }),

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

    setZoomLevel: (zoom: number) => set({ zoomLevel: zoom }),

    zoomIn: () =>
      set((state) => ({
        zoomLevel: Math.min(state.zoomLevel + 10, 100), // Max zoom 100%
      })),

    zoomOut: () =>
      set((state) => ({
        zoomLevel: Math.max(state.zoomLevel - 10, 50), // Min zoom 50%
      })),

    resetZoom: () => set({ zoomLevel: 100 }),

    // Text editing actions
    setSelectedTextElement: (elementId: string | null) =>
      set({ selectedTextElement: elementId }),

    setTextEditorContent: (content: string) =>
      set({ textEditorContent: content }),

    setTextPosition: (position: { x: number; y: number; rotation: number }) =>
      set({ textPosition: position }),

    setTextStyle: (style: Partial<PresentationState["textStyle"]>) =>
      set((state) => ({ textStyle: { ...state.textStyle, ...style } })),

    clearTextSelection: () =>
      set({
        selectedTextElement: null,
        textEditorContent: "",
        textPosition: { x: 20, y: 60, rotation: 0 },
        textStyle: {
          fontSize: 14,
          fontWeight: "normal",
          textAlign: "left" as const,
          color: "#000000",
          style: "normal" as const,
        },
      }),

    // Image editing actions
    setSelectedImageElement: (elementId: string | null) =>
      set({ selectedImageElement: elementId }),

    clearImageSelection: () =>
      set({
        selectedImageElement: null,
      }),

    // Table editing actions
    setSelectedTableElement: (elementId: string | null) =>
      set({ selectedTableElement: elementId }),

    clearTableSelection: () =>
      set({
        selectedTableElement: null,
      }),

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
export const useSelectedImageElement = () =>
  usePresentationStore((state) => state.selectedImageElement);
export const useSelectedTableElement = () =>
  usePresentationStore((state) => state.selectedTableElement);
export const useIsSidebarCollapsed = () =>
  usePresentationStore((state) => state.isSidebarCollapsed);
export const useIsToolsPanelCollapsed = () =>
  usePresentationStore((state) => state.isToolsPanelCollapsed);
export const useZoomLevel = () =>
  usePresentationStore((state) => state.zoomLevel);

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
