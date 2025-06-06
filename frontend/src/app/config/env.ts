/**
 * 環境変数管理
 * /apiアクセス用の環境設定
 */

/**
 * 環境変数の型定義
 */
interface EnvironmentVariables {
  VITE_API_URL: string;
  VITE_BACKEND_URL: string;
  NODE_ENV: "development" | "production" | "test";
}

/**
 * 環境変数の取得と検証
 */
function getEnvVar(
  name: keyof EnvironmentVariables,
  defaultValue?: string
): string {
  const value = (import.meta.env[name] as string) || defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

/**
 * アプリケーション環境設定
 */
export const ENV_CONFIG = {
  // API関連
  API_URL: getEnvVar("VITE_API_URL", "/api"),
  BACKEND_URL: getEnvVar("VITE_BACKEND_URL", "http://172.17.0.1:8000"),

  // 環境判定
  NODE_ENV: getEnvVar(
    "NODE_ENV",
    "development"
  ) as EnvironmentVariables["NODE_ENV"],

  // 開発環境判定
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // デバッグモード
  enableApiLogging: import.meta.env.DEV,
  enableErrorLogging: true,
} as const;

/**
 * 環境設定の検証
 */
export function validateEnvironment(): void {
  try {
    // 必要な環境変数の存在確認
    getEnvVar("VITE_API_URL", "/api");
    getEnvVar("VITE_BACKEND_URL", "http://172.17.0.1:8000");

    console.log("✅ Environment configuration validated successfully");

    if (ENV_CONFIG.enableApiLogging) {
      console.log("🔧 API Configuration:", {
        API_URL: ENV_CONFIG.API_URL,
        BACKEND_URL: ENV_CONFIG.BACKEND_URL,
        NODE_ENV: ENV_CONFIG.NODE_ENV,
      });
    }
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    throw error;
  }
}
