import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SocialLoginButtons from "../SocialLoginButtons";
import { ENV_CONFIG } from "@/app/config/env";
import { getWebUrl, API_ENDPOINTS } from "@/app/config/api";

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

describe("ソーシャルログインフロー統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SocialLoginButtons />
      </BrowserRouter>
    );
  };

  describe("Googleログイン", () => {
    it("Googleログインボタンが正しく表示される", () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveTextContent("Googleでログイン");
    });

    it("Googleログインボタンクリック時に正しいURLにリダイレクトする", () => {
      renderComponent();

      const googleButton = screen.getByLabelText("Googleでログイン");
      fireEvent.click(googleButton);

      expect(getWebUrl).toHaveBeenCalledWith(
        API_ENDPOINTS.auth.social.google.redirect
      );
      expect(mockLocationHref).toHaveBeenCalledWith(
        `http://localhost:8000${API_ENDPOINTS.auth.social.google.redirect}`
      );
    });
  });

  describe("Xログイン", () => {
    it("Xログインボタンが正しく表示される", () => {
      renderComponent();

      const xButton = screen.getByLabelText("Xでログイン");
      expect(xButton).toBeInTheDocument();
      expect(xButton).toHaveTextContent("Xでログイン");
    });

    it("Xログインボタンクリック時に正しいURLにリダイレクトする", () => {
      renderComponent();

      const xButton = screen.getByLabelText("Xでログイン");
      fireEvent.click(xButton);

      const expectedPath = `${API_ENDPOINTS.auth.social.x.redirect}?redirect_uri=${encodeURIComponent(
        ENV_CONFIG.GOOGLE_REDIRECT_URI
      )}`;

      expect(getWebUrl).toHaveBeenCalledWith(expectedPath);
      expect(mockLocationHref).toHaveBeenCalledWith(
        `http://localhost:8000${expectedPath}`
      );
    });
  });

  describe("APIエンドポイントの一貫性", () => {
    it("GoogleとXのリダイレクトURLが正しく定義されている", () => {
      expect(API_ENDPOINTS.auth.social.google.redirect).toBe(
        "/user/auth/google/redirect"
      );
      expect(API_ENDPOINTS.auth.social.x.redirect).toBe(
        "/user/auth/x/redirect"
      );
    });

    it("コールバックURLが統一されている", () => {
      expect(API_ENDPOINTS.auth.social.google.callback).toBe("/auth/callback");
      expect(API_ENDPOINTS.auth.social.x.callback).toBe("/auth/callback");
    });
  });
});
