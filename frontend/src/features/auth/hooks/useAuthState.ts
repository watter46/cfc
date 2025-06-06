import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { UserResponse, ApiError } from "../types/api";
import { authTokenUtils } from "./useAuthQuery";

/**
 * 認証状態を管理するReact Queryフック
 * アプリケーション全体で統一された認証状態を提供
 */
export function useAuthState() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<UserResponse, ApiError>({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<UserResponse> => {
      const response = await api.auth.getUser();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを新鮮として扱う
    // トークンが存在する場合のみクエリを有効化
    enabled: authTokenUtils.hasToken(),
    retry: (failureCount, error) => {
      // 401エラー（未認証）の場合は再試行しない
      if (error?.status === 401) {
        return false;
      }
      // その他のエラーは最大2回まで再試行
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !isError && authTokenUtils.hasToken(),
    isError,
    refetch,
  };
}

/**
 * 認証トークン一覧を取得するフック
 */
export function useAuthTokens() {
  return useQuery({
    queryKey: ["auth", "tokens"],
    queryFn: async () => {
      const response = await api.auth.getTokens();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2分間キャッシュを新鮮として扱う
    // 認証されている場合のみ実行
    enabled: true, // 将来的には認証状態に基づいて制御
  });
}
