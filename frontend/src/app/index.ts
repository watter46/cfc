/**
 * App設定のメインエクスポート
 * /apiアクセス関連の設定を一元管理
 */

// 設定関連
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from "./config/api";
export { ENV_CONFIG, validateEnvironment } from "./config/env";
export {
  httpClient,
  apiMethods,
  initializeCsrfToken,
} from "./config/http-client";

// プロバイダー関連
export {
  AppProviders,
  ApiQueryProvider,
  queryKeys,
  queryUtils,
  apiQueryClient,
} from "./providers/index";

// ルーター関連
export { AppRouter, ProtectedRoute, AuthGuard, routes } from "./router/index";

// 型定義
export type { ApiResponse, ApiErrorResponse } from "./config/api";
export type { RequestConfig } from "./config/http-client";

/**
 * アプリケーション初期化
 * 環境設定の検証とCSRFトークンの初期化
 */
export async function initializeApp(): Promise<void> {
  const { validateEnvironment } = await import("./config/env");
  const { initializeCsrfToken } = await import("./config/http-client");

  try {
    console.log("🚀 Initializing application...");

    // 環境設定の検証
    validateEnvironment();

    // CSRFトークンの初期化
    await initializeCsrfToken();

    console.log("✅ Application initialized successfully");
  } catch (error) {
    console.error("❌ Application initialization failed:", error);
    throw error;
  }
}
