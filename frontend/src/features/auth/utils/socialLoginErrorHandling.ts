/**
 * ソーシャルログインエラーハンドリング用ユーティリティ
 */

export interface SocialLoginError {
  type: "network" | "auth" | "server" | "unknown";
  message: string;
  originalError?: Error;
  timestamp: Date;
}

/**
 * ソーシャルログインエラーを統一的に処理する
 * @param error エラーオブジェクト
 * @param context エラーが発生したコンテキスト
 * @returns 処理されたエラー情報
 */
export function handleSocialLoginError(
  error: unknown,
  context: "google" | "x" | "callback"
): SocialLoginError {
  const timestamp = new Date();

  // ネットワークエラーの場合
  if (error instanceof Error && error.message.includes("Network Error")) {
    const socialError: SocialLoginError = {
      type: "network",
      message:
        "インターネット接続を確認してください。APIサーバーに接続できません。",
      originalError: error,
      timestamp,
    };

    console.error(`🌐 ソーシャルログイン（${context}）ネットワークエラー:`, {
      error: socialError,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return socialError;
  }

  // 認証エラーの場合（401, 403など）
  if (
    error instanceof Error &&
    (error.message.includes("401") ||
      error.message.includes("403") ||
      error.message.includes("Unauthorized"))
  ) {
    const socialError: SocialLoginError = {
      type: "auth",
      message: "ログインに失敗しました。もう一度お試しください。",
      originalError: error,
      timestamp,
    };

    console.error(`🔐 ソーシャルログイン（${context}）認証エラー:`, {
      error: socialError,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return socialError;
  }

  // サーバーエラーの場合（5xx）
  if (error instanceof Error && error.message.includes("500")) {
    const socialError: SocialLoginError = {
      type: "server",
      message:
        "サーバーで問題が発生しました。しばらく経ってからお試しください。",
      originalError: error,
      timestamp,
    };

    console.error(`🔧 ソーシャルログイン（${context}）サーバーエラー:`, {
      error: socialError,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return socialError;
  }

  // その他のエラー
  const socialError: SocialLoginError = {
    type: "unknown",
    message: "予期しないエラーが発生しました。もう一度お試しください。",
    originalError: error instanceof Error ? error : new Error(String(error)),
    timestamp,
  };

  console.error(`❓ ソーシャルログイン（${context}）不明なエラー:`, {
    error: socialError,
    originalError: error,
    userAgent: navigator.userAgent,
    url: window.location.href,
  });

  return socialError;
}

/**
 * ユーザー向けエラーメッセージを表示する
 * @param error ソーシャルログインエラー
 */
export function displaySocialLoginError(error: SocialLoginError): void {
  // ユーザー向けの簡潔なメッセージを表示
  console.error(`❌ ${error.message}`);

  // 開発環境では詳細情報も表示
  if (import.meta.env.DEV) {
    console.group("🔍 エラー詳細情報");
    console.log("エラータイプ:", error.type);
    console.log("発生時刻:", error.timestamp.toISOString());
    console.log("元のエラー:", error.originalError);
    console.groupEnd();
  }
}
