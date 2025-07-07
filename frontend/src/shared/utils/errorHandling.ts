import { AlertTriangle, WifiOff, Shield, User } from "lucide-react";

/**
 * エラーの種類を判定する関数
 */
export function getErrorType(
  error: any
): "network" | "auth" | "validation" | "csrf" | "server" | "unknown" {
  if (!error) return "unknown";

  if (
    error.code === "NETWORK_ERROR" ||
    error.message?.includes("Network Error")
  ) {
    return "network";
  }

  if (error.response?.status === 401) {
    return "auth";
  }

  if (error.response?.status === 422) {
    return "validation";
  }

  if (error.response?.status === 419 || error.message?.includes("CSRF")) {
    return "csrf";
  }

  if (error.response?.status >= 500) {
    return "server";
  }

  return "unknown";
}

/**
 * エラータイプに基づいてユーザーフレンドリーなメッセージを生成
 */
export function getUserFriendlyErrorMessage(error: any): {
  title: string;
  message: string;
  icon: typeof AlertTriangle;
  actionText?: string;
} {
  const errorType = getErrorType(error);

  switch (errorType) {
    case "network":
      return {
        title: "ネットワークエラー",
        message:
          "サーバーに接続できませんでした。インターネット接続を確認して、もう一度お試しください。",
        icon: WifiOff,
        actionText: "もう一度試す",
      };

    case "auth":
      return {
        title: "認証エラー",
        message: "メールアドレスまたはパスワードが間違っています。",
        icon: User,
        actionText: "再入力",
      };

    case "validation":
      return {
        title: "入力エラー",
        message:
          error.response?.data?.message ||
          "入力内容に問題があります。各項目を確認してください。",
        icon: AlertTriangle,
        actionText: "修正",
      };

    case "csrf":
      return {
        title: "セキュリティエラー",
        message:
          "セキュリティトークンの有効期限が切れました。ページを更新してもう一度お試しください。",
        icon: Shield,
        actionText: "ページを更新",
      };

    case "server":
      return {
        title: "サーバーエラー",
        message:
          "サーバー側で問題が発生しました。しばらく時間をおいてからお試しください。",
        icon: AlertTriangle,
        actionText: "しばらく後に再試行",
      };

    default:
      return {
        title: "予期しないエラー",
        message: error.message || "予期しないエラーが発生しました。",
        icon: AlertTriangle,
        actionText: "もう一度試す",
      };
  }
}

/**
 * バリデーションエラーの詳細を取得
 */
export function getValidationErrors(error: any): Record<string, string[]> {
  if (error.response?.status === 422 && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
}
