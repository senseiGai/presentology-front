"use client";

import { MainLayout } from "@/shared/ui";
import { ImprovingFileWizard } from "@/widgets/ImprovingFileWizard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

export default function ImprovingFileWizardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ImprovingFileWizard />
      </MainLayout>
    </ProtectedRoute>
  );
}
