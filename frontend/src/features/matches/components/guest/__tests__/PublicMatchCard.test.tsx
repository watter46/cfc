import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PublicMatchCard from "../PublicMatchCard";
import type { ActualMatchData } from "@/shared/types/index.ts";

/**
 * テスト用のモック試合データ
 */
const mockMatch: ActualMatchData = {
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
const mockDrawMatch: ActualMatchData = {
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
  });

  it("勝利チームのスタイルが正しく適用される", () => {
    render(<PublicMatchCard match={mockMatch} />);

    // 勝利チーム（Chelsea）のテキストクラスを確認
    const winnerTeam = screen.getByText("Chelsea");
    expect(winnerTeam).toHaveClass("text-green-400");

    // 敗北チーム（Djurgardens IF）のテキストクラスを確認
    const loserTeam = screen.getByText("Djurgardens IF");
    expect(loserTeam).toHaveClass("text-gray-400");
  });

  it("引き分けの場合のスタイルが正しく適用される", () => {
    render(<PublicMatchCard match={mockDrawMatch} />);

    // 両チームとも引き分けスタイル（gray-400）が適用されることを確認
    const homeTeam = screen.getByText("Chelsea");
    const awayTeam = screen.getByText("Ipswich");

    expect(homeTeam).toHaveClass("text-gray-400");
    expect(awayTeam).toHaveClass("text-gray-400");
  });

  it("評価可能状態が正しく表示される", () => {
    const rateableMatch = { ...mockMatch, isRateable: true };
    render(<PublicMatchCard match={rateableMatch} />);

    expect(screen.getByText("評価可能")).toBeInTheDocument();
  });

  it("評価不可状態が正しく表示される", () => {
    render(<PublicMatchCard match={mockMatch} />);

    expect(screen.getByText("評価不可")).toBeInTheDocument();
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

  it("画像が正しく表示される", () => {
    render(<PublicMatchCard match={mockMatch} />);

    const homeTeamLogo = screen.getByAltText("Djurgardens IF logo");
    const awayTeamLogo = screen.getByAltText("Chelsea logo");

    // 画像のsrc属性が正しく設定されることを確認
    expect(homeTeamLogo).toHaveAttribute(
      "src",
      "/storage/image/team/364.webp"
    );
    expect(awayTeamLogo).toHaveAttribute(
      "src",
      "/storage/image/team/49.webp"
    );
  });
});
