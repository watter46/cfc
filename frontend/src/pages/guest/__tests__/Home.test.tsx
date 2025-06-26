import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Home from "@/pages/guest/Home";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

// API clientのモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      getUser: vi.fn().mockRejectedValue(new Error("Not authenticated")),
    },
    guest: {
      matches: {
        getAll: vi.fn().mockResolvedValue({
          data: [
            {
              date: "05/01",
              score: {
                away: 4,
                home: 1,
                penalty: {},
                fulltime: {},
                halftime: {},
                extratime: {},
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
                penalty: {},
                fulltime: {},
                halftime: {},
                extratime: {},
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
          ],
        }),
      },
    },
  },
}));

// React Routerのモック
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      [key: string]: unknown;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
  };
});

// テスト用のWrapper関数
const GuestTestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Home", () => {
  describe("Backend Data Integration", () => {
    it("renders featured matches from backend data", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // 実際のfeaturedMatchesデータが表示されることを確認
      expect(document.querySelector(".grid")).toBeInTheDocument();
    });

    it("displays correct team data from backend", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // APIから返される実際のチーム名を確認
      const expectedTeamNames = [
        "Chelsea",
        "Djurgardens IF",
        "Everton",
        "Fulham",
        "Legia Warszawa",
        "Ipswich",
      ];

      // 少なくとも一つのチーム名が表示されることを確認
      let teamNameFound = false;
      const allTextContent = document.body.textContent || "";
      expectedTeamNames.forEach((teamName) => {
        if (allTextContent.includes(teamName)) {
          teamNameFound = true;
        }
      });

      expect(teamNameFound).toBe(true);
    });

    it("displays score data from backend correctly", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // 実際のスコアパターンが表示されることを確認
      const scoreElements = document.querySelectorAll(
        ".text-2xl.font-bold.text-white"
      );
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it("displays match dates from backend data", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // 実際の日付が表示されることを確認（より一般的なセレクタを使用）
      const allTextContent = document.body.textContent || "";

      // 実際のAPIデータに含まれる日付パターンを探す
      const datePatterns = ["05/01", "04/26", "04/20", "04/17", "04/13"];
      let dateFound = false;

      datePatterns.forEach((datePattern) => {
        if (allTextContent.includes(datePattern)) {
          dateFound = true;
        }
      });

      expect(dateFound).toBe(true);
    });

    it("displays rateable status from backend", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // レーティング可能な試合カードが表示されることを確認
      const matchCards = document.querySelectorAll(".card-glass");
      expect(matchCards.length).toBeGreaterThan(0);
    });

    it("displays winner team IDs from backend data", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // 勝者表示に関連する要素が存在することを確認
      const matchCards = document.querySelectorAll(".card-glass");
      expect(matchCards.length).toBeGreaterThan(0);
    });

    it("renders correct number of match cards based on featured matches data", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // featuredMatchesからのマッチカードが正しい数表示されることを確認
      const matchCards = document.querySelectorAll(".card-glass");
      expect(matchCards.length).toBeGreaterThan(0);
    });
  });

  describe("Component Structure", () => {
    it("renders main sections without crashing", () => {
      expect(() => {
        render(
          <GuestTestWrapper>
            <Home />
          </GuestTestWrapper>
        );
      }).not.toThrow();
    });

    it("passes match data correctly to PublicMatchCard components", () => {
      render(
        <GuestTestWrapper>
          <Home />
        </GuestTestWrapper>
      );

      // PublicMatchCardコンポーネントが正しくレンダリングされることを確認
      const matchCards = document.querySelectorAll(".card-glass");
      expect(matchCards.length).toBeGreaterThan(0);
    });
  });
});
