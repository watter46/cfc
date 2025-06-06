/**
 * React Query設定とユーティリティ
 * APIアクセス用のクエリ設定
 */
import { QueryClient } from "@tanstack/react-query";
import { ENV_CONFIG } from "../config/env";

/**
 * Query Client設定
 */
export const apiQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルトのキャッシュ時間：5分
      staleTime: 5 * 60 * 1000,
      // データの再取得間隔：10分
      gcTime: 10 * 60 * 1000,
      // エラー時のリトライ回数
      retry: (failureCount, error: Error) => {
        // 4xx系エラーはリトライしない
        const httpError = error as { response?: { status?: number } };
        if (
          httpError?.response?.status &&
          httpError.response.status >= 400 &&
          httpError.response.status < 500
        ) {
          return false;
        }
        // 最大3回まで
        return failureCount < 3;
      },
      // リトライ遅延（指数バックオフ）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // フォーカス時の自動再取得
      refetchOnWindowFocus: false,
      // 再接続時の自動再取得
      refetchOnReconnect: true,
    },
    mutations: {
      // ミューテーションのリトライ回数
      retry: 1,
      // ミューテーション失敗時のエラーハンドリング
      onError: (error: Error) => {
        if (ENV_CONFIG.enableErrorLogging) {
          console.error("🔥 Mutation Error:", error);
        }
      },
    },
  },
});

/**
 * Query Key Factory
 * APIエンドポイント用のクエリキー生成
 */
export const queryKeys = {
  // 認証関連
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },
  // 試合関連
  matches: {
    all: ["matches"] as const,
    lists: () => [...queryKeys.matches.all, "list"] as const,
    featured: () => [...queryKeys.matches.all, "featured"] as const,
    detail: (id: string) => [...queryKeys.matches.all, "detail", id] as const,
  },
  // 評価関連
  ratings: {
    all: ["ratings"] as const,
    byMatch: (matchId: string) =>
      [...queryKeys.ratings.all, "match", matchId] as const,
  },
  // プロフィール関連
  profile: {
    all: ["profile"] as const,
    current: () => [...queryKeys.profile.all, "current"] as const,
  },
} as const;

/**
 * Query Client ユーティリティ
 */
export const queryUtils = {
  /**
   * 全キャッシュをクリア
   */
  clearAll: () => {
    apiQueryClient.clear();
  },

  /**
   * 特定のクエリキーのキャッシュをクリア
   */
  clearByKey: (queryKey: readonly unknown[]) => {
    apiQueryClient.removeQueries({ queryKey });
  },

  /**
   * 特定のクエリを無効化（再取得をトリガー）
   */
  invalidate: (queryKey: readonly unknown[]) => {
    apiQueryClient.invalidateQueries({ queryKey });
  },

  /**
   * 認証関連のキャッシュをクリア
   */
  clearAuth: () => {
    apiQueryClient.removeQueries({ queryKey: queryKeys.auth.all });
  },
};
