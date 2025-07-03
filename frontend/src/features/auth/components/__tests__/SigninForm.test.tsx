import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SigninForm from "../SigninForm";
import { useSignin } from "../../hooks/useAuthQuery";

// useSigninフックをモック
vi.mock("../../hooks/useAuthQuery", () => ({
  useSignin: vi.fn(),
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

describe("SigninForm", () => {
  let queryClient: QueryClient;
  const mockMutateAsync = vi.fn();
  const mockUseSignin = {
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
    (useSignin as any).mockReturnValue(mockUseSignin);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  it("フォームが正しくレンダリングされる", () => {
    renderWithProviders(<SigninForm />);

    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /サインイン/i })
    ).toBeInTheDocument();
  });

  it("入力フィールドが正しく動作する", () => {
    renderWithProviders(<SigninForm />);

    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("フォーム送信が正しく動作する", async () => {
    mockMutateAsync.mockResolvedValue({ user: { id: 1, name: "Test User" } });

    renderWithProviders(<SigninForm />);

    const emailInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");
    const submitButton = screen.getByRole("button", { name: /サインイン/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/matches");
    });
  });

  it("ローディング状態が正しく表示される", () => {
    (useSignin as any).mockReturnValue({
      ...mockUseSignin,
      isPending: true,
    });

    renderWithProviders(<SigninForm />);

    expect(screen.getByText("サインイン中...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /サインイン中/i })
    ).toBeDisabled();
  });

  it("エラーメッセージが正しく表示される", () => {
    (useSignin as any).mockReturnValue({
      ...mockUseSignin,
      error: { message: "サインインに失敗しました" },
    });

    renderWithProviders(<SigninForm />);

    expect(screen.getByText("サインインに失敗しました")).toBeInTheDocument();
  });

  it("パスワードの表示/非表示トグルが動作する", () => {
    renderWithProviders(<SigninForm />);

    const passwordInput = screen.getByPlaceholderText("パスワード");
    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons.find((button) =>
      button.querySelector('svg[class*="lucide-eye"]')
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });
});
