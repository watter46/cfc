import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Header from "../Header";
import { useAuth } from "../../../features/auth/hooks/useAuth";

// useAuthフックをモック
vi.mock("../../../features/auth/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// React Router Domのnavigateをモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header", () => {
  const mockSignout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("未認証状態でSigninとSignupボタンが表示される", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    expect(screen.getByText("Signin")).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
    expect(screen.queryByText("Matches")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Signout")).not.toBeInTheDocument();
  });

  it("認証済み状態でMatches、Profile、Signoutボタンが表示される", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    expect(screen.getByText("Matches")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Signout")).toBeInTheDocument();
    expect(screen.queryByText("Signin")).not.toBeInTheDocument();
    expect(screen.queryByText("Signup")).not.toBeInTheDocument();
  });

  it("認証済み状態でSigninとSignupボタンが非表示になる", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    // Signin/Signupボタンが存在しないことを確認
    expect(screen.queryByText("Signin")).not.toBeInTheDocument();
    expect(screen.queryByText("Signup")).not.toBeInTheDocument();
  });

  it("Signoutボタンをクリックするとサインアウト処理が実行される", async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    const signoutButton = screen.getByText("Signout");
    fireEvent.click(signoutButton);

    expect(mockSignout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("モバイルメニューが正しく動作する", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    // モバイルメニューボタンを見つけてクリック
    const menuButton = screen.getByRole("button", { name: /メニューを開く/i });
    fireEvent.click(menuButton);

    // モバイルメニューが表示されることを確認
    expect(
      screen.getByRole("navigation", { name: /モバイルナビゲーション/i })
    ).toBeInTheDocument();
  });

  it("ロゴからホームページへのリンクが正しく設定されている", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      signout: mockSignout,
    });

    renderWithRouter(<Header />);

    const logoLink = screen.getByRole("link", { name: /ホームへ戻る/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
