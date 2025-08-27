import { MainLayout } from "@/shared/ui/MainLayout";
import { ResetPasswordBlock } from "@/widgets/ResetPassword/ui/ResetPasswordBlock";
import { Suspense } from "react";

export default function ResetPassword() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-lg">Загрузка...</p>
            </div>
          </div>
        }
      >
        <ResetPasswordBlock />
      </Suspense>
    </MainLayout>
  );
}
