/**
 * アプリプロバイダー統合
 * /apiアクセス関連のプロバイダーを統合
 */
import type { ReactNode } from "react";
import { ApiQueryProvider } from "./QueryProvider";

/**
 * AppProviders Props
 */
interface AppProvidersProps {
  children: ReactNode;
}

/**
 * アプリケーション用プロバイダー統合
 * API関連のプロバイダーを一元管理
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <ApiQueryProvider>{children}</ApiQueryProvider>;
}

/**
 * 個別プロバイダーのエクスポート
 * 必要に応じて個別に使用可能
 */
export { ApiQueryProvider } from "./QueryProvider";

/**
 * プロバイダー関連のユーティリティ
 */
export { queryKeys, queryUtils, apiQueryClient } from "./query-config";
