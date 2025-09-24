import { useRef } from "react";

interface UseStructureGenerationOptions {
  hasExistingSlides: boolean;
  onClearStructure?: () => void;
}

export const useStructureGeneration = (
  options: UseStructureGenerationOptions
) => {
  const { hasExistingSlides, onClearStructure } = options;
  const hasCalledApiRef = useRef(false);

  const shouldSkipGeneration = (brief: any) => {
    if (!brief) {
      return { skip: true, reason: "No brief provided" };
    }

    if (hasCalledApiRef.current) {
      return { skip: true, reason: "API already called" };
    }

    if (hasExistingSlides) {
      return { skip: true, reason: "Slides already exist" };
    }

    return { skip: false };
  };

  const markApiCalled = () => {
    hasCalledApiRef.current = true;
  };

  const resetApiFlag = () => {
    hasCalledApiRef.current = false;
  };

  const prepareForRegeneration = () => {
    if (onClearStructure) {
      onClearStructure();
    }
    resetApiFlag();
  };

  return {
    shouldSkipGeneration,
    markApiCalled,
    resetApiFlag,
    prepareForRegeneration,
    hasCalledApiRef,
  };
};
