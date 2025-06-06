/**
 * API設定
 * /apiアクセス専用の設定を管理
 */

/**
 * API基本設定
 */
export const API_CONFIG = {
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
} as const;

/**
 * APIエンドポイント定義
 */
export const API_ENDPOINTS = {
  // 認証関連
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    user: "/auth/user",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    csrf: "/csrf-token",
  },
} as const;

/**
 * HTTPステータスコード
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * APIレスポンスの共通型
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

/**
 * APIエラーレスポンスの型
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
