import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignupForm from "../SignupForm";
import { useSignup } from "../../hooks/useAuthQuery";

// useSignupフックをモック
vi.mock("../../hooks/useAuthQuery", () => ({
  useSignup: vi.fn(),
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

describe("SignupForm", () => {
  let queryClient: QueryClient;
  const mockMutateAsync = vi.fn();
  const mockUseSignup = {
    mutateAsync: mockMutateAsync,
    error: null,
    isPending: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    (useSignup as any).mockReturnValue(mockUseSignup);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  it("フォームが正しくレンダリングされる", () => {
    renderWithProviders(<SignupForm />);

    expect(screen.getByPlaceholderText("お名前")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("パスワード（6文字以上）")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード確認")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /アカウント作成/i })
    ).toBeInTheDocument();
  });

  it("入力フィールドが正しく動作する", () => {
    renderWithProviders(<SignupForm />);

    const nameInput = screen.getByPlaceholderText("お名前");
    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput =
      screen.getByPlaceholderText("パスワード（6文字以上）");
    const confirmPasswordInput = screen.getByPlaceholderText("パスワード確認");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    expect(nameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("フォーム送信が正しく動作する", async () => {
    mockMutateAsync.mockResolvedValue({ user: { id: 1, name: "Test User" } });

    renderWithProviders(<SignupForm />);

    const nameInput = screen.getByPlaceholderText("お名前");
    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput =
      screen.getByPlaceholderText("パスワード（6文字以上）");
    const confirmPasswordInput = screen.getByPlaceholderText("パスワード確認");
    const submitButton = screen.getByRole("button", {
      name: /アカウント作成/i,
    });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123",
      });
    });
  });

  it("パスワード不一致エラーが表示される", async () => {
    renderWithProviders(<SignupForm />);

    const nameInput = screen.getByPlaceholderText("お名前");
    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput =
      screen.getByPlaceholderText("パスワード（6文字以上）");
    const confirmPasswordInput = screen.getByPlaceholderText("パスワード確認");
    const submitButton = screen.getByRole("button", {
      name: /アカウント作成/i,
    });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "different" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("パスワードが一致しません。")
      ).toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("短いパスワードのエラーが表示される", async () => {
    renderWithProviders(<SignupForm />);

    const nameInput = screen.getByPlaceholderText("お名前");
    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput =
      screen.getByPlaceholderText("パスワード（6文字以上）");
    const confirmPasswordInput = screen.getByPlaceholderText("パスワード確認");
    const submitButton = screen.getByRole("button", {
      name: /アカウント作成/i,
    });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("パスワードは6文字以上で入力してください。")
      ).toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("ローディング状態が正しく表示される", () => {
    (useSignup as any).mockReturnValue({
      ...mockUseSignup,
      isPending: true,
    });

    renderWithProviders(<SignupForm />);

    expect(screen.getByText("サインアップ中...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /サインアップ中/i })
    ).toBeDisabled();
  });

  it("エラーメッセージが正しく表示される", () => {
    (useSignup as any).mockReturnValue({
      ...mockUseSignup,
      error: { message: "サインアップに失敗しました" },
    });

    renderWithProviders(<SignupForm />);

    expect(screen.getByText("サインアップに失敗しました")).toBeInTheDocument();
  });
});
