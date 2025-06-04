import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GuestHomePage from "@/pages/guest";

// Auth contextのモック
vi.mock("@/features/auth/contexts/AuthContext.tsx", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
  }),
}));

// React Routerのモック
vi.mock("react-router-dom", () => ({
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
}));

// モックデータとモジュール
vi.mock("@/features/matches/data/MatchList.ts", () => ({
  featuredMatches: [
    {
      id: "1",
      homeTeam: {
        id: "33",
        name: "Manchester United",
        logo: "/logos/man-united.png",
        players: [],
      },
      awayTeam: {
        id: "42",
        name: "Arsenal",
        logo: "/logos/arsenal.png",
        players: [],
      },
      date: "2024-12-20T15:00:00Z",
      score: "2-1",
      homeScore: 2,
      awayScore: 1,
      winnerTeamId: "33",
      isRateable: true,
    },
    {
      id: "2",
      homeTeam: {
        id: "25",
        name: "Chelsea",
        logo: "/logos/chelsea.png",
        players: [],
      },
      awayTeam: {
        id: "47",
        name: "Liverpool",
        logo: "/logos/liverpool.png",
        players: [],
      },
      date: "2024-12-19T17:30:00Z",
      score: "1-3",
      homeScore: 1,
      awayScore: 3,
      winnerTeamId: "47",
      isRateable: true,
    },
  ],
}));

interface MockMatchProps {
  match: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    score: string;
    date: string;
    isRateable: boolean;
    winnerTeamId?: string;
  };
}

// PublicMatchCardコンポーネントをモック
vi.mock("@/features/matches/components/guest/PublicMatchCard.tsx", () => ({
  default: ({ match }: MockMatchProps) => (
    <div data-testid={`match-card-${match.id}`}>
      <div data-testid="home-team-name">{match.homeTeam.name}</div>
      <div data-testid="away-team-name">{match.awayTeam.name}</div>
      <div data-testid="score">{match.score}</div>
      <div data-testid="date">{match.date}</div>
      <div data-testid="is-rateable">{match.isRateable.toString()}</div>
      <div data-testid="winner-team-id">{match.winnerTeamId}</div>
    </div>
  ),
}));

describe("GuestHomePage", () => {
  describe("Backend Data Integration", () => {
    it("renders featured matches from backend data", () => {
      render(<GuestHomePage />);

      // featuredMatchesからのデータが表示されることを確認
      expect(screen.getByTestId("match-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("match-card-2")).toBeInTheDocument();
    });

    it("displays correct team data from backend", () => {
      render(<GuestHomePage />);

      // 最初の試合のチームデータを確認
      const homeTeam1 = screen.getAllByTestId("home-team-name")[0];
      const awayTeam1 = screen.getAllByTestId("away-team-name")[0];

      expect(homeTeam1).toHaveTextContent("Manchester United");
      expect(awayTeam1).toHaveTextContent("Arsenal");

      // 2番目の試合のチームデータを確認
      const homeTeam2 = screen.getAllByTestId("home-team-name")[1];
      const awayTeam2 = screen.getAllByTestId("away-team-name")[1];

      expect(homeTeam2).toHaveTextContent("Chelsea");
      expect(awayTeam2).toHaveTextContent("Liverpool");
    });

    it("displays score data from backend correctly", () => {
      render(<GuestHomePage />);

      const scores = screen.getAllByTestId("score");

      expect(scores[0]).toHaveTextContent("2-1");
      expect(scores[1]).toHaveTextContent("1-3");
    });

    it("displays match dates from backend data", () => {
      render(<GuestHomePage />);

      const dates = screen.getAllByTestId("date");

      // バックエンドから受け取った日付文字列が表示されることを確認
      expect(dates[0]).toHaveTextContent("2024-12-20T15:00:00Z");
      expect(dates[1]).toHaveTextContent("2024-12-19T17:30:00Z");
    });

    it("displays rateable status from backend", () => {
      render(<GuestHomePage />);

      const rateableStatuses = screen.getAllByTestId("is-rateable");

      // 両方の試合が評価可能であることを確認
      expect(rateableStatuses[0]).toHaveTextContent("true");
      expect(rateableStatuses[1]).toHaveTextContent("true");
    });

    it("displays winner team IDs from backend data", () => {
      render(<GuestHomePage />);

      const winnerIds = screen.getAllByTestId("winner-team-id");

      // 正しい勝者チームIDが表示されることを確認
      expect(winnerIds[0]).toHaveTextContent("33"); // Manchester United
      expect(winnerIds[1]).toHaveTextContent("47"); // Liverpool
    });

    it("renders correct number of match cards based on featured matches data", () => {
      render(<GuestHomePage />);

      // featuredMatchesの数と一致することを確認
      const matchCards = screen.getAllByTestId(/^match-card-/);
      expect(matchCards).toHaveLength(2);
    });
  });

  describe("Component Structure", () => {
    it("renders main sections without crashing", () => {
      render(<GuestHomePage />);

      // 主要なセクションが存在することを確認（データに関連する部分）
      expect(screen.getByTestId("match-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("match-card-2")).toBeInTheDocument();
    });

    it("passes match data correctly to PublicMatchCard components", () => {
      render(<GuestHomePage />);

      // 各試合カードが正しいデータを受け取っていることを確認
      const matchCard1 = screen.getByTestId("match-card-1");
      const matchCard2 = screen.getByTestId("match-card-2");

      expect(matchCard1).toBeInTheDocument();
      expect(matchCard2).toBeInTheDocument();

      // 各カード内のデータが正しく表示されることを確認
      const homeTeams = screen.getAllByTestId("home-team-name");
      const awayTeams = screen.getAllByTestId("away-team-name");

      expect(homeTeams).toHaveLength(2);
      expect(awayTeams).toHaveLength(2);
    });
  });
});
