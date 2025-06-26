import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProtectedRoute, AuthGuard } from "../ProtectedRoute";

// useAuthフックをモック化
const mockUseAuth = vi.fn();
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// localStorageをモック化
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

/**
 * テスト用のRouterプロバイダー
 */
function TestRouterProvider({ 
  children, 
  initialEntries = ["/matches"] 
}: { 
  children: React.ReactNode;
  initialEntries?: string[];
}) {
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("トークンがない場合はローディングではなく、リダイレクトが発生する", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <TestRouterProvider>
        <ProtectedRoute>
          <div>認証済みコンテンツ</div>
        </ProtectedRoute>
      </TestRouterProvider>
    );

    // 認証済みコンテンツは表示されないことを確認
    expect(screen.queryByText("認証済みコンテンツ")).not.toBeInTheDocument();
  });

  it("トークンがある場合はコンテンツを表示する", () => {
    mockLocalStorage.getItem.mockReturnValue("valid-token");

    render(
      <TestRouterProvider>
        <ProtectedRoute>
          <div>認証済みコンテンツ</div>
        </ProtectedRoute>
      </TestRouterProvider>
    );

    // 認証済みコンテンツが表示されることを確認
    expect(screen.getByText("認証済みコンテンツ")).toBeInTheDocument();
  });

  it("トークンがない場合はコンソールログが出力される", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <TestRouterProvider>
        <ProtectedRoute>
          <div>認証済みコンテンツ</div>
        </ProtectedRoute>
      </TestRouterProvider>
    );

    // リダイレクトログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      "トークンがないため、ログインページにリダイレクト"
    );

    consoleSpy.mockRestore();
  });

  it("トークンがある場合はコンソールログが出力される", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue("valid-token");

    render(
      <TestRouterProvider>
        <ProtectedRoute>
          <div>認証済みコンテンツ</div>
        </ProtectedRoute>
      </TestRouterProvider>
    );

    // 成功ログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      "トークンが存在するため、保護されたコンテンツを表示"
    );

    consoleSpy.mockRestore();
  });

  it("異なるパスから/loginへのリダイレクト", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <TestRouterProvider initialEntries={["/protected-page"]}>
        <ProtectedRoute>
          <div>保護されたページ</div>
        </ProtectedRoute>
      </TestRouterProvider>
    );

    // 保護されたコンテンツは表示されないことを確認
    expect(screen.queryByText("保護されたページ")).not.toBeInTheDocument();
    
    // ログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      "トークンがないため、ログインページにリダイレクト"
    );

    consoleSpy.mockRestore();
  });
});

describe("AuthGuard", () => {
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
        <AuthGuard>
          <div>未認証用コンテンツ</div>
        </AuthGuard>
      </TestRouterProvider>
    );

    // ローディングスピナーが表示されることを確認
    expect(screen.queryByText("未認証用コンテンツ")).not.toBeInTheDocument();
    // ローディング状態を確認するために、コンテナの存在を確認
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it("未認証ユーザーにはコンテンツを表示する", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <TestRouterProvider>
        <AuthGuard>
          <div>未認証用コンテンツ</div>
        </AuthGuard>
      </TestRouterProvider>
    );

    // 未認証用コンテンツが表示されることを確認
    expect(screen.getByText("未認証用コンテンツ")).toBeInTheDocument();
  });

  it("認証済みユーザーは/matchesにリダイレクトされる", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <TestRouterProvider>
        <AuthGuard>
          <div>未認証用コンテンツ</div>
        </AuthGuard>
      </TestRouterProvider>
    );

    // 未認証用コンテンツは表示されないことを確認
    expect(screen.queryByText("未認証用コンテンツ")).not.toBeInTheDocument();
  });
});
