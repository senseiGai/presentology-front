"use client";

import { SubscriptionPopup } from "@/entities/SubscriptionPopup/ui/SubscriptionPopup";
import { ConfirmDeleteModal } from "@/features/ConfirmDeletePopup/ui/ConfirmDeletePopup";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { MainLayout } from "@/shared/ui/MainLayout";
import { HomeBlock } from "@/widgets/HomeBlock/ui/HomeBlock";

import { useSubscriptionPopupStore } from "@/entities/SubscriptionPopup/model/use-subscription-popup-store";

export default function Registration() {
  const { isOpen, forceClose } = useSubscriptionPopupStore();

  return (
    <ProtectedRoute>
      <MainLayout isBg>
        <HomeBlock />
      </MainLayout>
      <ConfirmDeleteModal />
      <SubscriptionPopup
        isOpen={isOpen}
        onClose={forceClose}
        closeOnEscape={true}
        closeOnBackdropClick={true}
      />
    </ProtectedRoute>
  );
}
