import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query設定
 * データキャッシュとエラーハンドリングの設定を一元管理
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データが5分間フレッシュとして扱われる
      staleTime: 1000 * 60 * 5,
      // ガベージコレクションまでの時間（10分）
      gcTime: 1000 * 60 * 10,
      // エラー時の自動再試行回数
      retry: 3,
      // ネットワーク再接続時の自動再取得を無効化
      refetchOnReconnect: false,
      // ウィンドウフォーカス時の自動再取得を無効化
      refetchOnWindowFocus: false,
    },
    mutations: {
      // ミューテーション失敗時の再試行回数
      retry: 1,
    },
  },
});
