"use client";

import { MainLayout } from "@/shared/ui";
import { PresentationCreationWizard } from "@/widgets/PresentationCreationWizard/ui/PresentationCreationWizard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { AddSlideModal } from "@/entities/AddSlideModal";
import { usePresentationCreationStore } from "@/widgets/PresentationCreationWizard/model/usePresentationCreationStore";

export default function PresentationCreation() {
  const { isAddSlideModalOpen, setAddSlideModalOpen, addSlide } =
    usePresentationCreationStore();

  return (
    <ProtectedRoute>
      <MainLayout>
        <PresentationCreationWizard />
      </MainLayout>
      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setAddSlideModalOpen(false)}
        onAdd={addSlide}
      />
    </ProtectedRoute>
  );
}
