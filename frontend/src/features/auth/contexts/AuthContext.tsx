import React, { useEffect, useState, useRef } from "react";
import {
  AuthContext,
  type AuthContextType,
  type User,
} from "./AuthContextDefinition";
import { api } from "@/shared/lib/api-client";
import { API_CONFIG } from "@/app/config/api";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationPromise, setInitializationPromise] =
    useState<Promise<void> | null>(null);
  const hasInitialized = useRef(false);

  /**
   * サインイン処理
   * 統一されたAPIクライアントを使用
   * 成功時にユーザー状態を即座に更新
   */
  const signin = async (email: string, password: string) => {
    try {
      const signinResponse = await api.auth.signin({ email, password });

      // ユーザー情報を設定（APIレス
      const newUser = convertToUser(signinResponse.data);
      setUser(newUser);
      setIsLoading(false);

      return newUser; // 成功時にユーザー情報を返す
    } catch (error: any) {
      console.error("❌ Signin failed:", error);

      // エラーメッセージを詳細化
      let errorMessage = "ログインに失敗しました";
      if (error.response?.status === 401) {
        errorMessage = "メールアドレスまたはパスワードが間違っています";
      } else if (error.response?.status === 422) {
        errorMessage = "入力内容に問題があります";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "ネットワークエラーが発生しました";
      }

      // エラーを再スローしてUIで表示できるようにする
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  };

  /**
   * サインアップ処理
   * 統一されたAPIクライアントを使用
   */
  const signup = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      const signupResponse = await api.auth.signup({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // ユーザー情報を設定（APIレスポンスをUser型に変換）
      setUser(convertToUser(signupResponse.data));
    } catch (error: any) {
      console.error("Signup failed:", error);

      // エラーメッセージを詳細化
      let errorMessage = "アカウント作成に失敗しました";
      if (error.response?.status === 422) {
        errorMessage = "入力内容に問題があります";
      } else if (error.response?.data?.errors) {
        // バリデーションエラーの詳細を取得
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(", ");
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "ネットワークエラーが発生しました";
      }

      // エラーを再スローしてUIで表示できるようにする
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  };

  /**
   * サインアウト処理
   * 統一されたAPIクライアントを使用
   */
  const signout = async () => {
    try {
      // APIサーバーにサインアウトリクエストを送信
      await api.auth.signout();
    } catch (error) {
      console.error("Signout API failed:", error);

      // API呼び出しが失敗してもローカル状態はクリアする
    } finally {
      // ローカルの状態を必ずクリア
      setUser(null);
    }
  };

  /**
   * 認証状態を確認し復元する
   * アプリ起動時にCSRFトークンも初期化
   * React Strict Mode対応：重複実行を完全に防止
   */
  const checkAuth = async () => {
    // refでも二重チェック
    if (hasInitialized.current || isInitialized || initializationPromise) {
      if (initializationPromise) {
        await initializationPromise;
      }
      return;
    }

    // 初期化を開始することを即座にマーク
    hasInitialized.current = true;
    setIsInitialized(true);

    // 初期化プロミスを作成して、同時実行を防ぐ
    const promise = (async () => {
      try {
        // まずCSRFトークンを取得（エラーが発生してもログに残すだけで続行）
        try {
          await import("@/shared/lib/api-client").then(({ apiClient }) =>
            apiClient.get(`${API_CONFIG.baseURL}/sanctum/csrf-cookie`, {
              withCredentials: true,
            })
          );
        } catch (csrfError) {
          console.warn(
            "⚠️ CSRF初期化でエラーが発生しましたが、認証チェックを続行します:",
            csrfError
          );
        }

        const authResponse = await api.auth.me();
        setUser(convertToUser(authResponse.data));
      } catch (error: any) {
        // 401エラー（未認証）は正常な状態なので、エラーレベルを下げる
        if (error.response?.status === 401) {
          // ユーザーは未認証（正常な状態）
        } else {
          console.error("❌ 認証状態の確認でエラーが発生しました:", error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
        setInitializationPromise(null);
      }
    })();

    setInitializationPromise(promise);
    await promise;
  };

  /**
   * パスワードリセット処理
   * 統一されたAPIクライアントを使用（将来的に実装予定）
   */
  const forgotPassword = async (_email: string) => {
    try {
      // TODO: APIクライアントにforgotPasswordメソッドを追加
      throw new Error("パスワードリセット機能は現在実装中です");
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  };

  /**
   * 初期化時に認証状態をチェック
   * React Strict Mode対応：cleanup関数で重複実行を防ぐ
   */
  useEffect(() => {
    // hasInitialized.current で厳格にチェック
    if (hasInitialized.current) {
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted || hasInitialized.current) return;
      await checkAuth();
    };

    initializeAuth();

    // cleanup: コンポーネントがアンマウントされた場合はフラグを無効化
    return () => {
      isMounted = false;
    };
  }, []); // 依存配列を空にして、初回のみ実行

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signin,
    signup,
    signout,
    checkAuth,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
