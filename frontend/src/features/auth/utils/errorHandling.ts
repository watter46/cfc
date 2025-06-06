import type { ApiError } from "../types/api";

/**
 * API エラーレスポンスから人間が読みやすいメッセージを抽出
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "不明なエラーが発生しました";

  // Axios エラーの場合（最初にチェック）
  if (isAxiosError(error)) {
    const data = error.response?.data;

    // Laravel のバリデーションエラー
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0] as string[];
      if (firstError && firstError.length > 0) {
        return firstError[0];
      }
    }

    // Laravel の一般的なエラー
    if (data?.message) {
      return data.message;
    }

    // HTTP ステータスコードに基づくデフォルトメッセージ
    switch (error.response?.status) {
      case 401:
        return "認証が必要です。ログインしてください。";
      case 403:
        return "この操作を実行する権限がありません。";
      case 404:
        return "リソースが見つかりません。";
      case 422:
        return "入力データに問題があります。";
      case 429:
        return "リクエストが多すぎます。しばらく待ってから再試行してください。";
      case 500:
        return "サーバーエラーが発生しました。しばらく待ってから再試行してください。";
      default:
        return `エラーが発生しました（ステータス: ${error.response?.status}）`;
    }
  }

  // カスタム ApiError の場合
  if (isApiError(error)) {
    // バリデーションエラーがある場合は最初のエラーを返す
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      if (firstError && firstError.length > 0) {
        return firstError[0];
      }
    }
    return error.message || "エラーが発生しました";
  }

  // 一般的な Error オブジェクト
  if (error instanceof Error) {
    return error.message;
  }

  // その他の場合
  return "予期しないエラーが発生しました";
}

/**
 * エラーが API エラーかどうかを判定するタイプガード
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * エラーが Axios エラーかどうかを判定するタイプガード
 */
function isAxiosError(error: unknown): error is {
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message: string;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    "message" in error
  );
}

/**
 * エラー分類の列挙型
 */
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  UNKNOWN = "unknown",
}

/**
 * エラーを分類する関数
 */
export function categorizeError(error: unknown): ErrorType {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    switch (status) {
      case 401:
        return ErrorType.AUTHENTICATION;
      case 403:
        return ErrorType.AUTHORIZATION;
      case 422:
        return ErrorType.VALIDATION;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  if (!error || (error as { code?: string }).code === "NETWORK_ERROR") {
    return ErrorType.NETWORK;
  }

  return ErrorType.UNKNOWN;
}
