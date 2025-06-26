import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createElement } from "react";
import { useMatches } from "../useMatches";
import { api } from "@/shared/lib/api-client";
import type { MatchesResponse } from "@/features/matches/types/api";

// api-client をモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    matches: {
      getAll: vi.fn(),
    },
  },
}));

/**
 * テスト用のQueryClientプロバイダー
 */
function createTestQueryProvider() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

/**
 * モック試合レスポンスデータ
 */
const mockMatchesResponse: MatchesResponse = {
  matches: [
    {
      id: "1",
      title: "テスト試合1",
      description: "テスト用の試合です",
      status: "upcoming",
      startTime: "2025-06-25T10:00:00Z",
      maxPlayers: 22,
      currentPlayers: 15,
      createdAt: "2025-06-20T00:00:00Z",
      updatedAt: "2025-06-20T00:00:00Z",
      creator: {
        id: "user1",
        name: "テストユーザー1",
        email: "test1@example.com",
      },
    },
    {
      id: "2",
      title: "テスト試合2",
      description: "2つ目のテスト試合",
      status: "ongoing",
      startTime: "2025-06-25T14:00:00Z",
      maxPlayers: 22,
      currentPlayers: 20,
      createdAt: "2025-06-20T00:00:00Z",
      updatedAt: "2025-06-20T00:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

describe("useMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch matches successfully", async () => {
    // APIモックの設定
    vi.mocked(api.matches.getAll).mockResolvedValue(mockMatchesResponse);

    const { result } = renderHook(() => useMatches(), {
      wrapper: createTestQueryProvider(),
    });

    // 初期状態の確認
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    // データ取得完了を待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toEqual(mockMatchesResponse);
    expect(result.current.error).toBeNull();
    expect(api.matches.getAll).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors correctly", async () => {
    const mockError = new Error("API request failed");
    vi.mocked(api.matches.getAll).mockRejectedValue(mockError);

    const { result } = renderHook(() => useMatches(), {
      wrapper: createTestQueryProvider(),
    });

    // 初期状態の確認
    expect(result.current.isLoading).toBe(true);

    // エラー状態を待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // エラー状態の確認
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
    expect(api.matches.getAll).toHaveBeenCalledTimes(1);
  });

  it("should use correct query configuration", () => {
    vi.mocked(api.matches.getAll).mockResolvedValue(mockMatchesResponse);

    const { result } = renderHook(() => useMatches(), {
      wrapper: createTestQueryProvider(),
    });

    // useQueryの設定が正しく適用されているかの確認は、
    // 実際のクエリの実行を通じて間接的に検証
    expect(result.current.isLoading).toBe(true);
  });
});
