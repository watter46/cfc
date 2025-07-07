import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { MatchDetailResponse } from "../../types/match-detail";

/**
 * 試合詳細データ取得用カスタムフック
 * @param matchId 試合ID
 */
export function useMatchDetailQuery(matchId: number) {
  return useQuery({
    queryKey: ["match-detail", matchId],
    queryFn: async (): Promise<MatchDetailResponse> => {
      const response = await api.matches.getDetail({ id: matchId });
      return response;
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとして扱う
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
  });
}
