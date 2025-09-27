"use client";

import React, { useState, useEffect } from "react";
import {
  ElementSelector,
  type ElementOption,
} from "@/features/ElementSelector";
import { TextEditorPanel } from "@/features/TextEditorPanel";
import { ImagePanel } from "@/features/ImagePanel";
import { TablePanel } from "@/features/TablePanel";
import { InfographicsPanel } from "@/features/InfographicsPanel";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface ToolsPanelProps {
  elementOptions: ElementOption[];
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ elementOptions }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [totalSlidesFromLocalStorage, setTotalSlidesFromLocalStorage] =
    useState(0);

  const {
    isGenerating,
    generatedSlides,
    totalSlides,
    setSelectedElement,
    selectedTextElement,
    selectedImageElement,
    selectedTableElement,
    selectedInfographicsElement,
    setSelectedTextElement,
    setSelectedImageElement,
    setSelectedTableElement,
    setSelectedInfographicsElement,
    clearImageAreaSelection,
    currentSlide,
    updateTextElementStyle,
    setTextElementContent,
    setTextElementPosition,
    addTableElement,
    addImageElement,
  } = usePresentationStore();

  useEffect(() => {
    setIsMounted(true);

    // Получаем totalSlides из localStorage generatedPresentation
    const getStoredTotalSlides = () => {
      console.log("🔍 [ToolsPanel] Checking localStorage for totalSlides");

      try {
        const generatedPresentation = localStorage.getItem(
          "generatedPresentation"
        );
        console.log(
          "📦 [ToolsPanel] generatedPresentation from localStorage:",
          generatedPresentation
        );

        if (generatedPresentation) {
          const data = JSON.parse(generatedPresentation);
          console.log("📊 [ToolsPanel] Parsed data:", data);

          const slidesFromData = data?.data?.slides;
          const slidesCount = slidesFromData?.length || 0;

          console.log("📋 [ToolsPanel] slides array:", slidesFromData);
          console.log("🔢 [ToolsPanel] slidesCount:", slidesCount);

          const totalWithTitle = slidesCount > 0 ? slidesCount + 1 : 0;
          console.log(
            "🎯 [ToolsPanel] Final totalSlides (with +1 for title):",
            totalWithTitle
          );

          return totalWithTitle;
        } else {
          console.log(
            "❌ [ToolsPanel] No generatedPresentation in localStorage"
          );
        }
      } catch (error) {
        console.error(
          "💥 [ToolsPanel] Error parsing generatedPresentation from localStorage:",
          error
        );
      }

      console.log("🔙 [ToolsPanel] Returning fallback value: 0");
      return 0;
    };

    // Устанавливаем начальное значение
    const initialTotal = getStoredTotalSlides();
    console.log(
      "🚀 [ToolsPanel] Setting initial totalSlidesFromLocalStorage:",
      initialTotal
    );
    setTotalSlidesFromLocalStorage(initialTotal);

    // Слушаем изменения localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "generatedPresentation") {
        setTotalSlidesFromLocalStorage(getStoredTotalSlides());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Также проверяем изменения через интервал (для изменений в том же окне)
    const interval = setInterval(() => {
      const newTotal = getStoredTotalSlides();
      setTotalSlidesFromLocalStorage((prev) =>
        prev !== newTotal ? newTotal : prev
      );
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId);

    // Reset previous selections
    if (selectedTextElement) {
      setSelectedTextElement(null);
    }
    if (selectedImageElement) {
      setSelectedImageElement(null);
    }
    if (selectedTableElement) {
      setSelectedTableElement(null);
    }
    if (selectedInfographicsElement) {
      setSelectedInfographicsElement(null);
    }

    // Clear image area selection only when switching away from image panel
    if (elementId !== "image") {
      clearImageAreaSelection(); // Clear all selections when not using image panel
    }

    // Create and set new selection based on element type
    if (elementId === "text") {
      // Create a new text element automatically with slide-specific ID
      const newTextElementId = `text-slide-${currentSlide}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Set initial position (center of slide)
      const initialPosition = { x: 100, y: 100 };

      // Set position first (required for rendering)
      setTextElementPosition(newTextElementId, initialPosition);

      // Create text element with default content
      updateTextElementStyle(newTextElementId, {
        fontSize: 16,
        fontWeight: "normal",
        textAlign: "left",
        color: "#000000",
        ...initialPosition,
        rotation: 0,
      });

      // Set initial content
      setTextElementContent(newTextElementId, "Новый текст");

      // Select the new element
      setSelectedTextElement(newTextElementId);
    } else if (elementId === "image") {
      // Create a new image element automatically
      const newImageElementId = addImageElement(
        currentSlide,
        { x: 100, y: 100 }, // Initial position
        { width: 200, height: 150 } // Default size
      );

      // Select the new image element
      setSelectedImageElement(newImageElementId);
    } else if (elementId === "table") {
      // Create a new table element automatically
      const tableData = {
        rows: 4,
        cols: 4,
        cells: Array(4)
          .fill(null)
          .map(() => Array(4).fill("")),
        style: {
          borderThickness: 1,
          borderColor: "#BBA2FE",
          textColor: "#000000",
          fontSize: 14,
          textAlign: "left" as const,
          textFormats: [],
        },
      };

      const initialPosition = { x: 100, y: 100 };
      const newTableId = addTableElement(tableData, initialPosition);
      setSelectedTableElement(newTableId);
    } else if (elementId === "chart") {
      setSelectedInfographicsElement("infographics-element");
    }
  };

  const isAnyElementSelected =
    selectedTextElement ||
    selectedImageElement ||
    selectedTableElement ||
    selectedInfographicsElement;

  return (
    <div
      className={`w-[274px] bg-white border-l-[1px] border-[#E9E9E9] ${
        isAnyElementSelected ? "p-0" : "p-4"
      } flex-shrink-0 flex flex-col`}
      style={{
        boxShadow: "-4px 0px 4px 0px #BBA2FE1A",
        height: "calc(100vh - 80px)",
      }}
    >
      {isMounted && isGenerating && (
        <div className="mb-6 flex-shrink-0">
          <div className="text-[14px] font-regular text-[#8F8F92] mb-2">
            Генерация слайдов
          </div>
          <div className="text-[14px] text-[#6B7280] mb-4">
            <span className="text-[#BBA2FE] font-medium text-[47px]">
              {(() => {
                const finalTotalSlides =
                  totalSlidesFromLocalStorage || totalSlides;
                console.log("🎨 [ToolsPanel] Rendering totalSlides:", {
                  totalSlidesFromLocalStorage,
                  totalSlides,
                  finalTotalSlides,
                  isGenerating,
                });
                return finalTotalSlides;
              })()}{" "}
              / {totalSlidesFromLocalStorage || totalSlides}
            </span>
          </div>
        </div>
      )}

      {isMounted && !isGenerating && (
        <div className="flex-1 overflow-y-auto">
          {selectedTextElement ? (
            <TextEditorPanel />
          ) : selectedImageElement ? (
            <ImagePanel />
          ) : selectedTableElement ? (
            <TablePanel />
          ) : selectedInfographicsElement ? (
            <InfographicsPanel />
          ) : (
            <ElementSelector
              elements={elementOptions}
              onElementSelect={handleElementSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};
