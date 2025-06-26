import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/shared/lib/api-client";
import { getErrorMessage } from "../errorHandling";
import type { ApiError } from "../../types/api";

// APIクライアントをモック
vi.mock("@/shared/lib/api-client", () => ({
  api: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    },
  },
}));

// console.errorをモック
const mockConsoleError = vi.fn();
vi.spyOn(console, "error").mockImplementation(mockConsoleError);

describe("APIクライアント エラーハンドリング", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ログインAPIエラー", () => {
    it("401エラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "認証に失敗しました",
        status: 401,
        code: "AUTH_FAILED",
      };

      vi.mocked(api.auth.login).mockRejectedValueOnce(mockError);

      try {
        await api.auth.login({ email: "test@example.com", password: "wrong" });
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("認証に失敗しました");
      }
    });

    it("422バリデーションエラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "バリデーションエラー",
        status: 422,
        code: "VALIDATION_ERROR",
        errors: {
          email: ["メールアドレスの形式が正しくありません"],
          password: ["パスワードは8文字以上である必要があります"],
        },
      };

      vi.mocked(api.auth.login).mockRejectedValueOnce(mockError);

      try {
        await api.auth.login({ email: "invalid", password: "123" });
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("メールアドレスの形式が正しくありません");
      }
    });

    it("500サーバーエラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "内部サーバーエラー",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      };

      vi.mocked(api.auth.login).mockRejectedValueOnce(mockError);

      try {
        await api.auth.login({ email: "test@example.com", password: "password" });
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("内部サーバーエラー");
      }
    });

    it("ネットワークエラー時に適切なエラーメッセージを返す", async () => {
      const mockError = new Error("Network Error");

      vi.mocked(api.auth.login).mockRejectedValueOnce(mockError);

      try {
        await api.auth.login({ email: "test@example.com", password: "password" });
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("Network Error");
      }
    });
  });

  describe("登録APIエラー", () => {
    it("409コンフリクトエラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "このメールアドレスは既に使用されています",
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
      };

      vi.mocked(api.auth.register).mockRejectedValueOnce(mockError);

      try {
        await api.auth.register({
          name: "Test User",
          email: "existing@example.com",
          password: "password123",
          password_confirmation: "password123",
        });
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("このメールアドレスは既に使用されています");
      }
    });

    it("バリデーションエラー時に複数のエラーメッセージを処理する", async () => {
      const mockError: ApiError = {
        message: "バリデーションエラー",
        status: 422,
        code: "VALIDATION_ERROR",
        errors: {
          name: ["名前は必須です"],
          email: ["メールアドレスの形式が正しくありません"],
          password: ["パスワードは8文字以上である必要があります"],
        },
      };

      vi.mocked(api.auth.register).mockRejectedValueOnce(mockError);

      try {
        await api.auth.register({
          name: "",
          email: "invalid-email",
          password: "123",
          password_confirmation: "123",
        });
      } catch (error) {
        expect(error).toEqual(mockError);
        const typedError = error as ApiError;
        expect(typedError.errors).toBeDefined();
        expect(typedError.errors?.name).toContain("名前は必須です");
        expect(typedError.errors?.email).toContain("メールアドレスの形式が正しくありません");
        expect(typedError.errors?.password).toContain("パスワードは8文字以上である必要があります");
      }
    });
  });

  describe("ユーザー情報取得APIエラー", () => {
    it("403認可エラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "アクセス権限がありません",
        status: 403,
        code: "FORBIDDEN",
      };

      vi.mocked(api.auth.me).mockRejectedValueOnce(mockError);

      try {
        await api.auth.me();
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("アクセス権限がありません");
      }
    });

    it("404ユーザー未見つけエラー時に適切なエラーメッセージを返す", async () => {
      const mockError: ApiError = {
        message: "ユーザーが見つかりません",
        status: 404,
        code: "USER_NOT_FOUND",
      };

      vi.mocked(api.auth.me).mockRejectedValueOnce(mockError);

      try {
        await api.auth.me();
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("ユーザーが見つかりません");
      }
    });
  });

  describe("ログアウトAPIエラー", () => {
    it("ログアウト時のエラーを適切に処理する", async () => {
      const mockError: ApiError = {
        message: "ログアウトに失敗しました",
        status: 500,
        code: "LOGOUT_FAILED",
      };

      vi.mocked(api.auth.logout).mockRejectedValueOnce(mockError);

      try {
        await api.auth.logout();
      } catch (error) {
        expect(error).toEqual(mockError);
        expect(getErrorMessage(error)).toBe("ログアウトに失敗しました");
      }
    });
  });

  describe("エラーハンドリングユーティリティ", () => {
    it("undefined/nullエラーを適切に処理する", () => {
      expect(getErrorMessage(undefined)).toBe("不明なエラーが発生しました");
      expect(getErrorMessage(null)).toBe("不明なエラーが発生しました");
    });

    it("文字列エラーを適切に処理する", () => {
      expect(getErrorMessage("カスタムエラー")).toBe("予期しないエラーが発生しました");
    });

    it("Errorオブジェクトを適切に処理する", () => {
      const error = new Error("何らかのエラー");
      expect(getErrorMessage(error)).toBe("何らかのエラー");
    });

    it("ApiErrorオブジェクトのメッセージを適切に処理する", () => {
      const apiError: ApiError = {
        message: "APIエラーメッセージ",
        status: 400,
        code: "BAD_REQUEST",
      };
      expect(getErrorMessage(apiError)).toBe("APIエラーメッセージ");
    });
  });
});
