import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api } from "@/shared/lib/api-client";
import type { MatchesQueryParams } from "@/features/matches/types/api";

/**
 * 試合一覧データを取得するカスタムフック
 * URLパラメータと連動してデータを取得し、キャッシュ・ローディング・エラー管理を行う
 */
export function useMatchesQuery() {
  const [searchParams] = useSearchParams();

  // URLパラメータからクエリパラメータを構築
  const queryParams: MatchesQueryParams = {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    season: searchParams.get("season")
      ? Number(searchParams.get("season"))
      : undefined,
    league: searchParams.get("league")
      ? Number(searchParams.get("league")) || undefined // NaNをundefinedに変換
      : undefined,
    team: searchParams.get("team")
      ? Number(searchParams.get("team"))
      : undefined,
  };

  return useQuery({
    queryKey: ["matches", queryParams],
    queryFn: () => api.matches.getAll(queryParams),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false, // リトライを無効化
  });
}
