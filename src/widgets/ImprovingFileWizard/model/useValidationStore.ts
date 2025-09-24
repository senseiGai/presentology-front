import { create } from "zustand";
import { PresentationData, PresentationCreationStep } from "./types";

interface ValidationState {
  // Validation states for each step
  isFileUploadValid: boolean;
  isDescriptionValid: boolean;
  isStyleValid: boolean;

  // Actions
  validateFileUpload: (data: PresentationData) => void;
  validateDescription: (data: PresentationData) => void;
  validateStyle: (data: PresentationData) => void;
  validateAllSteps: (data: PresentationData) => void;
  canProceedToNext: (
    currentStep: PresentationCreationStep,
    data: PresentationData
  ) => boolean;
  isStepCompleted: (
    step: PresentationCreationStep,
    data: PresentationData
  ) => boolean;
  resetValidation: () => void;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  isFileUploadValid: false,
  isDescriptionValid: false,
  isStyleValid: false,

  validateFileUpload: (data: PresentationData) => {
    const isValid = !!data.uploadedFiles?.length;
    set({ isFileUploadValid: isValid });
  },

  validateDescription: (data: PresentationData) => {
    const isValid = !!(
      data.topic?.trim() &&
      data.goal?.trim() &&
      data.audience?.trim()
    );
    set({ isDescriptionValid: isValid });
  },

  validateStyle: (data: PresentationData) => {
    const isValid = !!(data.selectedTemplate || data.selectedStyle);
    set({ isStyleValid: isValid });
  },

  validateAllSteps: (data: PresentationData) => {
    const { validateFileUpload, validateDescription, validateStyle } = get();

    validateFileUpload(data);
    validateDescription(data);
    validateStyle(data);
  },

  canProceedToNext: (
    currentStep: PresentationCreationStep,
    data: PresentationData
  ) => {
    const { isFileUploadValid, isDescriptionValid, isStyleValid } = get();

    switch (currentStep) {
      case "file-upload":
        return !!data.uploadedFiles?.length;
      case "description":
        return !!(
          data.topic?.trim() &&
          data.goal?.trim() &&
          data.audience?.trim()
        );
      case "style":
        return !!(data.selectedTemplate || data.selectedStyle);
      default:
        return false;
    }
  },

  isStepCompleted: (step: PresentationCreationStep, data: PresentationData) => {
    switch (step) {
      case "file-upload":
        return !!data.uploadedFiles?.length;
      case "description":
        return !!(
          data.topic?.trim() &&
          data.goal?.trim() &&
          data.audience?.trim()
        );
      case "style":
        return !!(data.selectedTemplate || data.selectedStyle);
      default:
        return false;
    }
  },

  resetValidation: () => {
    set({
      isFileUploadValid: false,
      isDescriptionValid: false,
      isStyleValid: false,
    });
  },
}));
