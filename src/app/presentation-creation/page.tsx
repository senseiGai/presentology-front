"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/shared/ui";
import { PresentationCreationWizard } from "@/widgets/PresentationCreationWizard/ui/PresentationCreationWizard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { AddSlideModal } from "@/entities/AddSlideModal";
import { usePresentationCreationStore } from "@/widgets/PresentationCreationWizard/model/usePresentationCreationStore";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";

export default function PresentationCreation() {
  // Используем локальное состояние для модального окна
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);

  // Получаем функции reset из stores
  const { resetData } = usePresentationCreationStore();
  const { resetFlow } = usePresentationFlowStore();

  // Очищаем stores при инициализации страницы
  useEffect(() => {
    resetData();
    resetFlow();
    // Также очищаем localStorage от старых данных
    localStorage.removeItem("presentationCreationData");
    localStorage.removeItem("presentationFlowData");
    localStorage.removeItem("generatedPresentation");
  }, [resetData, resetFlow]);

  const handleAddSlide = (slideText: string) => {
    // Удаляем предыдущую сгенерированную презентацию перед созданием новой
    localStorage.removeItem("generatedPresentation");

    // TODO: Интегрировать с новым flow store если нужно
    console.log("Adding slide:", slideText);
    setIsAddSlideModalOpen(false);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <PresentationCreationWizard />
      </MainLayout>
      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setIsAddSlideModalOpen(false)}
        onAdd={handleAddSlide}
      />
    </ProtectedRoute>
  );
}
