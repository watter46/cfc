import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { MatchesResponse } from "@/features/matches/types/api";

/**
 * 認証済みユーザー用の試合データを取得するカスタムフック
 * TanStack Queryを使用してキャッシュとリフェッチを管理
 */
export function useMatches() {
  return useQuery<MatchesResponse, Error>({
    queryKey: ["matches"],
    queryFn: () => api.matches.getAll(),
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ（長めに設定）
    gcTime: 60 * 60 * 1000, // 1時間後にガベージコレクション
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動リフェッチを無効
    refetchOnMount: true, // マウント時にデータを再取得する
    refetchOnReconnect: false, // 再接続時の自動リフェッチを無効
    retry: false, // エラー時の再試行を無効
  });
}
