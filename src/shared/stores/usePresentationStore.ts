import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// History state for undo/redo functionality
interface HistoryAction {
  type:
    | "text_content"
    | "text_style"
    | "text_position"
    | "text_delete"
    | "text_create";
  elementId: string;
  previousValue: any;
  newValue: any;
  timestamp: number;
}

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
  selectedTextElements: string[]; // Array for multiple selection
  textEditorContent: string;
  textPosition: { x: number; y: number; rotation: number };
  textElementPositions: Record<string, { x: number; y: number }>; // Store positions for all text elements
  textElementContents: Record<string, string>; // Store text content for all text elements
  deletedTextElements: Set<string>; // Track deleted elements
  textElementStyles: Record<
    string,
    {
      fontSize: number;
      fontWeight: string;
      fontStyle?: string;
      textDecoration?: string;
      textAlign: "left" | "center" | "right";
      color: string;
      x?: number;
      y?: number;
      rotation?: number;
      zIndex?: number;
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
    }
  >; // Store styles for each text element
  textStyle: {
    fontSize: number;
    fontWeight: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign: "left" | "center" | "right";
    color: string;
    x?: number;
    y?: number;
    rotation?: number;
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
  isImageAreaSelectionMode: boolean;
  imageAreaSelections: Record<
    number,
    {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isSelecting: boolean;
    }
  >;
  imageElements: Record<
    number,
    Record<
      string,
      {
        id: string;
        src?: string;
        alt?: string;
        width: number;
        height: number;
        position: { x: number; y: number };
        placeholder?: boolean;
      }
    >
  >;

  // Table editing state
  selectedTableElement: string | null;
  tableElements: Record<
    number,
    Record<
      string,
      {
        id: string;
        rows: number;
        cols: number;
        cells: any[][];
        style: {
          borderThickness: number;
          borderColor: string;
          textColor: string;
          fontSize: number;
          textAlign: "left" | "center" | "right";
          textFormats: string[];
        };
        position: { x: number; y: number };
      }
    >
  >;

  // Infographics editing statey
  selectedInfographicsElement: string | null;
  infographicsElements: Record<
    number,
    Record<
      string,
      {
        id: string;
        svgContent?: string;
        dataUrl?: string;
        width: number;
        height: number;
        position: { x: number; y: number };
        placeholder?: boolean;
      }
    >
  >;

  // History for undo/redo
  history: HistoryAction[];
  historyIndex: number;
  maxHistorySize: number;

  // Template HTML storage
  slideTemplates: Record<string, string>; // Store HTML templates by template ID

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

  // Navigation actions
  scrollToSlideInCanvas?: (slideNumber: number) => void;
  setScrollToSlideInCanvas: (
    scrollFn: ((slideNumber: number) => void) | undefined
  ) => void;

  // Text editing actions
  setSelectedTextElement: (elementId: string | null) => void;
  setSelectedTextElements: (elementIds: string[]) => void;
  addToSelectedTextElements: (elementId: string) => void;
  removeFromSelectedTextElements: (elementId: string) => void;
  clearSelectedTextElements: () => void;
  toggleTextElementSelection: (
    elementId: string,
    isCtrlPressed: boolean
  ) => void;
  setTextEditorContent: (content: string) => void;
  setTextPosition: (position: {
    x: number;
    y: number;
    rotation: number;
  }) => void;
  setTextElementPosition: (
    elementId: string,
    position: { x: number; y: number }
  ) => void;
  finalizeTextElementPosition: (
    elementId: string,
    position: { x: number; y: number }
  ) => void;
  getTextElementPosition: (elementId: string) => { x: number; y: number };
  setTextStyle: (style: Partial<PresentationState["textStyle"]>) => void;
  updateTextElementStyle: (
    elementId: string,
    style: Partial<PresentationState["textStyle"]>
  ) => void;
  updateMultipleTextElementStyles: (
    elementIds: string[],
    style: Partial<PresentationState["textStyle"]>
  ) => void;
  getTextElementStyle: (
    elementId: string
  ) => PresentationState["textElementStyles"][string];
  setTextElementContent: (elementId: string, content: string) => void;
  setMultipleTextElementContent: (
    elementIds: string[],
    content: string
  ) => void;
  getTextElementContent: (elementId: string) => string;
  deleteTextElement: (elementId: string) => void;
  copyTextElement: (elementId: string, slideNumber?: number) => string;
  moveTextElementUp: (elementId: string) => void;
  moveTextElementDown: (elementId: string) => void;
  clearTextSelection: () => void;

  // Image editing actions
  setSelectedImageElement: (elementId: string | null) => void;
  clearImageSelection: () => void;
  setImageAreaSelectionMode: (enabled: boolean) => void;
  startImageAreaSelection: (slideNumber: number, x: number, y: number) => void;
  updateImageAreaSelection: (slideNumber: number, x: number, y: number) => void;
  finishImageAreaSelection: (slideNumber: number) => void;
  clearImageAreaSelection: (slideNumber?: number) => void;
  getImageAreaSelection: (
    slideNumber: number
  ) => PresentationState["imageAreaSelections"][number] | null;
  addImageElement: (
    slideNumber: number,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => string;
  updateImageElement: (
    elementId: string,
    updates: Partial<PresentationState["imageElements"][number][string]>
  ) => void;
  deleteImageElement: (elementId: string) => void;
  getImageElement: (
    elementId: string
  ) => PresentationState["imageElements"][number][string] | null;
  copyImageElement: (elementId: string) => string;

  // Table editing actions
  setSelectedTableElement: (elementId: string | null) => void;
  clearTableSelection: () => void;
  addTableElement: (
    tableData: any,
    position: { x: number; y: number }
  ) => string;
  updateTableElement: (elementId: string, tableData: any) => void;
  deleteTableElement: (elementId: string) => void;
  getTableElement: (elementId: string) => any;
  copyTableElement: (elementId: string) => string;

  // Infographics editing actions
  setSelectedInfographicsElement: (elementId: string | null) => void;
  clearInfographicsSelection: () => void;
  setInfographicsElement: (
    slideNumber: number,
    elementId: string,
    infographicsData: {
      svgContent?: string;
      dataUrl?: string;
      width: number;
      height: number;
      position: { x: number; y: number };
      placeholder?: boolean;
    }
  ) => void;
  updateInfographicsElement: (
    slideNumber: number,
    elementId: string,
    updates: Partial<{
      svgContent: string;
      dataUrl: string;
      width: number;
      height: number;
      position: { x: number; y: number };
      placeholder: boolean;
    }>
  ) => void;
  getInfographicsElement: (slideNumber: number, elementId: string) => any;
  deleteInfographicsElement: (slideNumber: number, elementId: string) => void;

  // Reset functions
  resetPresentation: () => void;
  startGeneration: () => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  addToHistory: (action: HistoryAction) => void;

  // Template actions
  setSlideTemplates: (templates: Record<string, string>) => void;
  setSlideTemplate: (templateId: string, html: string) => void;
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
  selectedTextElements: [], // Initialize empty array for multiple selection
  textEditorContent: "",
  textPosition: { x: 20, y: 60, rotation: 0 },
  textElementPositions: {}, // Initialize empty positions object
  textElementContents: {}, // Initialize empty contents object
  deletedTextElements: new Set<string>(), // Initialize empty set for deleted elements
  textElementStyles: {}, // Initialize empty styles object
  textStyle: {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left" as const,
    color: "#000000",
    x: 0,
    y: 0,
    rotation: 0,
    style: "normal" as const,
  },

  // Image editing state
  selectedImageElement: null,
  isImageAreaSelectionMode: false,
  imageAreaSelections: {},
  imageElements: {},

  // Table editing state
  selectedTableElement: null,
  tableElements: {},

  // Infographics editing state
  selectedInfographicsElement: null,
  infographicsElements: {},

  // History for undo/redo
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Template HTML storage
  slideTemplates: {},

  // Navigation functions
  scrollToSlideInCanvas: undefined,
};

// Function to load mock data from localStorage and initialize store
const loadMockDataFromStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    const generatedPresentationData = localStorage.getItem(
      "generatedPresentation"
    );
    if (!generatedPresentationData) return null;

    const mockData = JSON.parse(generatedPresentationData);
    console.log("📋 Loading mock presentation data:", mockData);

    return mockData;
  } catch (error) {
    console.error("❌ Failed to load mock data from localStorage:", error);
    return null;
  }
};

