import { MainLayout } from "@/shared/ui/MainLayout";
import { LoginBlock } from "@/widgets/LoginBlock/ui/LoginBlock";
import PublicRoute from "@/shared/components/PublicRoute";

export default function Login() {
  return (
    <PublicRoute>
      <MainLayout>
        <LoginBlock />
      </MainLayout>
    </PublicRoute>
  );
}
