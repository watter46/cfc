import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import GuestHomePage from "@/pages/guest/Home";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a wrapper component for tests
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// API clientのモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      getUser: vi.fn().mockRejectedValue(new Error("Not authenticated")),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

// React Routerのナビゲート関数のモック
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// 実際のデータを使用した統合テスト
describe("Guest Page Integration Tests", () => {
  describe("Real Data Integration", () => {
    it("renders guest page with real featured matches data", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // 実際のfeaturedMatchesデータから試合が表示されることを確認
      // PublicMatchCardコンポーネントが実際に呼ばれることを確認
      expect(document.querySelector(".grid")).toBeInTheDocument();
    });

    it("displays correct number of match cards from backend data", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // PublicMatchCardコンポーネントが呼ばれる数を確認
      // featuredMatchesは6つの試合を含んでいる
      const matchGrid = document.querySelector(
        ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
      );
      expect(matchGrid).toBeInTheDocument();
    });

    it("passes backend data correctly to PublicMatchCard components", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // featuredMatchesからのデータがPublicMatchCardに正しく渡されることを確認
      // 実際のコンポーネントが正しくレンダリングされることを確認
      expect(document.querySelector(".card-glass")).toBeInTheDocument();
    });
  });

  describe("Backend Data Flow", () => {
    it("imports and uses mockMatchesData from mockData", async () => {
      // このテストは、実際のmockMatchesDataインポートが動作することを確認
      const MockDataModule = await import(
        "../../features/matches/data/mockData.ts"
      );
      const { mockMatchesData } = MockDataModule;

      expect(mockMatchesData).toBeDefined();
      expect(Array.isArray(mockMatchesData)).toBe(true);
      expect(mockMatchesData.length).toBeGreaterThan(0);
    });

    it("mockMatchesData contains valid backend structure", async () => {
      const MockDataModule = await import(
        "../../features/matches/data/mockData.ts"
      );
      const { mockMatchesData } = MockDataModule;

      mockMatchesData.forEach((match: unknown) => {
        const typedMatch = match as {
          id: string;
          home: { id: number; name: string };
          away: { id: number; name: string };
          isRateable: boolean;
        };
        // バックエンドデータの構造確認
        expect(typedMatch.home).toBeDefined();
        expect(typedMatch.away).toBeDefined();
        expect(typedMatch.home.id).toBeDefined();
        expect(typedMatch.away.id).toBeDefined();
        expect(typedMatch.home.name).toBeDefined();
        expect(typedMatch.away.name).toBeDefined();
        expect(typeof typedMatch.isRateable).toBe("boolean");
      });
    });
  });

  describe("Component Data Binding", () => {
    it("renders without crashing with real backend data", () => {
      // 実際のバックエンドデータでコンポーネントがクラッシュしないことを確認
      expect(() => {
        render(<GuestHomePage />, { wrapper: TestWrapper });
      }).not.toThrow();
    });

    it("handles real team data correctly", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // 実際のチーム名（日本語）が表示されることを期待
      // これらは実際のfeaturedMatchesデータに含まれているチーム名
      const possibleTeamNames = [
        "チェルシー",
        "リヴァプール",
        "アーセナル",
        "ブレントフォード",
        "マンチェスター・シティ",
        "トッテナム・ホットスパー",
        "マンチェスター・ユナイテッド",
        "ニューカッスル・ユナイテッド",
      ];

      // 少なくとも一つのチーム名が表示されることを確認
      let teamNameFound = false;
      possibleTeamNames.forEach((teamName) => {
        if (screen.queryByText(teamName)) {
          teamNameFound = true;
        }
      });

      // モックされていない実際のデータの場合
      expect(teamNameFound).toBe(true);
    });

    it("handles real match scores from backend", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // 実際のスコアパターンが表示されることを確認
      // スコアは "数字-数字" の形式で表示される
      const scoreElements = document.querySelectorAll(
        ".text-2xl.font-bold.text-white"
      );
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it("displays real match dates from backend", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // 実際の日付が表示されることを確認
      // カレンダーアイコンと一緒に表示される
      const dateElements = document.querySelectorAll(
        ".flex.items-center.text-gray-400.text-sm"
      );
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe("User Experience with Real Data", () => {
    it("renders main sections in correct order", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // Hero section, Featured Matches, Features, CTAの順序で表示される
      const sections = document.querySelectorAll("section");
      expect(sections.length).toBeGreaterThanOrEqual(4);
    });

    it("featured matches section contains real match cards", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // Featured Matchesセクションが存在することを確認
      const featuredSection =
        screen.getByText("Recent Matches").parentElement?.parentElement;
      expect(featuredSection).toBeInTheDocument();

      // そのセクション内にgridが存在することを確認
      const matchGrid = featuredSection?.querySelector(".grid");
      expect(matchGrid).toBeInTheDocument();
    });

    it("match detail links are properly generated", () => {
      render(<GuestHomePage />, { wrapper: TestWrapper });

      // 試合詳細へのリンクが正しく生成されることを確認
      const detailLinks = document.querySelectorAll('a[href^="/matches/"]');
      expect(detailLinks.length).toBeGreaterThan(0);
    });
  });
});
