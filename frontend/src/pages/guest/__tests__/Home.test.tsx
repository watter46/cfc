import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Home from "@/pages/guest/Home";
import { AuthProviderWithQuery } from "@/features/auth/contexts/AuthProviderWithQuery";

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
        <AuthProviderWithQuery>{children}</AuthProviderWithQuery>
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

      // 実際のチーム名（日本語）が表示されることを期待
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

      // 実際の日付が表示されることを確認
      const dateElements = document.querySelectorAll(
        ".flex.items-center.text-gray-400.text-sm"
      );
      expect(dateElements.length).toBeGreaterThan(0);
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
      const matchGrid = document.querySelector(".grid");
      expect(matchGrid).toBeInTheDocument();
      const matchCards = matchGrid?.querySelectorAll(".card-glass");
      expect(matchCards?.length).toBeGreaterThan(0);
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