// Function to initialize text content from mock data
const initializeTextContentFromMockData = (mockData: any) => {
  const textElementContents: Record<string, string> = {};
  const textElementStyles: Record<string, any> = {};
  const imageElementsData: Record<number, Record<string, any>> = {};
  const infographicsElementsData: Record<number, Record<string, any>> = {};

  console.log("🔍 Processing mock data:", mockData);

  if (mockData?.data?.slides && Array.isArray(mockData.data.slides)) {
    mockData.data.slides.forEach((slide: any, index: number) => {
      const slideNumber = index + 1;
      console.log(`📄 Processing slide ${slideNumber}:`, slide);

      // Initialize slide title
      if (slide.title) {
        const titleElementId = `slide-${slideNumber}-title`;
        textElementContents[titleElementId] = slide.title;
        textElementStyles[titleElementId] = {
          fontSize: slide._fontSizes?.title || 24,
          fontWeight: "bold",
          textAlign: "left" as const,
          color: "#000000",
          x: 40,
          y: 40,
          style: "normal" as const,
        };
      }

      // Initialize slide subtitle
      if (slide.subtitle) {
        const subtitleElementId = `slide-${slideNumber}-subtitle`;
        textElementContents[subtitleElementId] = slide.subtitle;
        textElementStyles[subtitleElementId] = {
          fontSize: slide._fontSizes?.subtitle || 20,
          fontWeight: "normal",
          textAlign: "left" as const,
          color: "#333333",
          x: 40,
          y: 80,
          style: "normal" as const,
        };
      }

      // Initialize text1 (can be object with t1/t2 or string)
      if (slide.text1) {
        if (typeof slide.text1 === "object" && slide.text1.t1) {
          const text1TitleElementId = `slide-${slideNumber}-text1-title`;
          textElementContents[text1TitleElementId] = slide.text1.t1;
          textElementStyles[text1TitleElementId] = {
            fontSize: slide._fontSizes?.t1 || 18,
            fontWeight: "bold",
            textAlign: "left" as const,
            color: "#000000",
            x: 40,
            y: 130,
            style: "normal" as const,
          };
        }

        if (typeof slide.text1 === "object" && slide.text1.t2) {
          const text1ContentElementId = `slide-${slideNumber}-text1-content`;
          textElementContents[text1ContentElementId] = slide.text1.t2;
          textElementStyles[text1ContentElementId] = {
            fontSize: slide._fontSizes?.t2 || 16,
            fontWeight: "normal",
            textAlign: "left" as const,
            color: "#333333",
            x: 40,
            y: 160,
            style: "normal" as const,
          };
        } else if (typeof slide.text1 === "string") {
          // Handle text1 as plain string
          const text1ElementId = `slide-${slideNumber}-text1`;
          textElementContents[text1ElementId] = slide.text1;
          textElementStyles[text1ElementId] = {
            fontSize: slide._fontSizes?.t2 || 16,
            fontWeight: "normal",
            textAlign: "left" as const,
            color: "#333333",
            x: 40,
            y: 130,
            style: "normal" as const,
          };
        }
      }

      // Initialize text2 (can be object with t1/t2 or string)
      if (slide.text2) {
        if (typeof slide.text2 === "object" && slide.text2.t1) {
          const text2TitleElementId = `slide-${slideNumber}-text2-title`;
          textElementContents[text2TitleElementId] = slide.text2.t1;
          textElementStyles[text2TitleElementId] = {
            fontSize: slide._fontSizes?.t1 || 18,
            fontWeight: "bold",
            textAlign: "left" as const,
            color: "#000000",
            x: 40,
            y: 220,
            style: "normal" as const,
          };
        }

        if (typeof slide.text2 === "object" && slide.text2.t2) {
          const text2ContentElementId = `slide-${slideNumber}-text2-content`;
          textElementContents[text2ContentElementId] = slide.text2.t2;
          textElementStyles[text2ContentElementId] = {
            fontSize: slide._fontSizes?.t2 || 16,
            fontWeight: "normal",
            textAlign: "left" as const,
            color: "#333333",
            x: 40,
            y: 250,
            style: "normal" as const,
          };
        } else if (typeof slide.text2 === "string") {
          // Handle text2 as plain string
          const text2ElementId = `slide-${slideNumber}-text2`;
          textElementContents[text2ElementId] = slide.text2;
          textElementStyles[text2ElementId] = {
            fontSize: slide._fontSizes?.t2 || 16,
            fontWeight: "normal",
            textAlign: "left" as const,
            color: "#333333",
            x: 40,
            y: 220,
            style: "normal" as const,
          };
        }
      }

      // Initialize text3 (if it exists and has t1 and t2 properties)
      if (slide.text3) {
        if (slide.text3.t1) {
          const text3TitleElementId = `slide-${slideNumber}-text3-title`;
          textElementContents[text3TitleElementId] = slide.text3.t1;
          textElementStyles[text3TitleElementId] = {
            fontSize: slide._fontSizes?.t1 || 18,
            fontWeight: "bold",
            textAlign: "left" as const,
            color: "#000000",
            x: 40,
            y: 310,
            style: "normal" as const,
          };
        }

        if (slide.text3.t2) {
          const text3ContentElementId = `slide-${slideNumber}-text3-content`;
          textElementContents[text3ContentElementId] = slide.text3.t2;
          textElementStyles[text3ContentElementId] = {
            fontSize: slide._fontSizes?.t2 || 16,
            fontWeight: "normal",
            textAlign: "left" as const,
            color: "#333333",
            x: 40,
            y: 340,
            style: "normal" as const,
          };
        }
      }

      // Initialize images from _images array
      if (slide._images && Array.isArray(slide._images)) {
        const slideImageElements: Record<string, any> = {};
        slide._images.forEach((imageUrl: string, imageIndex: number) => {
          const elementId = `slide-${slideNumber}-image-${imageIndex}`;

          slideImageElements[elementId] = {
            id: elementId,
            src: imageUrl,
            alt: `Slide ${slideNumber} Image ${imageIndex + 1}`,
            width: 300,
            height: 200,
            position: {
              x: 400 + imageIndex * 20, // Offset multiple images
              y: 100 + imageIndex * 20,
            },
            placeholder: false,
          };
        });
        if (Object.keys(slideImageElements).length > 0) {
          imageElementsData[slideNumber] = slideImageElements;
        }
      }
    });
  } else if (mockData?.slides && Array.isArray(mockData.slides)) {
    // Fallback for the old format
    mockData.slides.forEach((slide: any, index: number) => {
      const slideNumber = index + 1;

      // Initialize slide title content
      if (slide.title) {
        const titleElementId = `slide-${slideNumber}-title`;
        textElementContents[titleElementId] = slide.title;
        textElementStyles[titleElementId] = {
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "left" as const,
          color: "#000000",
          x: 40,
          y: 40,
          style: "normal" as const,
        };
      }

      // Initialize slide text1 content
      if (slide.text1) {
        const text1ElementId = `slide-${slideNumber}-text1`;
        const textContent =
          typeof slide.text1 === "string"
            ? slide.text1
            : slide.text1?.t1 || slide.text1?.t2 || "";
        textElementContents[text1ElementId] = textContent;
        textElementStyles[text1ElementId] = {
          fontSize: 16,
          fontWeight: "normal",
          textAlign: "left" as const,
          color: "#333333",
          x: 40,
          y: 100,
          style: "normal" as const,
        };
      }

      // Initialize slide text2 content if it exists
      if (slide.text2) {
        const text2ElementId = `slide-${slideNumber}-text2`;
        textElementContents[text2ElementId] = slide.text2;
        textElementStyles[text2ElementId] = {
          fontSize: 14,
          fontWeight: "normal",
          textAlign: "left" as const,
          color: "#666666",
          x: 40,
          y: 180,
          style: "normal" as const,
        };
      }
    });
  }

  console.log("📝 Initialized text contents:", textElementContents);
  console.log("🎨 Initialized text styles:", textElementStyles);
  console.log("🖼️ Initialized image elements:", imageElementsData);
  console.log(
    "📊 Initialized infographics elements:",
    infographicsElementsData
  );

  return {
    textElementContents,
    textElementStyles,
    imageElements: imageElementsData,
    infographicsElements: infographicsElementsData,
  };
};

