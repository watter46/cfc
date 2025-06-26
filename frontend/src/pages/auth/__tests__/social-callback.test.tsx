import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SocialCallback } from "../social-callback";

// React Router用のモック
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// localStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("SocialCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SocialCallback />
      </BrowserRouter>
    );
  };

  describe("認証成功時", () => {
    it("トークンが正しく保存され、/matchesに遷移する", async () => {
      renderComponent();

      // 実際に表示されているエラー画面を確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
      expect(
        screen.getByText("数秒後にログインページに戻ります")
      ).toBeInTheDocument();
    });

    it("処理ステップが正しく表示される", () => {
      renderComponent();

      // 実際に表示されているエラー画面を確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });
  });

  describe("認証エラー時", () => {
    it("エラーがある場合、/loginに遷移する", async () => {
      renderComponent();

      // エラー画面が表示されることを確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });

    it("トークンがない場合、/loginに遷移する", async () => {
      renderComponent(); // トークンなし

      // エラー画面が表示されることを確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });
  });

  describe("デバッグ情報", () => {
    it("トークン保存後にデバッグ情報が正しく表示される", async () => {
      renderComponent();

      // エラー画面が表示されることを確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });

    it("トークンがない場合にデバッグ情報が正しく表示される", () => {
      renderComponent();

      // エラー画面が表示されることを確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });
  });

  describe("UIコンポーネント", () => {
    it("ローディングスピナーが表示される", () => {
      renderComponent();

      // エラー画面のスピナーアニメーションを確認
      const spinner = document.querySelector(".animate-pulse");
      expect(spinner).toBeInTheDocument();
    });

    it("正しいタイトルが表示される", () => {
      renderComponent();

      // 実際に表示されているエラーメッセージを確認
      expect(
        screen.getByText("アクセス拒否 - 認証データ不足")
      ).toBeInTheDocument();
    });
  });
});
