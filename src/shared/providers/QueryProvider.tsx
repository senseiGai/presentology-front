"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Время, в течение которого данные считаются свежими
            staleTime: 1000 * 60 * 5, // 5 минут
            // Время кэширования данных
            gcTime: 1000 * 60 * 30, // 30 минут (раньше было cacheTime)
            // Повторные попытки при ошибке
            retry: (failureCount, error: unknown) => {
              // Не повторяем для 401, 403, 404
              // safe-guard: inspect as any-like object
              const status = (error as any)?.response?.status;
              if (status === 401 || status === 403 || status === 404) {
                return false;
              }
              // Максимум 3 попытки для остальных ошибок
              return failureCount < 3;
            },
            // Интервал между повторными попытками
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Повторные попытки для мутаций
            retry: (failureCount, error: unknown) => {
              // Не повторяем для клиентских ошибок (4xx)
              const status = (error as any)?.response?.status;
              if (typeof status === "number" && status >= 400 && status < 500) {
                return false;
              }
              // Максимум 2 попытки для серверных ошибок
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Показываем DevTools только в development режиме */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
