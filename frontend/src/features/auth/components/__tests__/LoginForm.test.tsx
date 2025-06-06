import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import LoginForm from "../LoginForm";
import * as useAuthQuery from "../../hooks/useAuthQuery";
import type { LoginResponse, ApiError, LoginRequest } from "../../types/api";

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
vi.mock("../SocialLoginButtons", () => ({
  default: () => <div data-testid="social-login-buttons">Social Login</div>,
}));

// エラーハンドリングユーティリティをモック
vi.mock("../../utils/errorHandling", () => ({
  getErrorMessage: vi.fn((error) => {
    if (error?.message) return error.message;
    return "認証エラーが発生しました";
  }),
}));

// useLoginフックのモック
const mockMutateAsync = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

// Partial型を使用してより柔軟なモックを作成
const createMockUseLogin = (
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

const mockUseLogin = createMockUseLogin();

describe("LoginForm", () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const renderLoginForm = (initialEntries = ["/login"]) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <LoginForm />
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

    // useLoginフックをモック
    vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(mockUseLogin);

    // モックの初期化
    mockMutateAsync.mockClear();
    mockNavigate.mockClear();
    mockReset.mockClear();

    // mockUseLoginの状態をリセット
    Object.assign(mockUseLogin, createMockUseLogin());
  });

  describe("初期表示", () => {
    it("初期状態でログインフォームが表示される", () => {
      renderLoginForm();

      expect(screen.getByText("おかえりなさい")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "ログイン" })
      ).toBeInTheDocument();
      expect(screen.getByTestId("social-login-buttons")).toBeInTheDocument();
    });

    it("初期状態で必要な要素が表示される", () => {
      renderLoginForm();

      expect(screen.getByText("ログイン状態を保持")).toBeInTheDocument();
      expect(
        screen.getByText("パスワードを忘れましたか？")
      ).toBeInTheDocument();
      expect(
        screen.getByText("アカウントをお持ちでないですか？")
      ).toBeInTheDocument();
      expect(screen.getByText("新規登録")).toBeInTheDocument();
    });

    it("パスワードが初期状態で非表示になっている", () => {
      renderLoginForm();

      const passwordInput = screen.getByPlaceholderText("パスワード");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("フォーム入力", () => {
    it("メールアドレス入力時：値が正しく更新される", async () => {
      renderLoginForm();
      const emailInput = screen.getByPlaceholderText("メールアドレス");

      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("パスワード入力時：値が正しく更新される", async () => {
      renderLoginForm();
      const passwordInput = screen.getByPlaceholderText("パスワード");

      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("チェックボックス操作時：状態が正しく切り替わる", async () => {
      renderLoginForm();
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("パスワード表示切り替え", () => {
    it("表示ボタンクリック時：パスワードが表示される", async () => {
      renderLoginForm();
      const passwordInput = screen.getByPlaceholderText("パスワード");
      const toggleButton = screen.getByRole("button", { name: "" }); // Eye icon button

      await user.type(passwordInput, "secret");
      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("非表示ボタンクリック時：パスワードが非表示になる", async () => {
      renderLoginForm();
      const passwordInput = screen.getByPlaceholderText("パスワード");
      const toggleButton = screen.getByRole("button", { name: "" }); // Eye icon button

      await user.type(passwordInput, "secret");

      // まず表示状態にする
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      // 再度クリックして非表示にする
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("フォーム送信", () => {
    it("有効な情報入力時：ログインが実行される", async () => {
      mockMutateAsync.mockResolvedValueOnce({ token: "mock-token" });

      renderLoginForm();

      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(screen.getByPlaceholderText("パスワード"), "password123");

      const submitButton = screen.getByRole("button", { name: "ログイン" });
      await user.click(submitButton);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("ログイン成功時：ホームページに遷移する", async () => {
      mockMutateAsync.mockResolvedValueOnce({ token: "mock-token" });

      renderLoginForm();

      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(screen.getByPlaceholderText("パスワード"), "password123");

      await user.click(screen.getByRole("button", { name: "ログイン" }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("必須項目未入力時：フォーム送信されない", async () => {
      renderLoginForm();

      // メールアドレスのみ入力してパスワードを空にする
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );

      await user.click(screen.getByRole("button", { name: "ログイン" }));

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中：ボタンが無効化される", () => {
      const loadingMock = createMockUseLogin({
        isPending: true,
        status: "pending",
      });
      vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(loadingMock);

      renderLoginForm();

      const submitButton = screen.getByRole("button", {
        name: "ログイン中...",
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    it("ローディング中：ボタンテキストが変更される", () => {
      const loadingMock = createMockUseLogin({
        isPending: true,
        status: "pending",
      });
      vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(loadingMock);

      renderLoginForm();

      expect(screen.getByText("ログイン中...")).toBeInTheDocument();
      expect(screen.queryByText("ログイン")).not.toBeInTheDocument();
    });
  });

  describe("エラー処理", () => {
    it("ログインエラー時：エラーメッセージが表示される", () => {
      const errorMock = createMockUseLogin({
        error: { message: "認証に失敗しました" } as ApiError,
        isError: true,
        status: "error",
      });
      vi.spyOn(useAuthQuery, "useLogin").mockReturnValue(errorMock);

      renderLoginForm();

      expect(screen.getByText("認証に失敗しました")).toBeInTheDocument();
      expect(screen.getByText("認証に失敗しました").closest("div")).toHaveClass(
        "bg-red-500/10",
        "border-red-500/20",
        "text-red-400"
      );
    });

    it("ログイン失敗時：コンソールにエラーが出力される", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockError = new Error("ネットワークエラー");
      mockMutateAsync.mockRejectedValueOnce(mockError);

      renderLoginForm();

      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(screen.getByPlaceholderText("パスワード"), "password123");
      await user.click(screen.getByRole("button", { name: "ログイン" }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Login failed:", mockError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe("ナビゲーションリンク", () => {
    it("パスワード忘れリンク：正しいパスを指している", () => {
      renderLoginForm();

      const forgotPasswordLink = screen.getByText("パスワードを忘れましたか？");
      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/forgot-password"
      );
    });

    it("新規登録リンク：正しいパスを指している", () => {
      renderLoginForm();

      const registerLink = screen.getByText("新規登録");
      expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    });
  });
});
