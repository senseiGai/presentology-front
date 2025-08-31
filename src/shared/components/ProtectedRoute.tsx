"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/stores/auth-store";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setIsInitialized(true);

      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to:", redirectTo);
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, _hasHydrated, router, redirectTo]);

  // Показываем загрузку пока не завершилась гидратация
  if (!_hasHydrated || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
          <p className="mt-4 text-[#BEBEC0]">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован, не отрисовываем контент
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
