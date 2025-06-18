import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PublicMatchCard from "../PublicMatchCard";
import type { Match } from "@/shared/types/index.ts";

/**
 * テスト用のモック試合データ
 */
const mockMatch: Match = {
  date: "05/01",
  score: {
    away: 4,
    home: 1,
    penalty: {
      away: 0,
      home: 0,
    },
    fulltime: {
      away: 4,
      home: 1,
    },
    halftime: {
      away: 2,
      home: 0,
    },
    extratime: {
      away: 0,
      home: 0,
    },
  },
  home: {
    id: 37,
    name: "Djurgardens IF",
    logo_path: "storage/image/team/364.webp",
  },
  away: {
    id: 1,
    name: "Chelsea",
    logo_path: "storage/image/team/49.webp",
  },
  WinnerTeamId: 1,
  isRateable: false,
};

/**
 * 引き分け試合のモックデータ
 */
const mockDrawMatch: Match = {
  date: "04/13",
  score: {
    away: 2,
    home: 2,
    penalty: {
      away: 0,
      home: 0,
    },
    fulltime: {
      away: 2,
      home: 2,
    },
    halftime: {
      away: 2,
      home: 0,
    },
    extratime: {
      away: 0,
      home: 0,
    },
  },
  home: {
    id: 1,
    name: "Chelsea",
    logo_path: "storage/image/team/49.webp",
  },
  away: {
    id: 20,
    name: "Ipswich",
    logo_path: "storage/image/team/57.webp",
  },
  WinnerTeamId: null,
  isRateable: false,
};

describe("PublicMatchCard", () => {
  it("試合情報を正しく表示する", () => {
    render(<PublicMatchCard match={mockMatch} />);

    // 試合日の表示
    expect(screen.getByText("05/01")).toBeInTheDocument();

    // チーム名の表示
    expect(screen.getByText("Djurgardens IF")).toBeInTheDocument();
    expect(screen.getByText("Chelsea")).toBeInTheDocument();

    // スコアの表示
    expect(screen.getByText("1")).toBeInTheDocument(); // ホームチームスコア
    expect(screen.getByText("4")).toBeInTheDocument(); // アウェイチームスコア

    // 前半スコアの表示
    expect(screen.getByText("(前半: 0)")).toBeInTheDocument();
    expect(screen.getByText("(前半: 2)")).toBeInTheDocument();
  });

  it("勝利チームのスタイルが正しく適用される", () => {
    render(<PublicMatchCard match={mockMatch} />);

    // 勝利チーム（Chelsea）の親コンテナのスタイルクラスを確認
    const winnerContainer = screen.getByText("Chelsea").closest(".border");
    expect(winnerContainer).toHaveClass("text-neon-green");

    // 敗北チーム（Djurgardens IF）の親コンテナのスタイルクラスを確認
    const loserContainer = screen
      .getByText("Djurgardens IF")
      .closest(".border");
    expect(loserContainer).toHaveClass("text-gray-400");
  });

  it("引き分けの場合のスタイルが正しく適用される", () => {
    render(<PublicMatchCard match={mockDrawMatch} />);

    // 引き分け表示の確認
    expect(screen.getByText("引き分け")).toBeInTheDocument();

    // 両チームとも引き分けスタイルが適用されることを確認
    const homeTeamContainer = screen.getByText("Chelsea").closest(".border");
    const awayTeamContainer = screen.getByText("Ipswich").closest(".border");

    expect(homeTeamContainer).toHaveClass("text-yellow-400");
    expect(awayTeamContainer).toHaveClass("text-yellow-400");
  });

  it("評価可能状態が正しく表示される", () => {
    const rateableMatch = { ...mockMatch, isRateable: true };
    render(<PublicMatchCard match={rateableMatch} />);

    expect(screen.getByText("評価可能")).toBeInTheDocument();
  });

  it("評価終了状態が正しく表示される", () => {
    render(<PublicMatchCard match={mockMatch} />);

    expect(screen.getByText("評価終了")).toBeInTheDocument();
  });

  it("クリック時にonSelectコールバックが呼ばれる", () => {
    const onSelectMock = vi.fn();
    render(<PublicMatchCard match={mockMatch} onSelect={onSelectMock} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(onSelectMock).toHaveBeenCalledWith(mockMatch);
  });

  it("キーボード操作でカードが選択できる", () => {
    const onSelectMock = vi.fn();
    render(<PublicMatchCard match={mockMatch} onSelect={onSelectMock} />);

    const card = screen.getByRole("button");

    // Enterキーのテスト
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onSelectMock).toHaveBeenCalledWith(mockMatch);

    // スペースキーのテスト
    fireEvent.keyDown(card, { key: " " });
    expect(onSelectMock).toHaveBeenCalledTimes(2);
  });

  it("画像のエラーハンドリングが動作する", () => {
    render(<PublicMatchCard match={mockMatch} />);

    const homeTeamLogo = screen.getByAltText("Djurgardens IF logo");

    // 画像読み込みエラーをシミュレート
    fireEvent.error(homeTeamLogo);

    // デフォルト画像のパスに変更されることを確認
    expect(homeTeamLogo).toHaveAttribute(
      "src",
      "/images/default-team-logo.png"
    );
  });
});
