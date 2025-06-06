import React, { useEffect, useState } from "react";
import {
  AuthContext,
  type AuthContextType,
  type User,
} from "./AuthContextDefinition";

/**
 * APIのベースURL（環境変数から取得、デフォルトはlocalhost:8000）
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * 認証プロバイダーコンポーネント
 * Laravel Sanctumとの認証連携を管理
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * CSRF保護を有効にする
   */
  const initializeCsrf = async () => {
    try {
      await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("CSRF initialization failed:", error);
    }
  };

  /**
   * ログイン処理
   */
  const login = async (email: string, password: string) => {
    try {
      // CSRF保護の初期化
      await initializeCsrf();

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ログインに失敗しました");
      }

      // ユーザー情報を取得
      await checkAuth();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * 新規登録処理
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      // CSRF保護の初期化
      await initializeCsrf();

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "登録に失敗しました");
      }

      // ユーザー情報を取得
      await checkAuth();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  /**
   * ログアウト処理
   */
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  /**
   * 認証状態の確認
   */
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * パスワードリセット処理
   */
  const forgotPassword = async (email: string) => {
    try {
      await initializeCsrf();

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "パスワードリセットメールの送信に失敗しました"
        );
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  };

  /**
   * 初期化時に認証状態をチェック
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * トークンの存在確認（セッションベース認証では常にfalse）
   */
  const hasToken = () => {
    return false; // セッションベース認証ではトークンを使用しない
  };

  /**
   * トークンの削除（セッションベース認証では何もしない）
   */
  const removeToken = () => {
    // セッションベース認証ではトークンを使用しないため何もしない
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
