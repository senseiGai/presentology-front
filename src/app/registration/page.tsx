import { MainLayout } from "@/shared/ui/MainLayout";
import { RegistrationBlock } from "@/widgets/RegistrationBlock/ui/RegistrationBlock";
import PublicRoute from "@/shared/components/PublicRoute";

export default function Registration() {
  return (
    <PublicRoute>
      <MainLayout>
        <RegistrationBlock />
      </MainLayout>
    </PublicRoute>
  );
}
