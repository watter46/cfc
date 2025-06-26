import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from "@/app/config/api";
import type { MatchesResponse } from "@/features/matches/types/api";
import type { ActualMatchResponse } from "@/shared/types/index";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SilentAuthResponse,
} from "@/features/auth/types/api";

/**
 * Laravel Sanctum トークンベース認証対応のAxiosクライアント
 * APIトークン認証とエラーハンドリングを一元管理
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * リクエストインターセプター
 * 全てのリクエストに共通処理を適用
 */
apiClient.interceptors.request.use(
  (config) => {
    // 認証トークンがあれば自動で付与
    const token = localStorage.getItem("auth_token");

    // 不正なトークンをクリア
    if (token === "undefined" || token === "null") {
      console.warn("⚠️ 不正なトークンを検出しました。クリアします");
      localStorage.removeItem("auth_token");
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/**
 * レスポンスインターセプター
 * 認証エラーや共通エラーを自動処理
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401エラー（認証失敗）の場合はトークンを削除
    if (error.response?.status === 401) {
      console.warn("🔐 認証エラーが発生しました。トークンを削除します。");
      localStorage.removeItem("auth_token");
    }

    // ネットワークエラーの場合
    if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error")
    ) {
      console.error("🌐 ネットワークエラー: APIサーバーに接続できません");
      console.error("Base URL:", apiClient.defaults.baseURL);
    }

    return Promise.reject(error);
  }
);

/**
 * 型安全なAPI関数群
 */
export const api = {
  // 認証関連
  auth: {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.login),
        credentials
      );
      return response.data.data;
    },
    register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.register),
        userData
      );
      return response.data;
    },
    logout: async (): Promise<{ message: string }> => {
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.logout)
      );
      return response.data;
    },
    me: async (): Promise<SilentAuthResponse> => {
      const response = await apiClient.get(getApiUrl(API_ENDPOINTS.auth.me));
      return response.data.data;
    },
    getTokens: async () => {
      const response = await apiClient.get(getApiUrl("/auth/tokens"));
      return response.data;
    },
    revokeToken: async (tokenId: string) => {
      const response = await apiClient.delete(
        getApiUrl(`/auth/tokens/${tokenId}`)
      );
      return response.data;
    },
    revokeAllTokens: async () => {
      const response = await apiClient.post(
        getApiUrl("/auth/tokens/revoke-all")
      );
      return response.data;
    },
  },

  // 試合関連（認証済みユーザー用）
  matches: {
    getAll: async (): Promise<MatchesResponse> => {
      const response = await apiClient.get(
        getApiUrl(API_ENDPOINTS.matches.list)
      );
      return response.data;
    },
  },

  // ゲスト用API（認証不要）
  guest: {
    matches: {
      /**
       * ゲスト用の試合一覧を取得
       * 認証不要でパブリックな試合データのみを取得
       */
      getAll: async (): Promise<ActualMatchResponse> => {
        const response = await apiClient.get(
          getApiUrl(API_ENDPOINTS.guest.matches.list)
        );
        return response.data;
      },
    },
  },

  // テスト関連
  test: {
    getTest: async () => {
      const response = await apiClient.get(getApiUrl("/test"));
      return response.data;
    },
  },
} as const;
