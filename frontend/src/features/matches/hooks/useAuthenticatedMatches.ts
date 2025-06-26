import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/app/config/api";
import type { MatchesResponse } from "../types/api";

// TODO: 削除予定

/**
 * 認証済みユーザー用の試合一覧を取得するカスタムフック
 * トークンベース認証を使用してバックエンドAPIからデータを取得
 */
export function useAuthenticatedMatches() {
  return useQuery({
    queryKey: ["authenticatedMatches"],
    queryFn: async (): Promise<MatchesResponse> => {
      console.log("🎯 認証済み試合データを取得開始");
      console.log("🔗 APIエンドポイント:", API_ENDPOINTS.matches.list);
      console.log(
        "🪙 認証トークン:",
        localStorage.getItem("auth_token") ? "存在" : "なし"
      );

      try {
        const response = await apiClient.get<MatchesResponse>(
          API_ENDPOINTS.matches.list
        );

        console.log("✅ 認証済み試合データ取得成功");
        console.log(
          "📄 レスポンスデータ（完全版）:",
          JSON.stringify(response.data, null, 2)
        );
        console.log("📊 試合数:", response.data.matches?.length || 0);
        console.log("🔢 総数:", response.data.total);

        // 各試合の詳細をログ出力
        if (response.data.matches && response.data.matches.length > 0) {
          console.log("🏆 試合リスト:");
          response.data.matches.forEach((match, index) => {
            console.log(
              `  ${index + 1}. ${match.title} (${match.status}) - ${match.currentPlayers}/${match.maxPlayers}人`
            );
          });
        }

        return response.data;
      } catch (error) {
        console.error("❌ 認証済み試合データ取得エラー:", error);

        // エラーの詳細情報をログ出力
        if (error instanceof Error) {
          console.error("🔍 エラー詳細:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        }

        // Axiosエラーの場合、レスポンス詳細を出力
        if ((error as any)?.response) {
          console.error("📡 APIエラーレスポンス:", {
            status: (error as any).response.status,
            statusText: (error as any).response.statusText,
            data: (error as any).response.data,
            headers: (error as any).response.headers,
          });
        }

        throw error;
      }
    },
    enabled: !!localStorage.getItem("auth_token"), // トークンがある場合のみ実行
    staleTime: 30 * 1000, // 30秒間はキャッシュを使用
    gcTime: 5 * 60 * 1000, // 5分間キャッシュを保持
    retry: (failureCount, error: any) => {
      // 401エラー（認証エラー）の場合はリトライしない
      if (error?.response?.status === 401) {
        return false;
      }
      // その他のエラーは最大2回まで再試行
      return failureCount < 2;
    },
  });
}

/**
 * 認証トークンの存在チェック
 */
export function hasAuthToken(): boolean {
  return !!localStorage.getItem("auth_token");
}

/**
 * 認証トークンを削除
 */
export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
}
