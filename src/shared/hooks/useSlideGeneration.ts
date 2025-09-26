import { useEffect, useRef } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";
import { showPresentationFeedbackToast } from "@/shared/lib/toasts";
import { generateSlidesForStructure } from "@/shared/api/presentation-generation";
import { toast } from "sonner";

export const useSlideGeneration = () => {
  const {
    isGenerating,
    generatedSlides,
    totalSlides,
    addGeneratedSlide,
    setAllSlidesGenerated,
    setIsGenerating,
    setShowFeedback,
    startGeneration,
    setTotalSlides,
    reloadDataFromStorage,
  } = usePresentationStore();

  const hasInitialized = useRef(false);

  // Auto-start generation on mount
  useEffect(() => {
    console.log("🚀 useSlideGeneration useEffect triggered");
    console.log("📊 hasInitialized.current:", hasInitialized.current);

    if (!hasInitialized.current) {
      console.log("✅ Initializing slide generation for the first time");
      hasInitialized.current = true;

      // Try to get presentation data from localStorage
      const structureData = localStorage.getItem("presentationStructure");
      const briefData = localStorage.getItem("presentationBrief");

      console.log("📦 localStorage structureData:", structureData);
      console.log("📦 localStorage briefData:", briefData);

      // Check if we already have generated presentation data in localStorage
      const generatedPresentationData = localStorage.getItem(
        "generatedPresentation"
      );

      if (generatedPresentationData) {
        console.log(
          "📋 Found generated presentation data, skipping generation"
        );
        const mockData = JSON.parse(generatedPresentationData);
        const totalSlides =
          mockData?.data?.slides?.length || mockData?.slides?.length || 5;
        console.log(
          `🎯 Setting total slides to ${totalSlides} and marking all as generated`
        );
        setTotalSlides(totalSlides);
        // Mark all slides as generated since we have the data
        setAllSlidesGenerated(totalSlides);
        console.log(
          `✅ All slides marked as generated: [${Array.from(
            { length: totalSlides },
            (_, i) => i + 1
          ).join(", ")}]`
        );
        return;
      }

      if (structureData || briefData) {
        console.log(
          "🎯 Found data in localStorage, calling handleApiGeneration"
        );
        handleApiGeneration(structureData, briefData);
      } else {
        console.log("⚠️ No data in localStorage, using mock generation");
        // Since we want to test API, let's create test data
        console.log("🧪 Creating test data for API generation");
        const testStructureData = JSON.stringify({
          uiSlides: [
            {
              title: "Проблема",
              summary: "Разрозненные источники\nМедленные отчёты",
            },
            {
              title: "Решение",
              summary: "Единая витрина\nАвтоотчёты и алерты",
            },
            {
              title: "Экономический эффект",
              summary: "~18% времени на отчёты\n+12% к конверсии",
            },
          ],
        });

        const testBriefData = JSON.stringify({
          topic: "SaaS-платформа аналитики",
          audience: "Коммерческие директора",
          goal: "Заинтересовать демо",
        });

        console.log("🧪 Test structure data:", testStructureData);
        console.log("🧪 Test brief data:", testBriefData);

        handleApiGeneration(testStructureData, testBriefData);
      }
    } else {
      console.log("⏭️ Already initialized, skipping");
    }
  }, [startGeneration]);

  const handleApiGeneration = async (
    structureData: string | null,
    briefData: string | null
  ) => {
    console.log("🎯 handleApiGeneration called");
    console.log("📥 structureData:", structureData);
    console.log("📥 briefData:", briefData);

    try {
      // Удаляем предыдущую сгенерированную презентацию перед созданием новой
      localStorage.removeItem("generatedPresentation");

      console.log("🔄 Setting isGenerating to true");
      setIsGenerating(true);

      // Parse the stored data
      let uiSlides = [];
      let brief = null;

      if (structureData) {
        console.log("📦 Parsing structure data");
        const parsedStructure = JSON.parse(structureData);
        console.log("📦 Parsed structure:", parsedStructure);
        uiSlides = parsedStructure.uiSlides || [];
        console.log("📦 Extracted uiSlides:", uiSlides);

        // Устанавливаем количество слайдов на основе структуры
        const slidesCount = uiSlides.length;
        console.log("📊 Setting total slides to:", slidesCount);
        setTotalSlides(slidesCount);
      }

      if (briefData) {
        console.log("📦 Parsing brief data");
        brief = JSON.parse(briefData);
        console.log("📦 Parsed brief:", brief);
      }

      // Default structure if no data
      if (uiSlides.length === 0) {
        console.log("⚠️ No uiSlides found, using default structure");
        uiSlides = [
          {
            title: "Введение",
            summary: "Вводный слайд презентации",
          },
          {
            title: "Основная часть",
            summary: "Основное содержание",
          },
          {
            title: "Заключение",
            summary: "Выводы и заключение",
          },
        ];
        console.log("📦 Default uiSlides:", uiSlides);
      }

      const requestData = {
        deckTitle: brief?.topic || "SaaS-платформа аналитики",
        uiSlides,
        userData: {
          topic: brief?.topic || "Аналитика продаж",
          audience: brief?.audience || "Коммерческие директора",
          goal: brief?.goal || "Заинтересовать демо",
          files: brief?.files || [],
        },
        volume: "Средний",
        imageSource: "Смешанный",
        seed: 123,
        concurrency: 5,
      };

      console.log("🔍 Final requestData structure:");
      console.log("🔍 deckTitle:", requestData.deckTitle);
      console.log(
        "🔍 uiSlides:",
        JSON.stringify(requestData.uiSlides, null, 2)
      );
      console.log(
        "🔍 userData:",
        JSON.stringify(requestData.userData, null, 2)
      );
      console.log("🔍 userData.topic:", requestData.userData.topic);
      console.log("🔍 userData.audience:", requestData.userData.audience);
      console.log("🔍 userData.goal:", requestData.userData.goal);
      console.log("🔍 Full requestData:", JSON.stringify(requestData, null, 2));

      console.log("🚀 Sending request to API with data:", requestData);
      console.log("🌐 About to call generateSlidesForStructure");

      const response = await generateSlidesForStructure(requestData);

      console.log("📨 API Response received:", response);

      if (response.success && response.data?.slides) {
        console.log("✅ API generation successful!");
        console.log("📊 Generated slides:", response.data.slides);
        toast.success("Слайды успешно сгенерированы!");

        // Save API data to localStorage
        localStorage.setItem(
          "generatedPresentation",
          JSON.stringify(response.data)
        );

        // Reload store with new data from localStorage
        reloadDataFromStorage();

        // Set slides as generated without starting animation
        const slidesCount = response.data.slides.length;
        setTotalSlides(slidesCount);
        setAllSlidesGenerated(slidesCount);
        setIsGenerating(false); // ОСТАНАВЛИВАЕМ ГЕНЕРАЦИЮ!
      } else {
        console.log("❌ API generation failed:", response.error);
        throw new Error(response.error || "Ошибка при генерации слайдов");
      }
    } catch (error) {
      console.error("💥 Error in handleApiGeneration:", error);
      console.error("💥 Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
      });
      toast.error(
        "Произошла ошибка при генерации слайдов. Используется демо-режим."
      );
      // Fallback to mock generation only if no data exists
      console.log("🔄 Falling back to mock generation");

      // Check if we have existing mock data, if not start fresh generation
      const existingData = localStorage.getItem("generatedPresentation");
      if (!existingData) {
        console.log("🆕 No existing data, starting fresh generation");
        startGeneration();
      } else {
        console.log("📋 Using existing mock data");
        const mockData = JSON.parse(existingData);
        const totalSlides =
          mockData?.data?.slides?.length || mockData?.slides?.length || 5;
        setTotalSlides(totalSlides);
        setAllSlidesGenerated(totalSlides);
        setIsGenerating(false); // ОСТАНАВЛИВАЕМ ГЕНЕРАЦИЮ!
      }
    }
  };

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
    setAllSlidesGenerated,
    setIsGenerating,
    setShowFeedback,
    reloadDataFromStorage,
  ]);

  return {
    isGenerating,
    generatedSlides,
    totalSlides,
  };
};