export const usePresentationStore = create<PresentationState>()(
  subscribeWithSelector((set, get) => {
    // Load mock data and initialize content on store creation
    const mockData = loadMockDataFromStorage();
    const {
      textElementContents,
      textElementStyles,
      imageElements,
      infographicsElements,
    } = mockData
      ? initializeTextContentFromMockData(mockData)
      : {
          textElementContents: {},
          textElementStyles: {},
          imageElements: {},
          infographicsElements: {},
        };

    // Update initial state with mock data if available
    const totalSlides =
      mockData?.data?.slides?.length ||
      mockData?.slides?.length ||
      initialState.totalSlides;
    const initialStateWithMockData = {
      ...initialState,
      totalSlides,
      generatedSlides:
        totalSlides > 0
          ? Array.from({ length: totalSlides }, (_, i) => i + 1)
          : initialState.generatedSlides,
      textElementContents,
      textElementStyles,
      imageElements,
      infographicsElements,
    };

    return {
      ...initialStateWithMockData,

      // Actions
      setCurrentSlide: (slide: number) => set({ currentSlide: slide }),

      setTotalSlides: (total: number) => set({ totalSlides: total }),

      addGeneratedSlide: (slide: number) =>
        set((state) => ({
          generatedSlides: [...state.generatedSlides, slide],
          // Убираем автоматическое переключение слайда
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

      setIsGenerating: (generating: boolean) =>
        set({ isGenerating: generating }),

      setShowFeedback: (show: boolean) => set({ showFeedback: show }),

      setSelectedElement: (element: string) =>
        set({ selectedElement: element }),

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

      // Navigation actions
      setScrollToSlideInCanvas: (
        scrollFn: ((slideNumber: number) => void) | undefined
      ) => set({ scrollToSlideInCanvas: scrollFn }),

      // Text editing actions
      setSelectedTextElement: (elementId: string | null) =>
        set({ selectedTextElement: elementId }),

      setSelectedTextElements: (elementIds: string[]) =>
        set({ selectedTextElements: elementIds }),

      addToSelectedTextElements: (elementId: string) =>
        set((state) => ({
          selectedTextElements: state.selectedTextElements.includes(elementId)
            ? state.selectedTextElements
            : [...state.selectedTextElements, elementId],
        })),

      removeFromSelectedTextElements: (elementId: string) =>
        set((state) => ({
          selectedTextElements: state.selectedTextElements.filter(
            (id) => id !== elementId
          ),
        })),

      clearSelectedTextElements: () => set({ selectedTextElements: [] }),

      toggleTextElementSelection: (elementId: string, isCtrlPressed: boolean) =>
        set((state) => {
          if (!isCtrlPressed) {
            // Single selection mode - clear all and select only this element
            return {
              selectedTextElement: elementId,
              selectedTextElements: [elementId],
            };
          } else {
            // Multi-selection mode
            const isCurrentlySelected =
              state.selectedTextElements.includes(elementId);
            let newSelectedElements: string[];

            if (isCurrentlySelected) {
              // Remove from selection
              newSelectedElements = state.selectedTextElements.filter(
                (id) => id !== elementId
              );
            } else {
              // Add to selection
              newSelectedElements = [...state.selectedTextElements, elementId];
            }

            return {
              selectedTextElement:
                newSelectedElements.length > 0
                  ? newSelectedElements[newSelectedElements.length - 1]
                  : null,
              selectedTextElements: newSelectedElements,
            };
          }
        }),

      setTextEditorContent: (content: string) =>
        set({ textEditorContent: content }),

      setTextPosition: (position: { x: number; y: number; rotation: number }) =>
        set({ textPosition: position }),

      setTextElementPosition: (
        elementId: string,
        position: { x: number; y: number }
      ) =>
        set((state) => {
          // Don't save history during drag - only when drag ends
          return {
            textElementPositions: {
              ...state.textElementPositions,
              [elementId]: position,
            },
          };
        }),

      finalizeTextElementPosition: (
        elementId: string,
        position: { x: number; y: number }
      ) =>
        set((state) => {
          // Record position change in history
          const previousPosition = state.textElementPositions[elementId] || {
            x: 0,
            y: 0,
          };

          get().addToHistory({
            type: "text_position",
            elementId,
            previousValue: previousPosition,
            newValue: position,
            timestamp: Date.now(),
          });

          return {
            textElementPositions: {
              ...state.textElementPositions,
              [elementId]: position,
            },
          };
        }),

      getTextElementPosition: (elementId: string) => {
        const state = get();
        return state.textElementPositions[elementId] || { x: 0, y: 0 };
      },

      setTextStyle: (style: Partial<PresentationState["textStyle"]>) =>
        set((state) => ({ textStyle: { ...state.textStyle, ...style } })),

      clearTextSelection: () =>
        set({
          selectedTextElement: null,
          selectedTextElements: [], // Clear multiple selection too
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
          isImageAreaSelectionMode: false,
        }),

      setImageAreaSelectionMode: (enabled: boolean) =>
        set({ isImageAreaSelectionMode: enabled }),

      startImageAreaSelection: (slideNumber: number, x: number, y: number) =>
        set((state) => ({
          imageAreaSelections: {
            ...state.imageAreaSelections,
            [slideNumber]: {
              startX: x,
              startY: y,
              endX: x,
              endY: y,
              isSelecting: true,
            },
          },
        })),

      updateImageAreaSelection: (slideNumber: number, x: number, y: number) =>
        set((state) => ({
          imageAreaSelections: {
            ...state.imageAreaSelections,
            [slideNumber]: state.imageAreaSelections[slideNumber]
              ? {
                  ...state.imageAreaSelections[slideNumber],
                  endX: x,
                  endY: y,
                }
              : {
                  startX: x,
                  startY: y,
                  endX: x,
                  endY: y,
                  isSelecting: true,
                },
          },
        })),

      finishImageAreaSelection: (slideNumber: number) =>
        set((state) => ({
          imageAreaSelections: {
            ...state.imageAreaSelections,
            [slideNumber]: state.imageAreaSelections[slideNumber]
              ? {
                  ...state.imageAreaSelections[slideNumber],
                  isSelecting: false,
                }
              : state.imageAreaSelections[slideNumber],
          },
        })),

      clearImageAreaSelection: (slideNumber?: number) =>
        set((state) => {
          if (slideNumber !== undefined) {
            const { [slideNumber]: removed, ...rest } =
              state.imageAreaSelections;
            return {
              imageAreaSelections: rest,
            };
          }
          return {
            imageAreaSelections: {},
            isImageAreaSelectionMode: false,
          };
        }),

      getImageAreaSelection: (slideNumber: number) => {
        const state = get();
        return state.imageAreaSelections[slideNumber] || null;
      },

      // Image element management actions
      addImageElement: (
        slideNumber: number,
        position: { x: number; y: number },
        size: { width: number; height: number }
      ) => {
        const imageId = `image-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        set((state) => ({
          imageElements: {
            ...state.imageElements,
            [slideNumber]: {
              ...state.imageElements[slideNumber],
              [imageId]: {
                id: imageId,
                position,
                width: size.width,
                height: size.height,
                placeholder: true,
                alt: "Image placeholder",
              },
            },
          },
        }));

        return imageId;
      },

      updateImageElement: (
        elementId: string,
        updates: Partial<PresentationState["imageElements"][number][string]>
      ) => {
        const currentSlide = get().currentSlide;
        set((state) => ({
          imageElements: {
            ...state.imageElements,
            [currentSlide]: {
              ...state.imageElements[currentSlide],
              [elementId]: {
                ...state.imageElements[currentSlide]?.[elementId],
                ...updates,
              },
            },
          },
        }));
      },

      deleteImageElement: (elementId: string) => {
        const currentSlide = get().currentSlide;
        set((state) => {
          const slideImages = { ...state.imageElements[currentSlide] };
          delete slideImages[elementId];
          return {
            imageElements: {
              ...state.imageElements,
              [currentSlide]: slideImages,
            },
          };
        });
      },

      getImageElement: (elementId: string) => {
        const state = get();
        const currentSlide = state.currentSlide;
        return state.imageElements[currentSlide]?.[elementId] || null;
      },

      copyImageElement: (elementId: string) => {
        console.log("Store: copyImageElement called for:", elementId);
        const state = get();
        const currentSlide = state.currentSlide;
        const originalElement = state.imageElements[currentSlide]?.[elementId];

        if (!originalElement) {
          console.log("Store: No image element found to copy:", elementId);
          return elementId;
        }

        // Generate new unique ID
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const newId = `image-${timestamp}-${randomId}`;

        // Copy element with offset position (much more noticeable offset - 80px down and right)
        const newPosition = {
          x: originalElement.position.x + 80,
          y: originalElement.position.y + 80,
        };

        console.log(
          "Store: Copying image element with new ID:",
          newId,
          "at position:",
          newPosition
        );
        console.log("Original element data:", originalElement);

        set((state) => ({
          imageElements: {
            ...state.imageElements,
            [currentSlide]: {
              ...state.imageElements[currentSlide],
              [newId]: {
                ...originalElement,
                id: newId,
                position: newPosition,
              },
            },
          },
          selectedImageElement: newId, // Automatically select the new copied element
        }));

        console.log("Store: Successfully copied image element, new ID:", newId);
        return newId;
      },

      // Table editing actions
      setSelectedTableElement: (elementId: string | null) =>
        set({ selectedTableElement: elementId }),

      clearTableSelection: () =>
        set({
          selectedTableElement: null,
        }),

      addTableElement: (tableData: any, position: { x: number; y: number }) => {
        const tableId = `table-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const currentSlide = get().currentSlide;

        set((state) => ({
          tableElements: {
            ...state.tableElements,
            [currentSlide]: {
              ...state.tableElements[currentSlide],
              [tableId]: {
                ...tableData,
                id: tableId,
                position,
              },
            },
          },
          selectedTableElement: tableId,
        }));

        return tableId;
      },

      updateTableElement: (elementId: string, tableData: any) => {
        const currentSlide = get().currentSlide;

        set((state) => {
          const currentElement = state.tableElements[currentSlide]?.[elementId];
          if (!currentElement) return state;

          // Preserve position and other critical properties when updating
          const updatedElement = {
            ...currentElement,
            ...tableData,
            // Always preserve the position unless explicitly being updated
            position: tableData.position || currentElement.position,
          };

          return {
            tableElements: {
              ...state.tableElements,
              [currentSlide]: {
                ...state.tableElements[currentSlide],
                [elementId]: updatedElement,
              },
            },
          };
        });
      },

      deleteTableElement: (elementId: string) => {
        const currentSlide = get().currentSlide;

        set((state) => {
          const slideElements = state.tableElements[currentSlide] || {};
          const { [elementId]: removed, ...remainingTables } = slideElements;

          return {
            tableElements: {
              ...state.tableElements,
              [currentSlide]: remainingTables,
            },
            selectedTableElement:
              state.selectedTableElement === elementId
                ? null
                : state.selectedTableElement,
          };
        });
      },

      getTableElement: (elementId: string) => {
        const state = get();
        const currentSlide = state.currentSlide;
        return state.tableElements[currentSlide]?.[elementId] || null;
      },

      copyTableElement: (elementId: string) => {
        console.log("Store: copyTableElement called for:", elementId);
        const state = get();
        const currentSlide = state.currentSlide;
        const originalElement = state.tableElements[currentSlide]?.[elementId];

        if (!originalElement) {
          console.log("Store: No table element found to copy:", elementId);
          return elementId;
        }

        // Generate new unique ID
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const newId = `table-${timestamp}-${randomId}`;

        // Copy element with offset position (80px down and right)
        const newPosition = {
          x: originalElement.position.x + 80,
          y: originalElement.position.y + 80,
        };

        console.log(
          "Store: Copying table element with new ID:",
          newId,
          "at position:",
          newPosition
        );
        console.log("Original element data:", originalElement);

        set((state) => ({
          tableElements: {
            ...state.tableElements,
            [currentSlide]: {
              ...state.tableElements[currentSlide],
              [newId]: {
                ...originalElement,
                id: newId,
                position: newPosition,
              },
            },
          },
          selectedTableElement: newId, // Automatically select the new copied element
        }));

        console.log("Store: Successfully copied table element, new ID:", newId);
        return newId;
      },

      // Infographics editing actions
      setSelectedInfographicsElement: (elementId: string | null) =>
        set({ selectedInfographicsElement: elementId }),

      clearInfographicsSelection: () =>
        set({
          selectedInfographicsElement: null,
        }),

      setInfographicsElement: (
        slideNumber: number,
        elementId: string,
        infographicsData: {
          svgContent?: string;
          dataUrl?: string;
          width: number;
          height: number;
          position: { x: number; y: number };
          placeholder?: boolean;
        }
      ) => {
        set((state) => ({
          infographicsElements: {
            ...state.infographicsElements,
            [slideNumber]: {
              ...state.infographicsElements[slideNumber],
              [elementId]: {
                id: elementId,
                ...infographicsData,
              },
            },
          },
        }));
      },

      updateInfographicsElement: (
        slideNumber: number,
        elementId: string,
        updates: Partial<{
          svgContent: string;
          dataUrl: string;
          width: number;
          height: number;
          position: { x: number; y: number };
          placeholder: boolean;
        }>
      ) => {
        set((state) => {
          const currentElement =
            state.infographicsElements[slideNumber]?.[elementId];
          if (!currentElement) return state;

          return {
            infographicsElements: {
              ...state.infographicsElements,
              [slideNumber]: {
                ...state.infographicsElements[slideNumber],
                [elementId]: {
                  ...currentElement,
                  ...updates,
                },
              },
            },
          };
        });
      },

      getInfographicsElement: (slideNumber: number, elementId: string) => {
        const state = get();
        return state.infographicsElements[slideNumber]?.[elementId] || null;
      },

      deleteInfographicsElement: (slideNumber: number, elementId: string) => {
        set((state) => {
          const slideElements = state.infographicsElements[slideNumber] || {};
          const { [elementId]: removed, ...remainingInfographics } =
            slideElements;

          return {
            infographicsElements: {
              ...state.infographicsElements,
              [slideNumber]: remainingInfographics,
            },
            selectedInfographicsElement:
              state.selectedInfographicsElement === elementId
                ? null
                : state.selectedInfographicsElement,
          };
        });
      },

      // Text element style management
      updateTextElementStyle: (
        elementId: string,
        style: Partial<PresentationState["textStyle"]>
      ) =>
        set((state) => {
          // Record style changes in history
          const currentStyle = state.textElementStyles[elementId] || {
            ...state.textStyle,
          };
          const hasSignificantChange = Object.keys(style).some(
            (key) => key !== "x" && key !== "y" && key !== "zIndex"
          );

          if (hasSignificantChange) {
            // Record only the changed properties
            const previousValues: any = {};
            Object.keys(style).forEach((key) => {
              previousValues[key] =
                currentStyle[key as keyof typeof currentStyle];
            });

            get().addToHistory({
              type: "text_style",
              elementId,
              previousValue: previousValues,
              newValue: style,
              timestamp: Date.now(),
            });
          }

          return {
            textElementStyles: {
              ...state.textElementStyles,
              [elementId]: { ...currentStyle, ...style },
            },
          };
        }),

      updateMultipleTextElementStyles: (
        elementIds: string[],
        style: Partial<PresentationState["textStyle"]>
      ) => {
        elementIds.forEach((elementId) => {
          get().updateTextElementStyle(elementId, style);
        });
      },

      getTextElementStyle: (elementId: string) => {
        const state = get();
        return (
          state.textElementStyles[elementId] || {
            ...state.textStyle,
            x: 0,
            y: 0,
            rotation: 0,
            zIndex: 1,
          }
        );
      },

      setTextElementContent: (elementId: string, content: string) =>
        set((state) => {
          // Record the change in history
          const previousContent = state.textElementContents[elementId] || "";

          if (previousContent !== content) {
            get().addToHistory({
              type: "text_content",
              elementId,
              previousValue: previousContent,
              newValue: content,
              timestamp: Date.now(),
            });
          }

          return {
            textElementContents: {
              ...state.textElementContents,
              [elementId]: content,
            },
          };
        }),

      setMultipleTextElementContent: (
        elementIds: string[],
        content: string
      ) => {
        elementIds.forEach((elementId) => {
          get().setTextElementContent(elementId, content);
        });
      },

      getTextElementContent: (elementId: string) => {
        const state = get();
        return state.textElementContents[elementId] || "";
      },

      deleteTextElement: (elementId: string) =>
        set((state) => {
          // Save current state to history before making changes
          get().saveToHistory();

          console.log("Store: Deleting element", elementId);
          console.log("Current deleted elements:", state.deletedTextElements);

          // Add element to deleted set
          const newDeletedElements = new Set(state.deletedTextElements);
          newDeletedElements.add(elementId);

          console.log("New deleted elements:", newDeletedElements);

          // Remove element styles, positions, and contents
          const { [elementId]: removedStyles, ...remainingStyles } =
            state.textElementStyles;
          const { [elementId]: removedPosition, ...remainingPositions } =
            state.textElementPositions;
          const { [elementId]: removedContent, ...remainingContents } =
            state.textElementContents;

          // Clear selection if this element was selected
          const newSelectedElement =
            state.selectedTextElement === elementId
              ? null
              : state.selectedTextElement;

          // Remove element from selectedTextElements array
          const newSelectedElements = state.selectedTextElements.filter(
            (id) => id !== elementId
          );

          return {
            deletedTextElements: newDeletedElements,
            textElementStyles: remainingStyles,
            textElementPositions: remainingPositions,
            textElementContents: remainingContents,
            selectedTextElement: newSelectedElement,
            selectedTextElements: newSelectedElements,
            textEditorContent: newSelectedElement
              ? state.textEditorContent
              : "",
          };
        }),

      copyTextElement: (elementId: string, slideNumber?: number) => {
        // Save current state to history before making changes
        get().saveToHistory();

        console.log(
          "Store: copyTextElement called for:",
          elementId,
          "on slide:",
          slideNumber
        );
        const state = get();
        const originalElement = state.textElementStyles[elementId];
        const originalPosition = state.textElementPositions[elementId];
        let originalContent = state.textElementContents[elementId];

        // If no content is stored, try to get default content for static elements
        if (!originalContent) {
          switch (elementId) {
            case "title-main":
              originalContent = "ЗАГОЛОВОК\nВ ДВЕ СТРОКИ";
              break;
            case "title-sub":
              originalContent = "Подзаголовок\nв две строки";
              break;
            case "content-main":
              originalContent = "ОСНОВНОЙ ЗАГОЛОВОК";
              break;
            case "content-sub":
              originalContent = "Подзаголовок для контентного слайда";
              break;
            default:
              if (elementId.includes(`slide-${slideNumber}-text`)) {
                originalContent = `Слайд ${slideNumber}`;
              } else {
                originalContent = "New text element";
              }
              break;
          }
        }

        console.log("Final content to copy:", originalContent);

        if (!originalElement) {
          console.log("Store: No element found to copy:", elementId);
          return elementId;
        }

        // Generate new unique ID with slide number if provided
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const newId = slideNumber
          ? `slide-${slideNumber}-text-${timestamp}-${randomId}`
          : `text-${timestamp}-${randomId}`;

        // Copy element with offset position (much more noticeable offset)
        const newPosition = originalPosition
          ? { x: originalPosition.x + 80, y: originalPosition.y + 80 }
          : { x: 100, y: 100 };

        console.log(
          "Store: Copying element with new ID:",
          newId,
          "at position:",
          newPosition
        );
        console.log("Original element data:", {
          styles: originalElement,
          position: originalPosition,
          content: originalContent,
        });

        set((state) => ({
          textElementStyles: {
            ...state.textElementStyles,
            [newId]: {
              ...originalElement,
              x: newPosition.x, // Ensure x position is in styles
              y: newPosition.y, // Ensure y position is in styles
            },
          },
          textElementPositions: {
            ...state.textElementPositions,
            [newId]: newPosition,
          },
          textElementContents: {
            ...state.textElementContents,
            [newId]: originalContent || "", // Copy the text content
          },
          selectedTextElement: newId, // Automatically select the new copied element
        }));

        console.log("Store: Successfully copied element, new ID:", newId);
        console.log("New element data:", {
          styles: get().textElementStyles[newId],
          position: get().textElementPositions[newId],
          content: get().textElementContents[newId],
        });
        return newId;
      },

      moveTextElementUp: (elementId: string) => {
        console.log("Store: moveTextElementUp called for:", elementId);
        const state = get();
        const currentPosition = state.textElementPositions[elementId];

        if (!currentPosition) {
          console.log("Store: No position found for element:", elementId);
          return;
        }

        // Move element up by 10 pixels
        const newPosition = {
          x: currentPosition.x,
          y: currentPosition.y - 10,
        };

        console.log(
          "Store: Moving element up from:",
          currentPosition,
          "to:",
          newPosition
        );

        // Use the existing setTextElementPosition function
        get().setTextElementPosition(elementId, newPosition);
      },

      moveTextElementDown: (elementId: string) => {
        console.log("Store: moveTextElementDown called for:", elementId);
        const state = get();
        const currentPosition = state.textElementPositions[elementId];

        if (!currentPosition) {
          console.log("Store: No position found for element:", elementId);
          return;
        }

        // Move element down by 10 pixels
        const newPosition = {
          x: currentPosition.x,
          y: currentPosition.y + 10,
        };

        console.log(
          "Store: Moving element down from:",
          currentPosition,
          "to:",
          newPosition
        );

        // Use the existing setTextElementPosition function
        get().setTextElementPosition(elementId, newPosition);
      },

      resetPresentation: () => set(initialState),

      startGeneration: () =>
        set({
          isGenerating: true,
          generatedSlides: [],
          currentSlide: 1,
          showFeedback: false,
        }),

      // Undo/Redo functions
      addToHistory: (action: HistoryAction) => {
        const state = get();

        console.log("Adding to history:", action);

        // Remove any history after current index (for when we're not at the end)
        const newHistory = state.history.slice(0, state.historyIndex + 1);

        // Add new action
        newHistory.push(action);

        console.log(
          "New history length:",
          newHistory.length,
          "Index:",
          state.historyIndex + 1
        );

        // Limit history size
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        } else {
          set({ historyIndex: state.historyIndex + 1 });
        }

        set({ history: newHistory });
      },

      saveToHistory: () => {
        // This is now deprecated - use addToHistory directly
        console.log(
          "saveToHistory called - this should be replaced with specific actions"
        );
      },

      undo: () => {
        const state = get();
        console.log(
          "Undo called - current index:",
          state.historyIndex,
          "history length:",
          state.history.length
        );

        if (state.historyIndex >= 0) {
          const actionToUndo = state.history[state.historyIndex];
          console.log("Undoing action:", actionToUndo);

          // Apply the reverse of the action
          switch (actionToUndo.type) {
            case "text_content":
              // If previousValue is empty or matches initial text,
              // we should remove from store to restore initial state
              if (!actionToUndo.previousValue) {
                set((state) => {
                  const {
                    [actionToUndo.elementId]: removed,
                    ...remainingContents
                  } = state.textElementContents;
                  return { textElementContents: remainingContents };
                });
              } else {
                set((state) => ({
                  textElementContents: {
                    ...state.textElementContents,
                    [actionToUndo.elementId]: actionToUndo.previousValue,
                  },
                }));
              }
              break;

            case "text_style":
              set((state) => ({
                textElementStyles: {
                  ...state.textElementStyles,
                  [actionToUndo.elementId]: {
                    ...state.textElementStyles[actionToUndo.elementId],
                    ...actionToUndo.previousValue,
                  },
                },
              }));
              break;

            case "text_position":
              set((state) => ({
                textElementPositions: {
                  ...state.textElementPositions,
                  [actionToUndo.elementId]: actionToUndo.previousValue,
                },
              }));
              break;
          }

          set({ historyIndex: state.historyIndex - 1 });
          console.log("Undo completed - new index:", state.historyIndex - 1);
        } else {
          console.log("Cannot undo - at beginning of history");
        }
      },

      redo: () => {
        const state = get();
        console.log(
          "Redo called - current index:",
          state.historyIndex,
          "history length:",
          state.history.length
        );

        if (state.historyIndex < state.history.length - 1) {
          const actionToRedo = state.history[state.historyIndex + 1];
          console.log("Redoing action:", actionToRedo);

          // Apply the action again
          switch (actionToRedo.type) {
            case "text_content":
              set((state) => ({
                textElementContents: {
                  ...state.textElementContents,
                  [actionToRedo.elementId]: actionToRedo.newValue,
                },
              }));
              break;

            case "text_style":
              set((state) => ({
                textElementStyles: {
                  ...state.textElementStyles,
                  [actionToRedo.elementId]: {
                    ...state.textElementStyles[actionToRedo.elementId],
                    ...actionToRedo.newValue,
                  },
                },
              }));
              break;

            case "text_position":
              set((state) => ({
                textElementPositions: {
                  ...state.textElementPositions,
                  [actionToRedo.elementId]: actionToRedo.newValue,
                },
              }));
              break;
          }

          set({ historyIndex: state.historyIndex + 1 });
          console.log("Redo completed - new index:", state.historyIndex + 1);
        } else {
          console.log("Cannot redo - at end of history");
        }
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex >= 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // Template actions
      setSlideTemplates: (templates: Record<string, string>) => {
        set((state) => ({
          ...state,
          slideTemplates: templates,
        }));
      },

      setSlideTemplate: (templateId: string, html: string) => {
        set((state) => ({
          ...state,
          slideTemplates: {
            ...state.slideTemplates,
            [templateId]: html,
          },
        }));
      },
    };
  })
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
