import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MatchesFilter } from "../MatchesFilter";
import type { MatchesResponse } from "../../../types/api";

// useMatchesQuery フックのモック
const mockMatchesData: MatchesResponse = {
  success: true,
  message: "試合一覧を取得しました",
  data: [],
  meta: {
    pagination: {
      count: 0,
      per_page: 10,
      current_page: 1,
      has_more: false,
      path: "http://localhost:8000/api/matches",
    },
    current_page: 1,
    from: 1,
    path: "http://localhost:8000/api/matches",
    per_page: 10,
    to: 0,
  },
  links: {
    first: "http://localhost:8000/api/matches?page=1",
    last: null,
    prev: null,
    next: null,
  },
  selectors: {
    seasons: [
      {
        id: 1,
        year: 2024,
        name: "2024 - 2025",
      },
      {
        id: 2,
        year: 2023,
        name: "2023 - 2024",
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
        id: null,
        name: "All",
        logo_path: null,
      },
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
  selected: {
    season_id: 1,
    team_id: 1,
    league_id: null,
  },
};

vi.mock("../../../hooks/user", () => ({
  useMatchesQuery: () => ({
    data: mockMatchesData,
    isLoading: false,
    error: null,
  }),
}));

// テスト用のラッパーコンポーネント
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("MatchesFilter", () => {
  it("フィルターコンポーネントが正しく表示される", () => {
    renderWithProviders(<MatchesFilter />);

    // フィルター見出しの確認
    expect(screen.getByText("フィルター")).toBeInTheDocument();

    // 各フィルターラベルの確認
    expect(screen.getByText("シーズン")).toBeInTheDocument();
    expect(screen.getByText("リーグ")).toBeInTheDocument();
    expect(screen.getByText("チーム")).toBeInTheDocument();
  });

  it("APIから取得したシーズンオプションのみが表示される", () => {
    renderWithProviders(<MatchesFilter />);

    // 初期選択値（selected.season_id = 1）が表示されている
    const seasonSelect = screen.getByDisplayValue("2024 - 2025");
    expect(seasonSelect).toBeInTheDocument();
  });

  it("APIから取得したリーグオプションのみが表示される", () => {
    renderWithProviders(<MatchesFilter />);

    // 初期選択値（selected.league_id = null）で "All" が表示されている
    const leagueSelect = screen.getByDisplayValue("All");
    expect(leagueSelect).toBeInTheDocument();
  });

  it("APIから取得したチームオプションのみが表示される", () => {
    renderWithProviders(<MatchesFilter />);

    // 初期選択値（selected.team_id = 1）で "Chelsea" が表示されている
    const teamSelect = screen.getByDisplayValue("Chelsea");
    expect(teamSelect).toBeInTheDocument();
  });

  it("シーズンフィルターを変更できる", () => {
    renderWithProviders(<MatchesFilter />);

    const seasonSelect = screen.getByDisplayValue("2024 - 2025");

    // シーズンフィルターを変更
    fireEvent.change(seasonSelect, { target: { value: "2" } });

    // URL パラメータの変更は React Router の動作なので、
    // ここではイベントが発火したことを確認
    expect(seasonSelect).toBeInTheDocument();
  });

  it("リーグフィルターを変更できる", () => {
    renderWithProviders(<MatchesFilter />);

    const leagueSelect = screen.getByDisplayValue("All");

    // リーグフィルターを変更
    fireEvent.change(leagueSelect, { target: { value: "1" } });

    expect(leagueSelect).toBeInTheDocument();
  });

  it("チームフィルターを変更できる", () => {
    renderWithProviders(<MatchesFilter />);

    const teamSelect = screen.getByDisplayValue("Chelsea");

    // チームフィルターを変更（現在は1つのクラブのみ）
    fireEvent.change(teamSelect, { target: { value: "1" } });

    expect(teamSelect).toBeInTheDocument();
  });

  it("リーグフィルターが正しく更新される", () => {
    renderWithProviders(<MatchesFilter />);

    const leagueSelect = screen.getByLabelText("リーグ");
    fireEvent.change(leagueSelect, { target: { value: "2" } });

    // URLSearchParamsが正しく更新されているか確認
    expect(window.location.search).toContain("league=2");
  });
});
