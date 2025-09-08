import { useEffect } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { showPresentationFeedbackToast } from "@/shared/lib/toasts";

export const useSlideGeneration = () => {
  const {
    isGenerating,
    generatedSlides,
    totalSlides,
    addGeneratedSlide,
    setIsGenerating,
    setShowFeedback,
  } = usePresentationStore();

  useEffect(() => {
    if (isGenerating && generatedSlides.length < totalSlides) {
      const timer = setTimeout(() => {
        const nextSlide = generatedSlides.length + 1;
        addGeneratedSlide(nextSlide);
      }, 2000); // Generate each slide every 2 seconds

      return () => clearTimeout(timer);
    } else if (generatedSlides.length === totalSlides) {
      if (isGenerating) {
        showPresentationFeedbackToast();
      }
      setIsGenerating(false);
    }
  }, [
    isGenerating,
    generatedSlides.length,
    totalSlides,
    addGeneratedSlide,
    setIsGenerating,
    setShowFeedback,
  ]);

  return {
    isGenerating,
    generatedSlides,
    totalSlides,
  };
};
