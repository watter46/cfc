import axios from "axios";
import {
  API_CONFIG,
  API_ENDPOINTS,
  getApiUrl,
  getWebUrl,
} from "@/app/config/api";
import type { ActualMatchResponse } from "@/shared/types/index";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SilentAuthResponse,
} from "@/features/auth/types/api";

// Axiosのグローバル設定
axios.defaults.withCredentials = true;

/**
 * Laravel Sanctum Cookie認証対応のAxiosクライアント
 * Cookie認証とエラーハンドリングを一元管理
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: true, // Cookie認証に対応
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Laravel Sanctum推奨ヘッダー
  },
});

/**
 * CSRFトークンを取得（Laravel Sanctum）
 * フロントエンドは最初にこのエンドポイントを呼び出してCSRFトークンを取得する必要がある
 */
async function initializeCsrf(): Promise<void> {
  try {
    await apiClient.get(getWebUrl(API_ENDPOINTS.auth.csrf));
  } catch (error) {
    console.warn("❌ CSRF初期化に失敗しました:", error);
    throw error; // エラーを再スローして呼び出し元にエラーを伝える
  }
}

/**
 * リクエストインターセプター
 * 全てのリクエストに共通処理を適用
 */
apiClient.interceptors.request.use(
  (config) => {
    // Cookie認証を使用するため、特別な処理は不要
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
    // 401エラー（認証失敗）の場合の処理
    if (error.response?.status === 401) {
      // ゲスト用APIやme()エンドポイントの401は正常なので警告レベルを下げる
      const isAuthCheck = error.config?.url?.includes("/user/auth/me");

      if (!isAuthCheck) {
        console.warn("🔐 認証エラーが発生しました:", error.config?.url);
      }
    } else {
      // ネットワークエラーの場合
      if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        console.error("🌐 ネットワークエラー: APIサーバーに接続できません");
        console.error("Base URL:", apiClient.defaults.baseURL);
      } else {
        console.error("❌ API呼び出しエラー:", error);
      }
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
    signin: async (credentials: LoginRequest): Promise<LoginResponse> => {
      // Laravel Sanctum CSRF保護 - CSRFトークンを事前に取得
      await initializeCsrf();
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.signin),
        credentials
      );
      return response.data;
    },
    signup: async (userData: RegisterRequest): Promise<RegisterResponse> => {
      // Laravel Sanctum CSRF保護 - CSRFトークンを事前に取得
      await initializeCsrf();
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.signup),
        userData
      );
      return response.data;
    },
    signout: async (): Promise<{ message: string }> => {
      const response = await apiClient.post(
        getApiUrl(API_ENDPOINTS.auth.signout)
      );
      return response.data;
    },
    me: async (): Promise<SilentAuthResponse> => {
      const response = await apiClient.get(getApiUrl(API_ENDPOINTS.auth.me));
      return response.data;
    },
  },

  // 試合関連（認証済みユーザー用）
  matches: {
    getAll: async (
      params?: import("@/features/matches/types/api").MatchesQueryParams
    ): Promise<import("@/features/matches/types/api").MatchesResponse> => {
      // パラメータを数値に変換し、undefinedの値は除外
      const normalizedParams: Record<string, number> = {};

      if (params?.page) {
        normalizedParams.page = Number(params.page);
      }
      if (params?.season) {
        normalizedParams.season = Number(params.season);
      }
      if (params?.league) {
        normalizedParams.league = Number(params.league);
      }
      if (params?.team) {
        normalizedParams.team = Number(params.team);
      }

      const response = await apiClient.get(
        getApiUrl(API_ENDPOINTS.matches.list),
        { params: normalizedParams }
      );
      return response.data;
    },
    getDetail: async (
      params: import("@/features/matches/types/api").MatchDetailParams
    ): Promise<import("@/features/matches/types/api").MatchDetailResponse> => {
      const url = getApiUrl(API_ENDPOINTS.matches.detail(params.id));
      const response = await apiClient.get(url, { params });
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
