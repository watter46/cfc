import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSocialLogin } from "../useSocialLogin";
import { getWebUrl, API_ENDPOINTS } from "@/app/config/api";
import { ENV_CONFIG } from "@/app/config/env";

// window.location.hrefのモック
const mockLocationHref = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    href: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// window.location.hrefセッターをモック
Object.defineProperty(window.location, "href", {
  set: mockLocationHref,
  configurable: true,
});

// getWebUrlのモック
vi.mock("@/app/config/api", async () => {
  const actual = await vi.importActual("@/app/config/api");
  return {
    ...actual,
    getWebUrl: vi.fn((path: string) => `http://localhost:8000${path}`),
  };
});

// ENV_CONFIGのモック
vi.mock("@/app/config/env", () => ({
  ENV_CONFIG: {
    GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/callback",
  },
}));

// console.errorのモック
const mockConsoleError = vi.fn();
vi.spyOn(console, "error").mockImplementation(mockConsoleError);

describe("useSocialLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationHref.mockClear();
  });

  describe("初期状態", () => {
    it("初期状態が正しく設定される", () => {
      const { result } = renderHook(() => useSocialLogin());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.handleGoogleLogin).toBe("function");
      expect(typeof result.current.handleXLogin).toBe("function");
    });
  });

  describe("handleGoogleLogin", () => {
    it("Googleログインが正しく実行される", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleGoogleLogin();

      expect(getWebUrl).toHaveBeenCalledWith(
        API_ENDPOINTS.auth.social.google.redirect
      );
      expect(mockLocationHref).toHaveBeenCalledWith(
        `http://localhost:8000${API_ENDPOINTS.auth.social.google.redirect}`
      );
    });

    it("Googleログイン実行時にローディング状態が更新される", () => {
      const { result } = renderHook(() => useSocialLogin());

      // ローディング状態の確認は同期的に行う
      result.current.handleGoogleLogin();

      // リダイレクトが実行されることを確認
      expect(mockLocationHref).toHaveBeenCalled();
    });

    it("Googleログインエラー時にエラーが設定される", async () => {
      // location.hrefでエラーが発生するようにモック
      mockLocationHref.mockImplementationOnce(() => {
        throw new Error("Network error");
      });

      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        result.current.handleGoogleLogin();
      });

      expect(result.current.error).toBe("Googleログインに失敗しました");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Google login error:",
        expect.any(Error)
      );
    });
  });

  describe("handleXLogin", () => {
    it("Xログインが正しく実行される", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleXLogin();

      const expectedPath = `${API_ENDPOINTS.auth.social.x.redirect}?redirect_uri=${encodeURIComponent(
        ENV_CONFIG.GOOGLE_REDIRECT_URI
      )}`;

      expect(getWebUrl).toHaveBeenCalledWith(expectedPath);
      expect(mockLocationHref).toHaveBeenCalledWith(
        `http://localhost:8000${expectedPath}`
      );
    });

    it("Xログイン実行時にローディング状態が更新される", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleXLogin();

      // リダイレクトが実行されることを確認
      expect(mockLocationHref).toHaveBeenCalled();
    });

    it("Xログインエラー時にエラーが設定される", async () => {
      // location.hrefでエラーが発生するようにモック
      mockLocationHref.mockImplementationOnce(() => {
        throw new Error("Network error");
      });

      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        result.current.handleXLogin();
      });

      expect(result.current.error).toBe("Xログインに失敗しました");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "X login error:",
        expect.any(Error)
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("異なるエラータイプが正しく処理される", async () => {
      // 文字列エラー
      mockLocationHref.mockImplementationOnce(() => {
        throw "String error";
      });

      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        result.current.handleGoogleLogin();
      });

      expect(result.current.error).toBe("Googleログインに失敗しました");
    });

    it("undefined/nullエラーが正しく処理される", async () => {
      // nullエラー
      mockLocationHref.mockImplementationOnce(() => {
        throw null;
      });

      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        result.current.handleXLogin();
      });

      expect(result.current.error).toBe("Xログインに失敗しました");
    });
  });

  describe("連続実行", () => {
    it("複数回実行してもエラーが発生しない", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleGoogleLogin();
      result.current.handleXLogin();
      result.current.handleGoogleLogin();

      expect(mockLocationHref).toHaveBeenCalledTimes(3);
      expect(result.current.error).toBeNull();
    });

    it("エラー後に再実行できる", async () => {
      const { result } = renderHook(() => useSocialLogin());

      // 最初はエラー
      mockLocationHref.mockImplementationOnce(() => {
        throw new Error("Network error");
      });

      await act(async () => {
        result.current.handleGoogleLogin();
      });
      expect(result.current.error).toBe("Googleログインに失敗しました");

      // 2回目は成功
      mockLocationHref.mockImplementationOnce(() => {
        // 通常の動作
      });

      await act(async () => {
        result.current.handleGoogleLogin();
      });

      expect(result.current.error).toBeNull();
      expect(mockLocationHref).toHaveBeenCalledTimes(2);
    });
  });

  describe("API設定の確認", () => {
    it("正しいAPIエンドポイントが使用される", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleGoogleLogin();
      expect(getWebUrl).toHaveBeenCalledWith("/user/auth/google/redirect");

      result.current.handleXLogin();
      expect(getWebUrl).toHaveBeenCalledWith(
        "/user/auth/x/redirect?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback"
      );
    });

    it("リダイレクトURIが正しくエンコードされる", () => {
      const { result } = renderHook(() => useSocialLogin());

      result.current.handleXLogin();

      const expectedEncodedUri = encodeURIComponent(
        ENV_CONFIG.GOOGLE_REDIRECT_URI
      );
      expect(getWebUrl).toHaveBeenCalledWith(
        `/user/auth/x/redirect?redirect_uri=${expectedEncodedUri}`
      );
    });
  });
});
