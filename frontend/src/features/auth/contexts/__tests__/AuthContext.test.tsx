import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "../../hooks/useAuth";
import { api } from "@/shared/lib/api-client";

// APIクライアントをモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      signin: vi.fn(),
      signup: vi.fn(),
      signout: vi.fn(),
      getUser: vi.fn(),
    },
  },
}));

// テスト用コンポーネント
function TestComponent() {
  const { user, isAuthenticated, isLoading, signin, signup, signout } =
    useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.name : "null"}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button onClick={() => signin("test@example.com", "password")}>
        Signin
      </button>
      <button
        onClick={() =>
          signup("Test User", "test@example.com", "password", "password")
        }
      >
        Signup
      </button>
      <button onClick={() => signout()}>Signout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では未認証状態である", async () => {
    (api.auth.getUser as any).mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    });
  });

  it("Cookie認証で認証状態を復元する", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2023-01-01",
    };

    (api.auth.getUser as any).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test User");
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    });
  });

  it("サインインが成功する", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2023-01-01",
    };

    (api.auth.getUser as any).mockRejectedValueOnce(new Error("Unauthorized"));
    (api.auth.signin as any).mockResolvedValue({ user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 初期状態を確認
    await waitFor(() => {
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    });

    // サインインをクリック
    screen.getByText("Signin").click();

    await waitFor(() => {
      expect(api.auth.signin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password",
      });
    });
  });

  it("サインアップが成功する", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2023-01-01",
    };

    (api.auth.getUser as any).mockRejectedValueOnce(new Error("Unauthorized"));
    (api.auth.signup as any).mockResolvedValue({ user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // サインアップをクリック
    screen.getByText("Signup").click();

    await waitFor(() => {
      expect(api.auth.signup).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password",
        password_confirmation: "password",
      });
    });
  });

  it("サインアウトが成功する", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2023-01-01",
    };

    (api.auth.getUser as any).mockResolvedValueOnce(mockUser);
    (api.auth.signout as any).mockResolvedValue({ message: "Success" });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 認証状態を確認
    await waitFor(() => {
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
    });

    // サインアウトをクリック
    screen.getByText("Signout").click();

    await waitFor(() => {
      expect(api.auth.signout).toHaveBeenCalled();
    });
  });
});
