import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useAuth } from "../useAuth";
import {
  AuthContext,
  type AuthContextType,
} from "../../contexts/AuthContextDefinition";

// モックのAuthContextValue
const mockAuthContextValue: AuthContextType = {
  user: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  isAuthenticated: true,
  isLoading: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  hasToken: () => true,
  removeToken: () => {},
};

// AuthProviderのモック
const TestAuthProvider: React.FC<{
  children: React.ReactNode;
  value?: AuthContextType;
}> = ({ children, value = mockAuthContextValue }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

describe("useAuth", () => {
  it("AuthProvider内で使用した場合に認証コンテキストを返すべき", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TestAuthProvider value={mockAuthContextValue}>
          {children}
        </TestAuthProvider>
      ),
    });

    expect(result.current).toEqual(mockAuthContextValue);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe("Test User");
  });

  it("AuthProvider外で使用した場合にエラーを投げるべき", () => {
    // コンソールエラーを無視
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    console.error = originalError;
  });

  it("認証済みの場合：正しいユーザー情報を返す", () => {
    const authenticatedContext: AuthContextType = {
      user: {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        created_at: "2024-01-02T00:00:00.000Z",
        updated_at: "2024-01-02T00:00:00.000Z",
      },
      isAuthenticated: true,
      isLoading: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      forgotPassword: () => Promise.resolve(),
      checkAuth: () => Promise.resolve(),
      hasToken: () => true,
      removeToken: () => {},
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TestAuthProvider value={authenticatedContext}>
          {children}
        </TestAuthProvider>
      ),
    });

    expect(result.current.user?.id).toBe(2);
    expect(result.current.user?.name).toBe("John Doe");
    expect(result.current.user?.email).toBe("john@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("未認証の場合：正しい状態を返す", () => {
    const unauthenticatedContext: AuthContextType = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      forgotPassword: () => Promise.resolve(),
      checkAuth: () => Promise.resolve(),
      hasToken: () => false,
      removeToken: () => {},
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TestAuthProvider value={unauthenticatedContext}>
          {children}
        </TestAuthProvider>
      ),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("ローディング中の場合：正しいローディング状態を返す", () => {
    const loadingContext: AuthContextType = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      forgotPassword: () => Promise.resolve(),
      checkAuth: () => Promise.resolve(),
      hasToken: () => false,
      removeToken: () => {},
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TestAuthProvider value={loadingContext}>{children}</TestAuthProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
