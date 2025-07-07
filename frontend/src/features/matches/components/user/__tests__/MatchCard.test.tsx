import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MatchCard } from "../MatchCard";
import type { Match } from "../../../types/api";

const mockNavigate = vi.fn();

// React Router のモック
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// テスト用のモック試合データ
const mockMatch: Match = {
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
};

// テスト用のラッパーコンポーネント
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("MatchCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("試合カードが正しく表示される", () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    // チーム名の表示確認
    expect(screen.getByText("Legia Warszawa")).toBeInTheDocument();
    expect(screen.getByText("Chelsea")).toBeInTheDocument();

    // リーグ名の表示確認
    expect(
      screen.getByText("UEFA Europa Conference League")
    ).toBeInTheDocument();

    // シーズン名の表示確認
    expect(screen.getByText("2024 - 2025")).toBeInTheDocument();

    // スコアの表示確認
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("シーズン名が正しく表示される", () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    // シーズン名のバッジが表示されているか確認
    const seasonBadge = screen.getByText("2024 - 2025");
    expect(seasonBadge).toBeInTheDocument();
    expect(seasonBadge).toHaveClass("text-neon-purple");
  });

  it("異なるシーズン名でも正しく表示される", () => {
    const differentSeasonMatch: Match = {
      ...mockMatch,
      season: {
        id: 2,
        name: "2023 - 2024",
      },
    };

    renderWithRouter(<MatchCard match={differentSeasonMatch} />);

    expect(screen.getByText("2023 - 2024")).toBeInTheDocument();
  });

  it("試合カードをクリックすると詳細ページに遷移する", () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    // カード全体をクリック（cursor-pointerクラスが設定されている要素）
    const matchCard = document.querySelector(".cursor-pointer");

    expect(matchCard).toBeInTheDocument();

    if (matchCard) {
      fireEvent.click(matchCard);
      expect(mockNavigate).toHaveBeenCalledWith("/matches/59");
    }
  });

  it("評価不可の表示が正しく表示される", () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    expect(screen.getByText("評価不可")).toBeInTheDocument();
  });

  it("評価可能な場合の表示が正しく表示される", () => {
    const rateableMatch: Match = {
      ...mockMatch,
      rateable: true,
    };

    renderWithRouter(<MatchCard match={rateableMatch} />);

    expect(screen.getByText("評価可能")).toBeInTheDocument();
  });
});
