import React, { useEffect, useState } from "react";
import {
  AuthContext,
  type AuthContextType,
  type User,
} from "./AuthContextDefinition";
import { api } from "@/shared/lib/api-client";

/**
 * APIレスポンスをUser型に変換するヘルパー関数
 */
function convertToUser(apiUser: any): User {
  return {
    id: String(apiUser.id), // numberをstringに変換
    name: apiUser.name,
    email: apiUser.email,
    createdAt: apiUser.created_at ? new Date(apiUser.created_at) : new Date(), // created_at -> createdAt
  };
}

/**
 * 認証プロバイダーコンポーネント
 * Laravel Sanctumとの認証連携を管理
 * 統一されたAPIクライアントを使用
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ログイン処理
   * 統一されたAPIクライアントを使用
   */
  const login = async (email: string, password: string) => {
    try {
      const loginData = await api.auth.login({ email, password });

      // トークンが返された場合は保存
      if (loginData.token) {
        localStorage.setItem("auth_token", loginData.token);
      }

      // ユーザー情報を設定（APIレスポンスをUser型に変換）
      setUser(convertToUser(loginData.user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * 新規登録処理
   * 統一されたAPIクライアントを使用
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      console.log("新規登録処理を開始します:", { name, email });
      const registerData = await api.auth.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // トークンが返された場合は保存
      if (registerData.token) {
        localStorage.setItem("auth_token", registerData.token);
      }

      // ユーザー情報を設定（APIレスポンスをUser型に変換）
      setUser(convertToUser(registerData.user));
      console.log("新規登録に成功しました:", registerData.user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  /**
   * ログアウト処理
   * 統一されたAPIクライアントを使用
   */
  const logout = async () => {
    try {
      console.log("ログアウト処理を開始します");
      await api.auth.logout();
      console.log("ログアウトに成功しました");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // ローカルの状態をクリア
      setUser(null);
      localStorage.removeItem("auth_token");
    }
  };

  /**
   * 認証状態の確認（サイレント認証）
   * トークンを使ってユーザー情報を取得し、認証状態を復元します
   */
  const checkAuth = async () => {
    try {
      // トークンが存在しない場合は早期リターン
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const authData = await api.auth.me();

      // APIレスポンスがユーザー情報のみの場合（通常の/auth/meエンドポイント）
      const userData = convertToUser(authData);

      // 注意：/auth/meエンドポイントは通常、新しいトークンを返しません
      // 既存のトークンをそのまま使用します

      // ユーザー情報を設定
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      // トークンが無効な場合は削除
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * パスワードリセット処理
   * 統一されたAPIクライアントを使用（将来的に実装予定）
   */
  const forgotPassword = async (email: string) => {
    try {
      console.log("パスワードリセット処理を開始します:", email);
      // TODO: APIクライアントにforgotPasswordメソッドを追加
      throw new Error("パスワードリセット機能は現在実装中です");
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  };

  /**
   * Google認証などでアクセストークンを保存し、認証状態を更新
   */
  const setToken = async (token: string) => {
    localStorage.setItem("auth_token", token);
    await checkAuth();
  };

  /**
   * Google認証成功時にユーザー情報とトークンを同時に設定
   */
  const setUserAndToken = async (user: User, token: string) => {
    console.log("setUserAndToken called:", { user, token });
    localStorage.setItem("auth_token", token);
    setUser(user);
    setIsLoading(false); // ローディング状態を解除
    console.log("ユーザー情報とトークンの設定が完了しました");
  };

  /**
   * 初期化時に認証状態をチェック
   * 重複呼び出しを防ぐため初回のみ実行
   */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      // トークンがある場合は、ユーザー情報の復元を試みる
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []); // 依存配列を空にして、初回のみ実行

  /**
   * トークンの存在確認
   */
  const hasToken = () => {
    return !!localStorage.getItem("auth_token");
  };

  /**
   * トークンの削除
   */
  const removeToken = () => {
    localStorage.removeItem("auth_token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    forgotPassword,
    hasToken,
    removeToken,
    setToken, // 追加
    setUserAndToken, // 新規追加
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
