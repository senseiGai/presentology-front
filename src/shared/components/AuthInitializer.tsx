"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/shared/stores/useAuthStore";

interface AuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
