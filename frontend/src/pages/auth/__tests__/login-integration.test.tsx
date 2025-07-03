import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { AuthProvider } from "../../../features/auth/contexts/AuthContext";
import LoginPage from "../login";
import * as useAuthQuery from "../../../features/auth/hooks/useAuthQuery";
import type {
  LoginResponse,
  ApiError,
  LoginRequest,
} from "../../../features/auth/types/api";

// React Routerのnavigate関数をモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

// SocialLoginButtonsコンポーネントをモック
vi.mock("@/features/auth/components/SocialLoginButtons", () => ({
  default: () => <div data-testid="social-login-buttons">Social Login</div>,
}));

// エラーハンドリングユーティリティをモック
vi.mock("@/features/auth/utils/errorHandling", () => ({
  getErrorMessage: vi.fn((error) => {
    if (error?.message) return error.message;
    return "認証エラーが発生しました";
  }),
}));

// useSigninフックのモック
const mockMutateAsync = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

const createMockUseSignin = (
  overrides: Partial<
    UseMutationResult<LoginResponse, ApiError, LoginRequest, unknown>
  > = {}
) =>
  ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    isPending: false,
    isIdle: true,
    isError: false,
    isSuccess: false,
    isPaused: false,
    error: null,
    data: undefined,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    reset: mockReset,
    status: "idle" as const,
    submittedAt: 0,
    ...overrides,
  }) as UseMutationResult<LoginResponse, ApiError, LoginRequest, unknown>;

const mockUseSignin = createMockUseSignin();

describe("LoginPage 統合テスト", () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const renderLoginPage = (initialEntries = ["/login"]) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // useLoginフックをモック
    vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(mockUseLogin);

    // モックの初期化
    mockMutateAsync.mockClear();
    mockNavigate.mockClear();
    mockReset.mockClear();

    // mockUseLoginの状態をリセット
    Object.assign(mockUseLogin, createMockUseLogin());
  });

  describe("ページレイアウト", () => {
    it("ログインページが正しく表示される", () => {
      renderLoginPage();

      // ページタイトル
      expect(screen.getByText("おかえりなさい")).toBeInTheDocument();

      // メインレイアウトの確認
      expect(document.querySelector("main")).toBeInTheDocument();

      // フォームコンテナの確認
      const formContainer = document.querySelector(".max-w-md");
      expect(formContainer).toBeInTheDocument();
    });

    it("ヘッダーとフッターが表示される", () => {
      renderLoginPage();

      // MainLayoutが使われていることを間接的に確認
      const mainElement = document.querySelector("main");
      expect(mainElement).toBeInTheDocument();
    });
  });

  describe("LoginFormコンポーネント", () => {
    it("LoginFormが正しく表示される", () => {
      renderLoginPage();

      // LoginFormの主要要素
      expect(screen.getByText("おかえりなさい")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "ログイン" })
      ).toBeInTheDocument();
    });

    it("SocialLoginButtonsが表示される", () => {
      renderLoginPage();

      expect(screen.getByTestId("social-login-buttons")).toBeInTheDocument();
    });
  });

  describe("フォーム操作", () => {
    it("フォーム入力からログイン成功まで一連の流れが動作する", async () => {
      mockMutateAsync.mockResolvedValueOnce({ token: "test-token" });

      renderLoginPage();

      // フォーム入力
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(screen.getByPlaceholderText("パスワード"), "password123");

      // フォーム送信
      const submitButton = screen.getByRole("button", { name: "ログイン" });
      await user.click(submitButton);

      // API呼び出しの確認
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      // 成功時のリダイレクト
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/matches");
      });
    });

    it("ログイン失敗時にエラーが表示される", async () => {
      const errorMock = createMockUseLogin({
        error: { message: "認証に失敗しました" } as ApiError,
        isError: true,
        status: "error",
      });
      vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(errorMock);

      renderLoginPage();

      // エラーメッセージの表示確認
      expect(screen.getByText("認証に失敗しました")).toBeInTheDocument();
    });
  });

  describe("ナビゲーションリンク", () => {
    it("登録ページへのリンクが正しく動作する", () => {
      renderLoginPage();

      const registerLink = screen.getByText("新規登録");
      expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    });

    it("パスワード忘れページへのリンクが正しく動作する", () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByText("パスワードを忘れましたか？");
      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/forgot-password"
      );
    });
  });

  describe("レスポンシブデザイン", () => {
    it("モバイル表示用のスタイルが適用される", () => {
      renderLoginPage();

      const container = document.querySelector(".w-full.max-w-md");
      expect(container).toBeInTheDocument();

      // Tailwind CSSのレスポンシブクラスが適用されていることを確認
      const formContainer = document.querySelector(".px-4");
      expect(formContainer).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("フォーム要素にアクセシビリティ属性が設定されている", () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText("メールアドレス");
      const passwordInput = screen.getByPlaceholderText("パスワード");
      const submitButton = screen.getByRole("button", { name: "ログイン" });

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("キーボードナビゲーションが可能", async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText("メールアドレス");
      const passwordInput = screen.getByPlaceholderText("パスワード");

      // Tab順序の確認
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(passwordInput);
    });
  });
});
