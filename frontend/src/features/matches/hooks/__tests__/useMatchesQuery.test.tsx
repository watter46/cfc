import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useMatchesQuery } from "../user/useMatchesQuery";
import type { MatchesResponse } from "../../types/api";

// テスト用のモックデータ
const mockMatchesResponse: MatchesResponse = {
  success: true,
  message: "試合一覧を取得しました",
  data: [
    {
      id: 59,
      started_at: "2025-04-10 16:45:00",
      score: {
        away: 3,
        home: 0,
        fulltime: {
          away: 3,
          home: 0,
        },
        halftime: {
          away: 0,
          home: 0,
        },
      },
      rateable: false,
      season: {
        id: 1,
        name: "2024 - 2025",
      },
      game_user: {
        id: null,
        user_id: 1,
        game_id: 59,
        mom_count: null,
        mom_game_player_id: null,
        is_rated: null,
        is_winner: null,
      },
      teams: {
        home: {
          id: 36,
          name: "Legia Warszawa",
          logo_path: "http://localhost:8000/storage/image/team/339.webp",
        },
        away: {
          id: 1,
          name: "Chelsea",
          logo_path: "http://localhost:8000/storage/image/team/49.webp",
        },
      },
      league: {
        id: 3,
        name: "UEFA Europa Conference League",
        logo_path: "http://localhost:8000/storage/image/league/848.webp",
      },
    },
  ],
  meta: {
    pagination: {
      count: 1,
      per_page: 1,
      current_page: 1,
      has_more: true,
      path: "http://localhost:8000/api/matches",
    },
    current_page: 1,
    from: 1,
    path: "http://localhost:8000/api/matches",
    per_page: 1,
    to: 1,
  },
  links: {
    first: "http://localhost:8000/api/matches?page=1",
    last: null,
    prev: null,
    next: "http://localhost:8000/api/matches?page=2",
  },
  selectors: {
    seasons: [
      {
        id: 1,
        year: 2024,
        name: "2024 - 2025",
      },
    ],
    my_clubs: [
      {
        id: 1,
        name: "Chelsea",
        logo_path: "http://localhost:8000/storage/image/team/49.webp",
      },
    ],
    leagues: [
      {
        id: 1,
        name: "Premier League",
        logo_path: "http://localhost:8000/storage/image/league/39.webp",
      },
      {
        id: 3,
        name: "UEFA Europa Conference League",
        logo_path: "http://localhost:8000/storage/image/league/848.webp",
      },
    ],
  },
};

// テスト用のQueryClientProviderラッパー
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("useMatchesQuery", () => {
  beforeEach(() => {
    // フェッチをモック化
    global.fetch = vi.fn();
  });

  it("試合一覧データを正常に取得できる", async () => {
    // フェッチのモック設定
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchesResponse,
    });

    const { result } = renderHook(() => useMatchesQuery(), {
      wrapper: createWrapper(),
    });

    // 初期状態は loading
    expect(result.current.isLoading).toBe(true);

    // データが取得されるまで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // データが正しく取得されているか確認
    expect(result.current.data).toEqual(mockMatchesResponse);
    expect(result.current.error).toBeNull();
  });

  it("selectorsデータが正しく含まれている", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchesResponse,
    });

    const { result } = renderHook(() => useMatchesQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // selectorsデータの確認
    expect(result.current.data?.selectors).toBeDefined();
    expect(result.current.data?.selectors.seasons).toHaveLength(1);
    expect(result.current.data?.selectors.seasons[0].name).toBe("2024 - 2025");
    expect(result.current.data?.selectors.my_clubs).toHaveLength(1);
    expect(result.current.data?.selectors.leagues).toHaveLength(2);
  });

  it("シーズン名が正しく表示される", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchesResponse,
    });

    const { result } = renderHook(() => useMatchesQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 試合データのシーズン名確認
    const match = result.current.data?.data[0];
    expect(match?.season.name).toBe("2024 - 2025");
    expect(match?.season.id).toBe(1);
  });

  it("API エラー時のハンドリング", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("API Error"));

    const { result } = renderHook(() => useMatchesQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
