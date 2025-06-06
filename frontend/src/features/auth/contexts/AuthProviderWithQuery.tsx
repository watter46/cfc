import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext, type AuthContextType } from "./AuthContextDefinition";
import { useAuthState } from "../hooks/useAuthState";
import {
  useLogin,
  useRegister,
  useLogout,
  authTokenUtils,
} from "../hooks/useAuthQuery";

/**
 * React Query統合版の認証プロバイダー（トークンベース認証対応）
 * パフォーマンスとエラーハンドリングを最適化
 */
export function AuthProviderWithQuery({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const authState = useAuthState();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  /**
   * ログイン実装
   * @param email - ユーザーのメールアドレス
   * @param password - ユーザーのパスワード
   */
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
    // ログイン成功後、ユーザー情報を再取得
    await authState.refetch();
  };

  /**
   * 登録実装
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    await registerMutation.mutateAsync({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    // 登録成功後、ユーザー情報を再取得
    await authState.refetch();
  };

  /**
   * ログアウト実装
   */
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // ログアウトは失敗してもローカル状態をクリア
      console.warn(
        "Logout API call failed, clearing local state anyway:",
        error
      );
    } finally {
      // 確実にローカル状態をクリア
      authTokenUtils.removeToken();
      queryClient.clear();
    }
  };

  /**
   * パスワード忘れ実装（プレースホルダー）
   */
  const forgotPassword = async (email: string) => {
    // TODO: パスワードリセット機能の実装
    console.log("Password reset for:", email);
    throw new Error("パスワードリセット機能は未実装です");
  };

  /**
   * 認証状態確認
   */
  const checkAuth = async () => {
    await authState.refetch();
  };

  const contextValue: AuthContextType = {
    user: authState.user || null,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    forgotPassword,
    checkAuth,
    // トークン関連のユーティリティを追加
    ...authTokenUtils,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * 既存のAuthProviderとの互換性を保つためのエクスポート
 */
export { AuthProviderWithQuery as AuthProvider };
