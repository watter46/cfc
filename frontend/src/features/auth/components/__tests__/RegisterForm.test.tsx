import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import RegisterForm from "../RegisterForm";
import * as useAuthQuery from "../../hooks/useAuthQuery";
import type {
  ApiError,
  RegisterResponse,
  RegisterRequest,
} from "../../types/api";

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
    return "登録エラーが発生しました";
  }),
}));

// useRegisterフックのモック
const mockMutateAsync = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

// Partial型を使用してより柔軟なモックを作成
const createMockUseRegister = (
  overrides: Partial<
    UseMutationResult<RegisterResponse, ApiError, RegisterRequest, unknown>
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
  }) as UseMutationResult<RegisterResponse, ApiError, RegisterRequest, unknown>;

const mockUseRegister = createMockUseRegister();

describe("RegisterForm", () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const renderRegisterForm = (initialEntries = ["/register"]) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <RegisterForm />
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
    mockMutateAsync.mockClear();
    mockMutate.mockClear();
    mockReset.mockClear();
    mockNavigate.mockClear();

    // モックオブジェクトを初期状態にリセット
    Object.assign(mockUseRegister, createMockUseRegister());

    // useRegisterフックをモック
    vi.spyOn(useAuthQuery, "useRegister").mockReturnValue(mockUseRegister);

    // console.logをモック（デバッグ情報出力のため）
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("初期表示", () => {
    it("初期状態で登録フォームが表示される", () => {
      renderRegisterForm();

      expect(
        screen.getByRole("heading", { name: "アカウント作成" })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("お名前")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("パスワード（6文字以上）")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード確認")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "アカウント作成" })
      ).toBeInTheDocument();
    });

    it("初期状態で必要な要素が表示される", () => {
      renderRegisterForm();

      expect(screen.getByTestId("social-login-buttons")).toBeInTheDocument();
      expect(
        screen.getByText("またはメールアドレスで登録")
      ).toBeInTheDocument();
      expect(screen.getByText("利用規約")).toBeInTheDocument();
      expect(screen.getByText("プライバシーポリシー")).toBeInTheDocument();
      expect(
        screen.getByText("すでにアカウントをお持ちですか？")
      ).toBeInTheDocument();
      expect(screen.getByText("ログイン")).toBeInTheDocument();
    });

    it("両方のパスワードが初期状態で非表示になっている", () => {
      renderRegisterForm();

      const passwordInput =
        screen.getByPlaceholderText("パスワード（6文字以上）");
      const confirmPasswordInput =
        screen.getByPlaceholderText("パスワード確認");

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });
  });

  describe("フォーム入力", () => {
    it("名前入力時：値が正しく更新される", async () => {
      renderRegisterForm();
      const nameInput = screen.getByPlaceholderText("お名前");

      await user.type(nameInput, "山田太郎");

      expect(nameInput).toHaveValue("山田太郎");
    });

    it("メールアドレス入力時：値が正しく更新される", async () => {
      renderRegisterForm();
      const emailInput = screen.getByPlaceholderText("メールアドレス");

      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("パスワード入力時：値が正しく更新される", async () => {
      renderRegisterForm();
      const passwordInput =
        screen.getByPlaceholderText("パスワード（6文字以上）");

      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("パスワード確認入力時：値が正しく更新される", async () => {
      renderRegisterForm();
      const confirmPasswordInput =
        screen.getByPlaceholderText("パスワード確認");

      await user.type(confirmPasswordInput, "password123");

      expect(confirmPasswordInput).toHaveValue("password123");
    });
  });

  describe("パスワード表示切り替え", () => {
    it("パスワード表示ボタンクリック時：パスワードが表示される", async () => {
      renderRegisterForm();
      const passwordInput =
        screen.getByPlaceholderText("パスワード（6文字以上）");
      const toggleButtons = screen.getAllByRole("button", { name: "" });
      const passwordToggle = toggleButtons[0]; // 最初のトグルボタン

      await user.type(passwordInput, "secret");
      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("パスワード確認表示ボタンクリック時：パスワード確認が表示される", async () => {
      renderRegisterForm();
      const confirmPasswordInput =
        screen.getByPlaceholderText("パスワード確認");
      const toggleButtons = screen.getAllByRole("button", { name: "" });
      const confirmPasswordToggle = toggleButtons[1]; // 2番目のトグルボタン

      await user.type(confirmPasswordInput, "secret");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });
  });

  describe("フォームバリデーション", () => {
    it("パスワード不一致時：バリデーションエラーが表示される", async () => {
      renderRegisterForm();

      await user.type(screen.getByPlaceholderText("お名前"), "山田太郎");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード確認"),
        "different"
      );
      await user.click(screen.getByRole("checkbox"));

      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      expect(
        screen.getByText("パスワードが一致しません。")
      ).toBeInTheDocument();
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("パスワード短すぎる時：バリデーションエラーが表示される", async () => {
      renderRegisterForm();

      await user.type(screen.getByPlaceholderText("お名前"), "山田太郎");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "123"
      );
      await user.type(screen.getByPlaceholderText("パスワード確認"), "123");
      await user.click(screen.getByRole("checkbox"));

      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      expect(
        screen.getByText("パスワードは6文字以上で入力してください。")
      ).toBeInTheDocument();
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("利用規約未同意時：フォーム送信されない", async () => {
      renderRegisterForm();

      await user.type(screen.getByPlaceholderText("お名前"), "山田太郎");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード確認"),
        "password123"
      );
      // チェックボックスをクリックしない

      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("フォーム送信", () => {
    const fillValidForm = async () => {
      await user.type(screen.getByPlaceholderText("お名前"), "山田太郎");
      await user.type(
        screen.getByPlaceholderText("メールアドレス"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード（6文字以上）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("パスワード確認"),
        "password123"
      );
      await user.click(screen.getByRole("checkbox"));
    };

    it("有効な情報入力時：登録が実行される", async () => {
      mockMutateAsync.mockResolvedValueOnce({ token: "mock-token" });

      renderRegisterForm();
      await fillValidForm();

      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "山田太郎",
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123",
      });
    });

    it("登録成功時：成功メッセージが表示される", async () => {
      mockMutateAsync.mockResolvedValueOnce({ token: "mock-token" });

      renderRegisterForm();
      await fillValidForm();

      await user.click(screen.getByRole("button", { name: "アカウント作成" }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "アカウントが正常に作成されました！ログインしています..."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中：ボタンが無効化される", () => {
      const loadingMock = createMockUseRegister({
        isPending: true,
        isIdle: false,
        status: "pending" as const,
      });

      vi.spyOn(useAuthQuery, "useRegister").mockReturnValue(loadingMock);

      renderRegisterForm();

      const submitButton = screen.getByRole("button", { name: "登録中..." });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    it("ローディング中：ボタンテキストが変更される", () => {
      const loadingMock = createMockUseRegister({
        isPending: true,
        isIdle: false,
        status: "pending" as const,
      });

      vi.spyOn(useAuthQuery, "useRegister").mockReturnValue(loadingMock);

      renderRegisterForm();

      expect(screen.getByText("登録中...")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "アカウント作成" })
      ).not.toBeInTheDocument();
    });
  });

  describe("エラー処理", () => {
    it("登録エラー時：エラーメッセージが表示される", () => {
      const errorMessage: ApiError = {
        message: "メールアドレスは既に使用されています",
      };

      // エラー状態のモックを作成
      const errorMock = createMockUseRegister({
        error: errorMessage,
        isError: true,
        isIdle: false,
        status: "error" as const,
      });

      vi.spyOn(useAuthQuery, "useRegister").mockReturnValue(errorMock);

      renderRegisterForm();

      expect(
        screen.getByText("メールアドレスは既に使用されています")
      ).toBeInTheDocument();
      expect(
        screen.getByText("メールアドレスは既に使用されています").closest("div")
      ).toHaveClass("bg-red-500/10", "border-red-500/20", "text-red-400");
    });
  });

  describe("ナビゲーションリンク", () => {
    it("利用規約リンク：正しいパスを指している", () => {
      renderRegisterForm();

      const termsLink = screen.getByText("利用規約");
      expect(termsLink.closest("a")).toHaveAttribute("href", "/terms");
    });

    it("プライバシーポリシーリンク：正しいパスを指している", () => {
      renderRegisterForm();

      const privacyLink = screen.getByText("プライバシーポリシー");
      expect(privacyLink.closest("a")).toHaveAttribute("href", "/privacy");
    });

    it("ログインリンク：正しいパスを指している", () => {
      renderRegisterForm();

      const loginLink = screen.getByText("ログイン");
      expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    });
  });
});
