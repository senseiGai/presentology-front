"use client";

import { ConfirmDeleteModal } from "@/features/ConfirmDeletePopup/ui/ConfirmDeletePopup";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { MainLayout } from "@/shared/ui/MainLayout";
import { HomeBlock } from "@/widgets/HomeBlock/ui/HomeBlock";

export default function Registration() {
  return (
    <ProtectedRoute>
      <MainLayout isBg>
        <HomeBlock />
      </MainLayout>
      <ConfirmDeleteModal />
    </ProtectedRoute>
  );
}
