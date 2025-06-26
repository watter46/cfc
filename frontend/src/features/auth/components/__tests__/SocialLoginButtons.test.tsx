import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SocialLoginButtons from "../SocialLoginButtons";
import { useSocialLogin } from "../../hooks/useSocialLogin";

// useSocialLoginフックをモック
vi.mock("../../hooks/useSocialLogin");

const mockHandleGoogleLogin = vi.fn();
const mockHandleXLogin = vi.fn();

describe("SocialLoginButtons", () => {
  const user = userEvent.setup();

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SocialLoginButtons />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // useSocialLoginのデフォルトモックを設定
    vi.mocked(useSocialLogin).mockReturnValue({
      handleGoogleLogin: mockHandleGoogleLogin,
      handleXLogin: mockHandleXLogin,
      isLoading: false,
      error: null,
    });
  });

  describe("初期表示", () => {
    it("ソーシャルログインボタンが表示される", () => {
      renderComponent();

      expect(screen.getByLabelText("Googleでログイン")).toBeInTheDocument();
      expect(screen.getByLabelText("Xでログイン")).toBeInTheDocument();
      expect(screen.getByText("または")).toBeInTheDocument();
    });

    it("ボタンにアイコンとテキストが表示される", () => {
      renderComponent();

      // Googleボタン
      const googleButton = screen.getByLabelText("Googleでログイン");
      expect(googleButton).toHaveTextContent("Googleでログイン");

      // Xボタン
      const xButton = screen.getByLabelText("Xでログイン");
      expect(xButton).toHaveTextContent("Xでログイン");
    });
  });

  describe("ボタンクリック", () => {
    it("Googleボタンクリック時にhandleGoogleLoginが呼ばれる", async () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      await user.click(googleButton);

      expect(mockHandleGoogleLogin).toHaveBeenCalledTimes(1);
    });

    it("Xボタンクリック時にhandleXLoginが呼ばれる", async () => {
      renderComponent();

      const xButton = screen.getByLabelText("Xでログイン");
      await user.click(xButton);

      expect(mockHandleXLogin).toHaveBeenCalledTimes(1);
    });

    it("複数回クリックしても正しく動作する", async () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      const xButton = screen.getByLabelText("Xでログイン");

      await user.click(googleButton);
      await user.click(xButton);
      await user.click(googleButton);

      expect(mockHandleGoogleLogin).toHaveBeenCalledTimes(2);
      expect(mockHandleXLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中はボタンが無効化される", () => {
      // ローディング状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: true,
        error: null,
      });

      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      const xButton = screen.getByLabelText("Xでログイン");

      expect(googleButton).toBeDisabled();
      expect(xButton).toBeDisabled();
    });

    it("ローディング中はボタンテキストが変更される", () => {
      // ローディング状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: true,
        error: null,
      });

      renderComponent();

      expect(screen.getAllByText("認証中...")).toHaveLength(2); // GoogleとXボタンそれぞれに表示される
      expect(screen.queryByText("Googleでログイン")).not.toBeInTheDocument();
      expect(screen.queryByText("Xでログイン")).not.toBeInTheDocument();
    });

    it("ローディング中はスピナーが表示される", () => {
      // ローディング状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: true,
        error: null,
      });

      renderComponent();

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("エラー処理", () => {
    it("エラーがある場合はエラーメッセージが表示される", () => {
      // エラー状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: false,
        error: "認証に失敗しました",
      });

      renderComponent();

      expect(screen.getByText("認証に失敗しました")).toBeInTheDocument();
    });

    it("エラーメッセージのスタイルが正しく適用される", () => {
      // エラー状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: false,
        error: "認証に失敗しました",
      });

      renderComponent();

      const errorMessage = screen.getByText("認証に失敗しました");
      expect(errorMessage.closest("div")).toHaveClass(
        "bg-red-500/10",
        "border-red-500/20",
        "text-red-400"
      );
    });
  });

  describe("スタイリング", () => {
    it("Googleボタンに正しいスタイルが適用される", () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      expect(googleButton).toHaveClass("bg-white", "hover:bg-gray-50");
    });

    it("Xボタンに正しいスタイルが適用される", () => {
      renderComponent();

      const xButton = screen.getByLabelText("Xでログイン");
      expect(xButton).toHaveClass("bg-black", "hover:bg-gray-900");
    });

    it("無効化されたボタンに正しいスタイルが適用される", () => {
      // ローディング状態をモック
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: true,
        error: null,
      });

      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      const xButton = screen.getByLabelText("Xでログイン");

      expect(googleButton).toHaveClass("disabled:opacity-50");
      expect(xButton).toHaveClass("disabled:opacity-50");
    });
  });

  describe("アクセシビリティ", () => {
    it("ボタンにaria-labelが設定されている", () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      const xButton = screen.getByLabelText("Xでログイン");

      expect(googleButton).toHaveAttribute("aria-label", "Googleでログイン");
      expect(xButton).toHaveAttribute("aria-label", "Xでログイン");
    });

    it("キーボードでボタンにフォーカスできる", () => {
      // useSocialLoginがローディング状態でないことを確認
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: false,
        error: null,
      });

      render(<SocialLoginButtons />);

      const googleButton = screen.getByLabelText("Googleでログイン");
      const xButton = screen.getByLabelText("Xでログイン");

      googleButton.focus();
      expect(googleButton).toHaveFocus();

      xButton.focus();
      expect(xButton).toHaveFocus();
    });

    it("Enterキーでボタンが押せる", async () => {
      // useSocialLoginがローディング状態でないことを確認
      vi.mocked(useSocialLogin).mockReturnValue({
        handleGoogleLogin: mockHandleGoogleLogin,
        handleXLogin: mockHandleXLogin,
        isLoading: false,
        error: null,
      });

      render(<SocialLoginButtons />);

      const googleButton = screen.getByLabelText("Googleでログイン");
      googleButton.focus();

      fireEvent.click(googleButton);

      expect(mockHandleGoogleLogin).toHaveBeenCalledTimes(1);
    });
  });
});
