import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * ユーザー情報の型定義
 */
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 認証コンテキストの型定義
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * 認証コンテキストの作成
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

      const response = await fetch(`${API_BASE_URL}/login`, {
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
  const register = async (name: string, email: string, password: string) => {
    try {
      // CSRF保護の初期化
      await initializeCsrf();

      const response = await fetch(`${API_BASE_URL}/register`, {
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
          password_confirmation: password,
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
      await fetch(`${API_BASE_URL}/logout`, {
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
      const response = await fetch(`${API_BASE_URL}/api/user`, {
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
   * 初期化時に認証状態をチェック
   */
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 認証コンテキストを使用するためのカスタムフック
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * 型のエクスポート
 */
export type { User, AuthContextType };
