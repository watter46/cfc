import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useAuthQuery,
  authTokenUtils,
} from "../useAuthQuery";
import type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "../../types/api";

// APIクライアントをモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  },
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
    me: api.auth.me as MockedFunction<typeof api.auth.me>,
    login: api.auth.login as MockedFunction<typeof api.auth.login>,
    register: api.auth.register as MockedFunction<typeof api.auth.register>,
    logout: api.auth.logout as MockedFunction<typeof api.auth.logout>,
  },
};

// テスト用のWrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// モックデータ
const mockUser: UserResponse = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  email_verified_at: "2024-01-01T00:00:00.000Z",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

// SilentAuthResponse用のモックデータ
const mockSilentAuthUser = {
  id: "01JJ8XABCDEFGHIJKLMNOPQRST", // ULID形式
  name: "Test User",
  email: "test@example.com",
  email_verified_at: "2024-01-01T00:00:00.000Z",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockLoginRequest: LoginRequest = {
  email: "test@example.com",
  password: "password123",
};

const mockRegisterRequest: RegisterRequest = {
  name: "New User",
  email: "newuser@example.com",
  password: "password123",
  password_confirmation: "password123",
};

describe("authTokenUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getToken", () => {
    it("localStorageからトークンを返すべき", () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");

      const token = authTokenUtils.getToken();

      expect(token).toBe("test-token");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("auth_token");
    });

    it("トークンが存在しない場合はnullを返すべき", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const token = authTokenUtils.getToken();

      expect(token).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("auth_token");
    });
  });

  describe("setToken", () => {
    it("localStorageにトークンを保存すべき", () => {
      authTokenUtils.setToken("new-token");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "auth_token",
        "new-token"
      );
    });
  });

  describe("removeToken", () => {
    it("localStorageからトークンを削除すべき", () => {
      authTokenUtils.removeToken();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token");
    });
  });

  describe("hasToken", () => {
    it("トークンが存在する場合にtrueを返すべき", () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");

      const hasToken = authTokenUtils.hasToken();

      expect(hasToken).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("auth_token");
    });

    it("トークンが存在しない場合にfalseを返すべき", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const hasToken = authTokenUtils.hasToken();

      expect(hasToken).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("auth_token");
    });

    it("トークンが空文字の場合にfalseを返すべき", () => {
      mockLocalStorage.getItem.mockReturnValue("");

      const hasToken = authTokenUtils.hasToken();

      expect(hasToken).toBe(false);
    });
  });
});

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // APIモックのデフォルト動作を設定
    mockApi.auth.me.mockResolvedValue(mockSilentAuthUser);
  });

  it("ユーザーデータを正常に取得できる", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSilentAuthUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi.auth.me).toHaveBeenCalled();
  });

  it("認証エラーを適切に処理できる", async () => {
    mockLocalStorage.getItem.mockReturnValue("invalid-token");
    mockApi.auth.me.mockRejectedValue({
      response: { status: 401 },
      message: "Unauthorized",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("ローディング状態を正しく表示する", () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ログイン成功のデフォルトモック
    mockApi.auth.login.mockResolvedValue({
      user: mockUser,
      token: "mock-jwt-token-12345",
    });
  });

  it("ログインが成功した場合にトークンが保存される", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate(mockLoginRequest);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi.auth.login).toHaveBeenCalledWith(mockLoginRequest);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token-12345"
    );
  });

  it("ログインエラーを適切に処理できる", async () => {
    const errorRequest = { email: "error@example.com", password: "wrong" };

    // ログインエラーのモック
    mockApi.auth.login.mockRejectedValue({
      response: {
        status: 401,
        data: { message: "Invalid credentials" },
      },
      message: "Unauthorized",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate(errorRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(mockApi.auth.login).toHaveBeenCalledWith(errorRequest);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("useRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 登録成功のデフォルトモック
    mockApi.auth.register.mockResolvedValue({
      user: mockUser,
      token: "mock-jwt-token-12345",
    });
  });

  it("新規登録が成功した場合にトークンが保存される", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate(mockRegisterRequest);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi.auth.register).toHaveBeenCalledWith(mockRegisterRequest);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token-12345"
    );
  });

  it("新規登録エラーを適切に処理できる", async () => {
    const errorRequest = {
      name: "Test User",
      email: "existing@example.com",
      password: "password123",
      password_confirmation: "password123",
    };

    // 登録エラーのモック
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

    const wrapper = createWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate(errorRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(mockApi.auth.register).toHaveBeenCalledWith(errorRequest);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ログアウト成功のデフォルトモック
    mockApi.auth.logout.mockResolvedValue({
      message: "Logged out successfully",
    });
  });

  it("ログアウトが成功した場合にトークンが削除される", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi.auth.logout).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });
});

describe("useAuthQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // useAuthQueryはuseCurrentUserを使用するため、デフォルトでuserを返すモック
    mockApi.auth.me.mockResolvedValue(mockSilentAuthUser);
    mockApi.auth.login.mockResolvedValue({
      user: mockUser,
      token: "mock-jwt-token-12345",
    });
    mockApi.auth.register.mockResolvedValue({
      user: mockUser,
      token: "mock-jwt-token-12345",
    });
    mockApi.auth.logout.mockResolvedValue({
      message: "Logged out successfully",
    });
  });

  it("ユーザーが認証済みの場合に包括的な認証状態を提供する", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockSilentAuthUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(result.current.loginError).toBeNull();
    expect(result.current.registerError).toBeNull();
    expect(result.current.isLoggingIn).toBe(false);
    expect(result.current.isRegistering).toBe(false);
    expect(result.current.isLoggingOut).toBe(false);
  });

  it("ユーザーが未認証の場合に正しい状態を提供する", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    // 未認証時はmeが実行されないかエラーになる
    mockApi.auth.me.mockRejectedValue({
      response: { status: 401 },
      message: "Unauthorized",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(result.current.user).toBeUndefined();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });

  it("ローディング状態を正しく表示する", () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it("ログインミューテーションを正しく処理する", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test login
    result.current.login(mockLoginRequest);

    // Check that login was called and eventually completes
    await waitFor(() => {
      expect(result.current.isLoggingIn).toBe(false);
    });

    expect(mockApi.auth.login).toHaveBeenCalledWith(mockLoginRequest);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token-12345"
    );
  });

  it("新規登録ミューテーションを正しく処理する", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test register
    result.current.register(mockRegisterRequest);

    // Check that register was called and eventually completes
    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });

    expect(mockApi.auth.register).toHaveBeenCalledWith(mockRegisterRequest);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token-12345"
    );
  });

  it("ログアウトミューテーションを正しく処理する", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test logout
    result.current.logout();

    // Check that logout was called and eventually completes
    await waitFor(() => {
      expect(result.current.isLoggingOut).toBe(false);
    });

    expect(mockApi.auth.logout).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });

  it("失敗したミューテーションのエラー状態を提供する", async () => {
    mockLocalStorage.getItem.mockReturnValue("mock-token");

    // このテストのためにログインエラーをモック
    mockApi.auth.login.mockRejectedValue({
      response: {
        status: 401,
        data: { message: "Invalid credentials" },
      },
      message: "Unauthorized",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test failed login
    result.current.login({ email: "error@example.com", password: "wrong" });

    await waitFor(() => {
      expect(result.current.loginError).toBeTruthy();
    });

    expect(result.current.isLoggingIn).toBe(false);
    expect(mockApi.auth.login).toHaveBeenCalledWith({
      email: "error@example.com",
      password: "wrong",
    });
  });
});
