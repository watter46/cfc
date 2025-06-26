import { useState, useCallback } from "react";
import { ENV_CONFIG } from "@/app/config/env";
import { getWebUrl, API_ENDPOINTS } from "@/app/config/api";

/**
 * ソーシャルログインのカスタムフック
 * 
 * このフックは以下の機能を提供します：
 * - Google OAuth認証への遷移処理
 * - X OAuth認証への遷移処理  
 * - ローディング状態の管理
 * - エラーハンドリング
 * 
 * @returns {Object} ソーシャルログインの状態と操作関数
 */
export function useSocialLogin() {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Googleログインボタン押下時の処理
   * web.phpルートを使用（/apiプレフィックス不要）
   */
  const handleGoogleLogin = useCallback(() => {
    try {
      setError(null);
      const googleAuthUrl = getWebUrl(API_ENDPOINTS.auth.social.google.redirect);
      console.log("Googleログイン開始:", googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error("Google login error:", err);
      setError("Googleログインに失敗しました");
    }
  }, []);

  /**
   * Xログインボタン押下時の処理
   * web.phpルートを使用（/apiプレフィックス不要）
   */
  const handleXLogin = useCallback(() => {
    try {
      setError(null);
      const xAuthUrl = getWebUrl(
        `${API_ENDPOINTS.auth.social.x.redirect}?redirect_uri=${encodeURIComponent(
          ENV_CONFIG.GOOGLE_REDIRECT_URI
        )}`
      );
      console.log("Xログイン開始:", xAuthUrl);
      window.location.href = xAuthUrl;
    } catch (err) {
      console.error("X login error:", err);
      setError("Xログインに失敗しました");
    }
  }, []);

  return {
    handleGoogleLogin,
    handleXLogin,
    isLoading,
    error,
  };
}
