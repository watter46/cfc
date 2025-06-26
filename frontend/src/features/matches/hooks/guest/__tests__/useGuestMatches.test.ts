import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createElement } from "react";
import { useGuestMatches, useGuestRecentMatches } from "../useGuestMatches";
import type { ActualMatchData as Match } from "@/shared/types/index";

// APIクライアントをモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    guest: {
      matches: {
        getAll: vi.fn(),
      },
    },
  },
}));

// APIクライアントのモック関数
import { api } from "@/shared/lib/api-client";
import type { MockedFunction } from "vitest";

const mockApi = {
  guest: {
    matches: {
      getAll: api.guest.matches.getAll as MockedFunction<
        typeof api.guest.matches.getAll
      >,
    },
  },
};

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
 * 実際のAPIレスポンスデータをモック用に使用
 */
const mockMatches: Match[] = [
  {
    date: "05/01",
    score: {
      away: 4,
      home: 1,
      penalty: { away: 0, home: 0 },
      fulltime: { away: 4, home: 1 },
      halftime: { away: 2, home: 0 },
      extratime: { away: 0, home: 0 },
    },
    home: {
      id: 37,
      name: "Djurgardens IF",
      logo_path: "http://localhost:8000/storage/image/team/364.webp",
    },
    away: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/26",
    score: {
      away: 0,
      home: 1,
      penalty: { away: 0, home: 0 },
      fulltime: { away: 0, home: 1 },
      halftime: { away: 0, home: 1 },
      extratime: { away: 0, home: 0 },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 18,
      name: "Everton",
      logo_path: "http://localhost:8000/storage/image/team/45.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/20",
    score: {
      away: 2,
      home: 1,
      penalty: { away: 0, home: 0 },
      fulltime: { away: 2, home: 1 },
      halftime: { away: 0, home: 1 },
      extratime: { away: 0, home: 0 },
    },
    home: {
      id: 19,
      name: "Fulham",
      logo_path: "http://localhost:8000/storage/image/team/36.webp",
    },
    away: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/17",
    score: {
      away: 2,
      home: 1,
      penalty: { away: 0, home: 0 },
      fulltime: { away: 2, home: 1 },
      halftime: { away: 1, home: 1 },
      extratime: { away: 0, home: 0 },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 36,
      name: "Legia Warszawa",
      logo_path: "http://localhost:8000/storage/image/team/339.webp",
    },
    WinnerTeamId: 36,
    isRateable: false,
  },
  {
    date: "04/13",
    score: {
      away: 2,
      home: 2,
      penalty: { away: 0, home: 0 },
      fulltime: { away: 2, home: 2 },
      halftime: { away: 2, home: 0 },
      extratime: { away: 0, home: 0 },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 20,
      name: "Ipswich",
      logo_path: "http://localhost:8000/storage/image/team/57.webp",
    },
    WinnerTeamId: null,
    isRateable: false,
  },
];

describe("useGuestMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモックレスポンス設定（実際のAPIレスポンス形式に合わせる）
    mockApi.guest.matches.getAll.mockResolvedValue({
      data: mockMatches,
    });
  });

  it("正常にゲスト用試合データを取得する", async () => {
    const TestProvider = createTestQueryProvider();

    const { result } = renderHook(() => useGuestMatches(), {
      wrapper: TestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockMatches);
    expect(result.current.error).toBeNull();
    expect(mockApi.guest.matches.getAll).toHaveBeenCalled();
  });

  it("APIエラー時に適切にエラーをハンドリングする", async () => {
    // APIエラーをモック
    mockApi.guest.matches.getAll.mockRejectedValue(new Error("API Error"));

    const TestProvider = createTestQueryProvider();

    const { result } = renderHook(() => useGuestMatches(), {
      wrapper: TestProvider,
    });

    // 3回リトライ後のエラー状態になるまで待機（タイムアウト延長）
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeTruthy();
      },
      { timeout: 5000 } // 5秒待機
    );

    expect(result.current.data).toBeUndefined();
  }, 6000); // テスト自体のタイムアウトも延長
});

describe("useGuestRecentMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // APIクライアントのモックを使用（fetchではなく）
    mockApi.guest.matches.getAll.mockResolvedValue({
      data: mockMatches,
    });
  });

  it("指定した上限数の試合データを取得する", async () => {
    const TestProvider = createTestQueryProvider();

    const { result } = renderHook(() => useGuestRecentMatches(1), {
      wrapper: TestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual(mockMatches[0]);
  });

  it("上限を指定しない場合は全ての試合データを取得する", async () => {
    const TestProvider = createTestQueryProvider();

    const { result } = renderHook(() => useGuestRecentMatches(), {
      wrapper: TestProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(5); // 実際のデータ数に合わせる
    expect(result.current.data).toEqual(mockMatches);
  });
});
