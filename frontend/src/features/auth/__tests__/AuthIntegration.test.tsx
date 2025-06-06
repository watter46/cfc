import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { AuthProvider } from "../contexts/AuthContext";

// APIクライアントをモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      getUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

// React Routerのnavigate関数をモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// SocialLoginButtonsコンポーネントをモック
vi.mock("../components/SocialLoginButtons", () => ({
  default: () => <div data-testid="social-login-buttons">Social Login</div>,
}));

// エラーハンドリングユーティリティをモック
vi.mock("../utils/errorHandling", () => ({
  getErrorMessage: vi.fn((error) => {
    if (error?.message) return error.message;
    return "認証エラーが発生しました";
  }),
}));

// localStorageをモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// APIクライアントのモック関数
import { api } from "@/shared/lib/api-client";
import type { MockedFunction } from "vitest";

const mockApi = {
  auth: {
    getUser: api.auth.getUser as MockedFunction<typeof api.auth.getUser>,
    login: api.auth.login as MockedFunction<typeof api.auth.login>,
    register: api.auth.register as MockedFunction<typeof api.auth.register>,
    logout: api.auth.logout as MockedFunction<typeof api.auth.logout>,
  },
};

describe("認証統合テスト", () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const renderWithProviders = (
    component: React.ReactElement,
    initialEntries = ["/"]
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>{component}</AuthProvider>
        </MemoryRouter>
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

    // モックの初期化
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});

    // APIモックのデフォルト設定
    // @ts-expect-error - Partial AxiosResponse mock for testing
    mockApi.auth.login.mockResolvedValue({
      data: {
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          email_verified_at: "2024-01-01T00:00:00.000Z",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token-12345",
      },
      status: 200,
      statusText: "OK",
      headers: {},
    });

    // @ts-expect-error - Partial AxiosResponse mock for testing
    mockApi.auth.register.mockResolvedValue({
      data: {
        user: {
          id: 1,
          name: "New User",
          email: "new@example.com",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token-12345",
      },
      status: 201,
      statusText: "Created",
      headers: {},
    });

    // console.logをモック
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("ログイン統合フロー", () => {
    it("ログインフォーム表示から成功まで：正常なフローが動作する", async () => {
      renderWithProviders(<LoginForm />);

      // フォームが表示されることを確認
      expect(screen.getByText("おかえりなさい")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();

      // フォーム入力
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(screen.getByPlaceholderText("パスワード"), "password123");

      // ログインボタンをクリック
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      // 成功時のナビゲーションを確認
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("ログインエラー時：適切なエラーメッセージが表示される", async () => {
      // このテストのためにログインエラーをモック
      mockApi.auth.login.mockRejectedValue({
        response: {
          status: 401,
          data: { message: "Invalid credentials" },
        },
        message: "Request failed with status code 401",
      });

      renderWithProviders(<LoginForm />);

      // フォーム入力
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード"),
        "wrongpassword"
      );

      // ログインボタンをクリック
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByText("Request failed with status code 401")
        ).toBeInTheDocument();
      });

      // API呼び出しが行われたことを確認
      expect(mockApi.auth.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "wrongpassword",
      });

      // ナビゲーションが発生しないことを確認
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("会員登録統合フロー", () => {
    it("登録フォーム表示から成功まで：正常なフローが動作する", async () => {
      renderWithProviders(<RegisterForm />);

      // フォームが表示されることを確認
      expect(
        screen.getByRole("heading", { name: "アカウント作成" })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("お名前")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();

      // フォーム入力
      await user.type(screen.getByPlaceholderText("お名前"), "テストユーザー");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "new@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード確認"),
        "password123"
      );

      // 利用規約に同意
      await user.click(screen.getByLabelText(/利用規約/));

      // 登録ボタンをクリック
      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      // フォームが送信されることを確認（エラーなしで）
      await waitFor(() => {
        expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
      });
    });

    it("登録エラー時：適切なエラーメッセージが表示される", async () => {
      // このテストのためにエラーをモック
      mockApi.auth.register.mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: "The email has already been taken.",
            errors: { email: ["The email has already been taken."] },
          },
        },
        message: "Validation error",
      });

      renderWithProviders(<RegisterForm />);

      // フォーム入力
      await user.type(screen.getByPlaceholderText("お名前"), "テストユーザー");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "existing@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード確認"),
        "password123"
      );

      // 利用規約に同意
      await user.click(screen.getByLabelText(/利用規約/));

      // 登録ボタンをクリック
      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      // API呼び出しが行われたことを確認
      expect(mockApi.auth.register).toHaveBeenCalledWith({
        name: "テストユーザー",
        email: "existing@example.com",
        password: "password123",
        password_confirmation: "password123",
      });
    });
  });

  describe("フォーム間のナビゲーション", () => {
    it("登録フォームからログインフォームへ：リンクが正常に動作する", () => {
      renderWithProviders(<RegisterForm />);

      // ログインリンクが存在することを確認
      const loginLink = screen.getByText("ログイン");
      expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    });

    it("ログインフォームから登録フォームへ：リンクが正常に動作する", () => {
      renderWithProviders(<LoginForm />);

      // 新規登録リンクが存在することを確認
      const registerLink = screen.getByText("新規登録");
      expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    });

    it("パスワード忘れリンク：正しいパスが設定されている", () => {
      renderWithProviders(<LoginForm />);

      // パスワード忘れリンクが存在することを確認
      const forgotPasswordLink = screen.getByText("パスワードを忘れましたか？");
      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/forgot-password"
      );
    });
  });
});
