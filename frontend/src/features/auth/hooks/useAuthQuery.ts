import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SilentAuthResponse,
  ApiError,
} from "../types/api";

/**
 * トークンベース認証のユーティリティ関数
 */
export const authTokenUtils = {
  /**
   * トークンを取得
   */
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  /**
   * トークンを保存
   */
  setToken: (token: string): void => {
    localStorage.setItem("auth_token", token);
  },

  /**
   * トークンを削除
   */
  removeToken: (): void => {
    localStorage.removeItem("auth_token");
  },

  /**
   * トークンが存在するかチェック
   */
  hasToken: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};

/**
 * ユーザー情報を取得するためのカスタムフック
 */
export function useCurrentUser() {
  return useQuery<SilentAuthResponse, ApiError>({
    queryKey: ["user", "current"],
    queryFn: () => api.auth.me(),
    staleTime: 30 * 60 * 1000, // 30分間はキャッシュを新鮮として扱う
    retry: false, // 認証エラーの場合は再試行しない
    enabled: authTokenUtils.hasToken(), // トークンがある場合のみ実行
  });
}

/**
 * ログイン処理のためのカスタムフック
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (credentials: LoginRequest) => api.auth.login(credentials),
    onSuccess: (data) => {
      // トークンをローカルストレージに保存
      authTokenUtils.setToken(data.token);
      // ログイン成功時にユーザー情報を再取得
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

/**
 * ユーザー登録処理のためのカスタムフック
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: (userData: RegisterRequest) => api.auth.register(userData),
    onSuccess: (data) => {
      // トークンをローカルストレージに保存
      authTokenUtils.setToken(data.token);
      // 登録成功時にユーザー情報を再取得
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

/**
 * ログアウト処理のためのカスタムフック
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async (): Promise<void> => {
      await api.auth.logout();
    },
    onSuccess: () => {
      // トークンをローカルストレージから削除
      authTokenUtils.removeToken();
      // ログアウト成功時にすべてのキャッシュをクリア
      queryClient.clear();
    },
    onError: () => {
      // エラーが発生してもトークンは削除
      authTokenUtils.removeToken();
      queryClient.clear();
    },
  });
}

/**
 * 複合的なフックとして、認証状態を管理
 * React Query版のuseAuth（既存のuseAuth.tsと統合検討が必要）
 */
export function useAuthQuery() {
  const userQuery = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  return {
    // ユーザー情報
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data && !userQuery.error,

    // ログイン関連
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,

    // 登録関連
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,

    // ログアウト関連
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
