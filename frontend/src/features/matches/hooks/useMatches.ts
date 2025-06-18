import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/app/config/api.ts";
import {
  mockMatchesData,
  shouldUseMockData,
} from "@/features/matches/data/mockData.ts";
import type { Match } from "@/shared/types/index.ts";

/**
 * APIレスポンスの型定義
 */
interface MatchesApiResponse {
  data: Match[];
}

/**
 * 試合データを取得するカスタムフック
 * TanStack Queryを使用してキャッシュとリフェッチを管理
 */
export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async (): Promise<Match[]> => {
      // 開発環境でモックデータを使用する場合
      if (shouldUseMockData()) {
        console.log("Using mock data for development");
        // モックデータを返す前に少し遅延を追加（実際のAPIのような動作をシミュレート）
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockMatchesData;
      }

      try {
        console.log("Fetching matches from:", API_ENDPOINTS.matches.list);
        const response = await fetch(API_ENDPOINTS.matches.list, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);

          // 開発環境では APIエラー時にモックデータをフォールバックとして使用
          if (import.meta.env.DEV) {
            console.warn(
              "API failed in development, falling back to mock data"
            );
            return mockMatchesData;
          }

          throw new Error(
            `試合データの取得に失敗しました (${response.status}): ${errorText}`
          );
        }

        const result: MatchesApiResponse = await response.json();
        console.log("API Response:", result);

        if (!result.data || !Array.isArray(result.data)) {
          console.error("Invalid API response structure:", result);

          // 開発環境では無効なレスポンス時にモックデータをフォールバックとして使用
          if (import.meta.env.DEV) {
            console.warn(
              "Invalid API response in development, falling back to mock data"
            );
            return mockMatchesData;
          }

          throw new Error("APIレスポンスの形式が正しくありません");
        }

        return result.data;
      } catch (error) {
        console.error("Fetch error details:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          endpoint: API_ENDPOINTS.matches.list,
        });

        // 開発環境では全てのエラー時にモックデータをフォールバックとして使用
        if (
          import.meta.env.DEV &&
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          console.warn(
            "Network error in development, falling back to mock data"
          );
          return mockMatchesData;
        }

        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ（長めに設定）
    gcTime: 60 * 60 * 1000, // 1時間後にガベージコレクション
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動リフェッチを無効
    refetchOnMount: false, // マウント時の自動リフェッチを無効（初回は除く）
    refetchOnReconnect: false, // 再接続時の自動リフェッチを無効
    refetchInterval: false, // 定期的なリフェッチを無効
    retry: false, // エラー時の再試行を完全に無効
  });
}

/**
 * 特定の数の最新試合を取得するカスタムフック
 */
export function useRecentMatches(limit?: number) {
  const { data, isLoading, error, refetch } = useMatches();

  const recentMatches = limit && data ? data.slice(0, limit) : data;

  return {
    data: recentMatches,
    isLoading,
    error,
    refetch,
  };
}
