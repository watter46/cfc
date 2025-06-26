import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type {
  ActualMatchData,
  ActualMatchResponse,
} from "@/shared/types/index.ts";

/**
 * ゲスト用の試合データを取得するカスタムフック
 * 認証不要でパブリックな試合データのみを取得
 * TanStack Queryを使用してキャッシュとリフェッチを管理
 */
export function useGuestMatches() {
  return useQuery<ActualMatchData[], Error>({
    queryKey: ["guest", "matches"],
    queryFn: async (): Promise<ActualMatchData[]> => {
      try {
        // 統一されたAPIクライアント経由でゲスト用試合データを取得
        const result: ActualMatchResponse = await api.guest.matches.getAll();

        // デバッグ用ログ
        console.log("🏈 ゲスト用試合データ取得成功:", result);

        // APIレスポンス形式: { data: [...] }
        const matches: ActualMatchData[] = result.data || [];

        console.log("🏈 処理された試合データ:", matches);

        // データをそのまま返す（APIレスポンスが既に正しい形式）
        return matches;
      } catch (error) {
        console.error("ゲスト用試合データの取得エラー:", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ
    gcTime: 60 * 60 * 1000, // 1時間後にガベージコレクション
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動リフェッチを無効
    refetchOnMount: false, // マウント時の自動リフェッチを無効（初回は除く）
    refetchOnReconnect: false, // 再接続時の自動リフェッチを無効
    refetchInterval: false, // 定期的なリフェッチを無効
    retry: 2, // エラー時の再試行を2回まで
  });
}

/**
 * ゲスト用の最新試合データを取得するカスタムフック
 * 指定した件数分の最新試合データを取得します
 * @param limit 取得する試合数の上限（デフォルト：全件）
 * @returns TanStack Queryの結果（data, isLoading, error, refetch）
 */
export function useGuestRecentMatches(limit?: number) {
  const { data, isLoading, error, refetch } = useGuestMatches();

  // limitが指定されている場合は制限をかける
  const recentMatches = limit && data ? data.slice(0, limit) : data;

  return {
    data: recentMatches,
    isLoading,
    error,
    refetch,
  };
}
