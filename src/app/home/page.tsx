"use client";

import { ConfirmDeleteModal } from "@/features/ConfirmDeletePopup/ui/ConfirmDeletePopup";
import { MainLayout } from "@/shared/ui/MainLayout";
import { HomeBlock } from "@/widgets/HomeBlock/ui/HomeBlock";
import { SubscriptionPopup } from "@/entities/SubscriptionPopup/ui/SubscriptionPopup";
import { useSubscriptionPopupStore } from "@/entities/SubscriptionPopup/model/use-subscription-popup-store";

export default function Registration() {
  const { isOpen, closePopup } = useSubscriptionPopupStore();
  return (
    <>
      <MainLayout isBg>
        <HomeBlock />
      </MainLayout>
      <ConfirmDeleteModal />
      <SubscriptionPopup
        isOpen={isOpen}
        onClose={closePopup}
        closeOnEscape={true}
        closeOnBackdropClick={true}
      />
    </>
  );
}
