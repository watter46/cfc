import axios from "axios";

/**
 * Laravel Sanctum トークンベース認証対応のAxiosクライアント
 * APIトークン認証とエラーハンドリングを一元管理
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: false, // トークンベース認証のためfalse
  timeout: 10000, // 10秒でタイムアウト
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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // 401エラー（認証失敗）の場合はトークンを削除してログイン画面にリダイレクト
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    // トークンベース認証では419エラー（CSRF）の処理は不要

    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * 型安全なAPI関数群
 */
export const api = {
  // ゲーム関連
  games: {
    getLatest: () => apiClient.get("/"),
    getById: (id: string) => apiClient.get(`/games/${id}`),
  },

  // 試合関連
  matches: {
    getAll: () => apiClient.get("/"),
    getFeatured: () => apiClient.get("/"), // ルートエンドポイントから取得
    getById: (id: string) => apiClient.get(`/matches/${id}`),
  },

  // テスト関連
  test: {
    getTest: () => apiClient.get("/test"),
  },

  // 認証関連
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post("/auth/login", credentials),
    register: (userData: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => apiClient.post("/auth/register", userData),
    logout: () => apiClient.post("/auth/logout"),
    getUser: () => apiClient.get("/auth/me"),
    getTokens: () => apiClient.get("/auth/tokens"),
    revokeToken: (tokenId: string) =>
      apiClient.delete(`/auth/tokens/${tokenId}`),
    revokeAllTokens: () => apiClient.post("/auth/tokens/revoke-all"),
  },

  // 試合評価関連（将来の実装）
  ratings: {
    submitRating: (matchId: string, ratings: Record<string, number>) =>
      apiClient.post(`/matches/${matchId}/ratings`, ratings),
    getRatings: (matchId: string) =>
      apiClient.get(`/matches/${matchId}/ratings`),
  },
} as const;
