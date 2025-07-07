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
 * Cookie認証のユーティリティ関数
 * Sanctum Cookie認証で注意すべきポイント：
 * 1. withCredentials: true でCookieを自動送信
 * 2. CSRF保護の実装
 * 3. ドメイン/サブドメインの一致
 * 4. HTTPSでの本番運用（secure cookies）
 */
export const authCookieUtils = {
  /**
   * 認証状態のチェック（Cookie認証では常にサーバーに確認）
   * エンドポイント: /user/auth/me
   */
  checkAuth: async (): Promise<boolean> => {
    try {
      await api.auth.me();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * CSRF保護のための事前準備
   * 認証が必要な操作の前に必ず呼び出す
   * Sanctum標準エンドポイント: /sanctum/csrf-cookie
   */
  ensureCsrfToken: async (): Promise<void> => {
    try {
      const { apiClient } = await import("@/shared/lib/api-client");
      const { getWebUrl, API_ENDPOINTS } = await import("@/app/config/api");
      await apiClient.get(getWebUrl(API_ENDPOINTS.auth.csrf));
    } catch (error) {
      console.warn("CSRF token取得に失敗:", error);
    }
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
    // Cookie認証では常に実行可能
  });
}

/**
 * サインイン処理のためのカスタムフック
 * Sanctum Cookie認証では事前のCSRF準備が重要
 */
export function useSignin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      // Sanctumでは認証前にCSRFトークンの取得が必要
      await authCookieUtils.ensureCsrfToken();
      return api.auth.signin(credentials);
    },
    onSuccess: () => {
      // Cookie認証では自動的にCookieが設定される
      // サインイン成功時にユーザー情報を再取得
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
    onError: (error) => {
      // 401/419エラー（CSRF関連）の場合は特別処理を検討
      if (error.status === 419) {
        console.warn("CSRF token mismatch. 再度トークンを取得してください。");
      }
    },
  });
}

/**
 * サインアップ処理のためのカスタムフック
 * Sanctum Cookie認証では事前のCSRF準備が重要
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: async (userData: RegisterRequest) => {
      // Sanctumでは認証前にCSRFトークンの取得が必要
      await authCookieUtils.ensureCsrfToken();
      return api.auth.signup(userData);
    },
    onSuccess: () => {
      // Cookie認証では自動的にCookieが設定される
      // サインアップ成功時にユーザー情報を再取得
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
    onError: (error) => {
      // 401/419エラー（CSRF関連）の場合は特別処理を検討
      if (error.status === 419) {
        console.warn("CSRF token mismatch. 再度トークンを取得してください。");
      }
    },
  });
}

/**
 * サインアウト処理のためのカスタムフック
 */
export function useSignout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async (): Promise<void> => {
      await api.auth.signout();
    },
    onSuccess: () => {
      // Cookie認証では自動的にCookieが削除される
      // サインアウト成功時にすべてのキャッシュをクリア
      queryClient.clear();
    },
    onError: () => {
      // エラーが発生してもキャッシュをクリア
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
  const signinMutation = useSignin();
  const signupMutation = useSignup();
  const signoutMutation = useSignout();

  return {
    // ユーザー情報
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data && !userQuery.error,

    // サインイン関連
    signin: signinMutation.mutate,
    signinError: signinMutation.error,
    isSigningIn: signinMutation.isPending,

    // サインアップ関連
    signup: signupMutation.mutate,
    signupError: signupMutation.error,
    isSigningUp: signupMutation.isPending,

    // サインアウト関連
    signout: signoutMutation.mutate,
    isSigningOut: signoutMutation.isPending,
  };
}
