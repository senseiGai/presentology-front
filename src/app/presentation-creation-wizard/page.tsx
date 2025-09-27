"use client";

import { MainLayout } from "@/shared/ui";
import { PresentationCreationWizard as PresentationCreationWizardComponent } from "@/widgets/PresentationCreationWizard/ui/PresentationCreationWizard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { AddSlideModal } from "@/entities/AddSlideModal";
import { usePresentationCreationStore } from "@/widgets/PresentationCreationWizard/model/usePresentationCreationStore";

export default function PresentationCreationWizardPage() {
  const { isAddSlideModalOpen, setAddSlideModalOpen, addSlide } =
    usePresentationCreationStore();

  return (
    <ProtectedRoute>
      <MainLayout fullWidth={true}>
        <PresentationCreationWizardComponent />
      </MainLayout>
      <AddSlideModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setAddSlideModalOpen(false)}
        onAdd={addSlide}
      />
    </ProtectedRoute>
  );
}
