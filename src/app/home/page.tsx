"use client";

import { SubscriptionPopup } from "@/entities/SubscriptionPopup/ui/SubscriptionPopup";
import { ConfirmDeleteModal } from "@/features/ConfirmDeletePopup/ui/ConfirmDeletePopup";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { MainLayout } from "@/shared/ui/MainLayout";
import { HomeBlock } from "@/widgets/HomeBlock/ui/HomeBlock";
import { CancelSubPopup, OfferPopup } from "@/entities/SubscriptionPopup";

import { useSubscriptionPopupStore } from "@/entities/SubscriptionPopup/model/use-subscription-popup-store";
import { useSubscriptionStore } from "@/shared/stores";

export default function Registration() {
  const { isOpen, forceClose } = useSubscriptionPopupStore();
  const {
    showCancelPopup,
    showOfferPopup,
    closeCancelPopup,
    closeOfferPopup,
    cancelSubscription,
    activateDiscount,
    stayWithDiscount,
  } = useSubscriptionStore();

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
      <CancelSubPopup
        isOpen={showCancelPopup}
        onConfirm={stayWithDiscount}
        onCancel={cancelSubscription}
        onDismiss={closeCancelPopup}
      />

      <OfferPopup
        isOpen={showOfferPopup}
        onSubscribe={() => {
          activateDiscount();
          console.log("Подписка подключена со скидкой!");
        }}
        onClose={closeOfferPopup}
      />
    </ProtectedRoute>
  );
}
