/**
 * React Query設定プロバイダー
 * /apiアクセス用のReact Query設定
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { ENV_CONFIG } from "../config/env";
import { apiQueryClient } from "./query-config";

/**
 * QueryProvider Props
 */
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * API用Query Provider
 * /apiアクセス専用のReact Query設定を提供
 */
export function ApiQueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={apiQueryClient}>
      {children}
      {ENV_CONFIG.isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
