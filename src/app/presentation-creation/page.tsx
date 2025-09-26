"use client";

import React, { useState } from "react";
import { MainLayout } from "@/shared/ui";
import { PresentationCreationWizard } from "@/widgets/PresentationCreationWizard/ui/PresentationCreationWizard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { AddSlideModal } from "@/entities/AddSlideModal";

export default function PresentationCreation() {
  // Используем локальное состояние для модального окна
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);

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
