import { ENV_CONFIG } from "./env";

/**
 * API基本設定
 * ENV_CONFIGからBACKEND_URLを参照します
 * .env例: VITE_BACKEND_URL=http://localhost:8000
 * Laravel Sanctumトークン認証を使用
 */
export const API_CONFIG = {
  baseURL: ENV_CONFIG.BACKEND_URL,
  timeout: 10000,
} as const;

/**
 * APIエンドポイント定義
 */
export const API_ENDPOINTS = {
  // 認証関連
  auth: {
    signin: "/user/auth/signin",
    signup: "/user/auth/signup",
    signout: "/user/auth/signout",
    me: "/user/auth/me",
    forgotPassword: "/user/auth/forgot-password",
    resetPassword: "/user/auth/reset-password",
    csrf: "/sanctum/csrf-cookie", // Laravel Sanctum CSRF保護用
    // ソーシャルログイン関連
    social: {
      google: {
        redirect: "/user/auth/google/redirect",
        callback: "/auth/callback",
      },
      x: {
        redirect: "/user/auth/x/redirect",
        callback: "/auth/callback",
      },
    },
  },

  // 試合関連（認証済みユーザー用）
  matches: {
    list: "/matches", // 認証済みユーザー用の試合一覧
    detail: (id: number) => `/matches/${id}`, // 試合詳細
  },

  // ゲスト用パブリックAPI
  guest: {
    matches: {
      list: "/",
    },
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

/**
 * ソーシャルログインコールバック用の型定義
 */
export interface SocialCallbackParams {
  error?: string;
  error_description?: string;
}

/**
 * ソーシャルログイン成功時のレスポンス型（Cookie-based認証）
 */
export interface SocialLoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * 試合一覧のセレクタ（フィルタリング用）の型定義
 */
export interface MatchSelectors {
  seasons: {
    id: number;
    year: string; // year表記に変更
  }[];
  my_clubs: {
    id: number;
    name: string;
    logo_path: string;
  }[];
  leagues: {
    id: number;
    name: string;
    logo_path: string;
  }[];
}

/**
 * APIルート（/api付き）用のURLを組み立てる
 * @param endpoint エンドポイントのパス（例: "/matches"）
 * @returns ベースURL + /api + endpoint
 */
export function getApiUrl(endpoint: string): string {
  const base = ENV_CONFIG.BACKEND_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}/api${path}`;
}

/**
 * Webルート（/apiなし）用のURLを組み立てる
 * @param endpoint エンドポイントのパス（例: "/auth/google"）
 * @returns ベースURL + endpoint
 */
export function getWebUrl(endpoint: string): string {
  const base = ENV_CONFIG.BACKEND_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
