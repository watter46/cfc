import { describe, test, expect } from "vitest";
import { getErrorMessage, categorizeError, ErrorType } from "../errorHandling";

describe("errorHandling", () => {
  describe("getErrorMessage", () => {
    test("未定義のエラーに対してデフォルトメッセージを返す", () => {
      expect(getErrorMessage(undefined)).toBe("不明なエラーが発生しました");
      expect(getErrorMessage(null)).toBe("不明なエラーが発生しました");
    });

    test("一般的なErrorオブジェクトのメッセージを返す", () => {
      const error = new Error("テストエラー");
      expect(getErrorMessage(error)).toBe("テストエラー");
    });

    test("Axiosエラーレスポンスを適切に処理する", () => {
      const axiosError = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
        message: "Request failed",
      };
      expect(getErrorMessage(axiosError)).toBe("Unauthorized");
    });

    test("Axiosエラーでdata.messageがない場合はHTTPステータスに基づくメッセージを返す", () => {
      const axiosError = {
        response: {
          status: 401,
        },
        message: "Request failed",
      };
      expect(getErrorMessage(axiosError)).toBe(
        "認証が必要です。ログインしてください。"
      );
    });

    test("バリデーションエラーの最初のエラーを返す", () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ["メールアドレスが必要です", "無効なメールアドレスです"],
              password: ["パスワードが必要です"],
            },
          },
        },
        message: "Validation failed",
      };
      expect(getErrorMessage(validationError)).toBe("メールアドレスが必要です");
    });

    test("HTTPステータスコードに基づくデフォルトメッセージ", () => {
      const unauthorizedError = {
        response: { status: 401 },
        message: "Unauthorized",
      };
      expect(getErrorMessage(unauthorizedError)).toBe(
        "認証が必要です。ログインしてください。"
      );

      const forbiddenError = {
        response: { status: 403 },
        message: "Forbidden",
      };
      expect(getErrorMessage(forbiddenError)).toBe(
        "この操作を実行する権限がありません。"
      );

      const notFoundError = {
        response: { status: 404 },
        message: "Not Found",
      };
      expect(getErrorMessage(notFoundError)).toBe("リソースが見つかりません。");

      const serverError = {
        response: { status: 500 },
        message: "Internal Server Error",
      };
      expect(getErrorMessage(serverError)).toBe(
        "サーバーエラーが発生しました。しばらく待ってから再試行してください。"
      );
    });
  });

  describe("categorizeError", () => {
    test("認証エラーを正しく分類する", () => {
      const authError = {
        response: { status: 401 },
        message: "Unauthorized",
      };
      expect(categorizeError(authError)).toBe(ErrorType.AUTHENTICATION);
    });

    test("認可エラーを正しく分類する", () => {
      const authzError = {
        response: { status: 403 },
        message: "Forbidden",
      };
      expect(categorizeError(authzError)).toBe(ErrorType.AUTHORIZATION);
    });

    test("バリデーションエラーを正しく分類する", () => {
      const validationError = {
        response: { status: 422 },
        message: "Validation failed",
      };
      expect(categorizeError(validationError)).toBe(ErrorType.VALIDATION);
    });

    test("サーバーエラーを正しく分類する", () => {
      const serverError = {
        response: { status: 500 },
        message: "Internal Server Error",
      };
      expect(categorizeError(serverError)).toBe(ErrorType.SERVER);

      const badGatewayError = {
        response: { status: 502 },
        message: "Bad Gateway",
      };
      expect(categorizeError(badGatewayError)).toBe(ErrorType.SERVER);
    });

    test("ネットワークエラーを正しく分類する", () => {
      const networkError = { code: "NETWORK_ERROR" };
      expect(categorizeError(networkError)).toBe(ErrorType.NETWORK);
    });

    test("不明なエラーを正しく分類する", () => {
      const unknownError = { response: { status: 418 } };
      expect(categorizeError(unknownError)).toBe(ErrorType.UNKNOWN);
    });
  });
});
