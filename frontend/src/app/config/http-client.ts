/**
 * HTTPクライアント設定
 * /apiアクセス専用のAxiosクライアント
 */
import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  API_CONFIG,
  HTTP_STATUS,
  type ApiResponse,
  type ApiErrorResponse,
} from "./api";
import { ENV_CONFIG } from "./env";

/**
 * APIクライアントインスタンス
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: ENV_CONFIG.API_URL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * リクエストインターセプター
 * 全てのAPIリクエストに共通処理を適用
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // デバッグログ
    if (ENV_CONFIG.enableApiLogging) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
      });
    }

    // CSRFトークンの設定（必要に応じて）
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error: AxiosError) => {
    if (ENV_CONFIG.enableErrorLogging) {
      console.error("❌ Request Error:", error);
    }
    return Promise.reject(error);
  }
);

/**
 * レスポンスインターセプター
 * 全てのAPIレスポンスに共通処理を適用
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // デバッグログ
    if (ENV_CONFIG.enableApiLogging) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // エラーログ
    if (ENV_CONFIG.enableErrorLogging) {
      console.error("❌ API Error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        errors: error.response?.data?.errors,
      });
    }

    // 認証エラーの場合の処理
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // 認証トークンのクリア（必要に応じて）
      console.warn("🔐 Unauthorized access - clearing auth state");
      // ここで認証状態をクリアする処理を追加可能
    }

    // ネットワークエラーの処理
    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API共通型定義
 */
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorLogging?: boolean;
}

/**
 * 共通APIメソッド
 */
export const apiMethods = {
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    httpClient.get<ApiResponse<T>>(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.post<ApiResponse<T>>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.put<ApiResponse<T>>(url, data, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.patch<ApiResponse<T>>(url, data, config),

  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    httpClient.delete<ApiResponse<T>>(url, config),
};

/**
 * CSRFトークン取得
 */
export async function initializeCsrfToken(): Promise<void> {
  try {
    await httpClient.get("/csrf-token");
    console.log("✅ CSRF token initialized");
  } catch (error) {
    console.warn("⚠️ Failed to initialize CSRF token:", error);
  }
}
