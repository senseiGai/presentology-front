import { create } from "zustand";
import { PresentationData, PresentationCreationStep } from "./types";

interface PresentationCreationState {
  currentStep: PresentationCreationStep;
  presentationData: PresentationData;
  isAddSlideModalOpen: boolean;

  // Actions
  setCurrentStep: (step: PresentationCreationStep) => void;
  updatePresentationData: (data: Partial<PresentationData>) => void;
  resetData: () => void;
  setAddSlideModalOpen: (isOpen: boolean) => void;
  addSlide: (slideText: string) => void;
}

const initialPresentationData: PresentationData = {
  uploadedFiles: [],
  topic: "",
  goal: "",
  audience: "",
  context: "",
  materials: [],
  slideCount: 8,
  textVolume: "medium",
  imageSource: "mixed",
  addedSlides: [],
};

export const usePresentationCreationStore = create<PresentationCreationState>(
  (set) => ({
    currentStep: "file-upload",
    presentationData: initialPresentationData,
    isAddSlideModalOpen: false,

    setCurrentStep: (step) => set({ currentStep: step }),

    updatePresentationData: (data) =>
      set((state) => ({
        presentationData: { ...state.presentationData, ...data },
      })),

    resetData: () =>
      set({
        currentStep: "file-upload",
        presentationData: initialPresentationData,
        isAddSlideModalOpen: false,
      }),

    setAddSlideModalOpen: (isOpen) => set({ isAddSlideModalOpen: isOpen }),

    addSlide: (slideText) =>
      set((state) => ({
        presentationData: {
          ...state.presentationData,
          addedSlides: [
            ...(state.presentationData.addedSlides || []),
            {
              title: "Заголовок",
              description: slideText,
            },
          ],
        },
      })),
  })
);
