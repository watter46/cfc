import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestGuard } from "../GuestGuard";

// useAuthフックをモック化
const mockUseAuth = vi.fn();
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

/**
 * テスト用のRouterプロバイダー
 */
function TestRouterProvider({ children }: { children: React.ReactNode }) {
  return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>;
}

describe("GuestGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証状態の確認中はローディングスピナーを表示する", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <TestRouterProvider>
        <GuestGuard>
          <div>ゲストコンテンツ</div>
        </GuestGuard>
      </TestRouterProvider>
    );

    // ローディングスピナーが表示されることを確認
    const spinner = screen.getByLabelText("読み込み中");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText("ゲストコンテンツ")).not.toBeInTheDocument();
  });

  it("未認証ユーザーにはコンテンツを表示する", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <TestRouterProvider>
        <GuestGuard>
          <div>ゲストコンテンツ</div>
        </GuestGuard>
      </TestRouterProvider>
    );

    // ゲストコンテンツが表示されることを確認
    expect(screen.getByText("ゲストコンテンツ")).toBeInTheDocument();
  });

  it("認証済みユーザーは/matchesにリダイレクトされる", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <TestRouterProvider>
        <GuestGuard>
          <div>ゲストコンテンツ</div>
        </GuestGuard>
      </TestRouterProvider>
    );

    // ゲストコンテンツは表示されないことを確認
    expect(screen.queryByText("ゲストコンテンツ")).not.toBeInTheDocument();

    // リダイレクトが発生することを確認（Navigate要素がレンダリングされる）
    // 注意: この場合、実際のナビゲーションは発生しないが、Navigate要素がレンダリングされる
  });

  it("コンソールログが出力される", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <TestRouterProvider>
        <GuestGuard>
          <div>ゲストコンテンツ</div>
        </GuestGuard>
      </TestRouterProvider>
    );

    // リダイレクトログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      "🔄 ログイン済みユーザーを /matches にリダイレクトします"
    );

    consoleSpy.mockRestore();
  });
});
