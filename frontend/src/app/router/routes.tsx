import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestGuard } from "./GuestGuard";

// Page imports
import Home from "../../pages/guest/Home";
import LoginPage from "../../pages/auth/login";
import RegisterPage from "../../pages/auth/register";
import { SocialCallback } from "../../pages/auth/social-callback";
import { MatchesPage } from "../../pages/matches/MatchesPage";

/**
 * アプリケーションのルート定義
 */
export const routes = [
  // ゲスト専用ルート（ログイン済みユーザーは/matchesにリダイレクト）
  {
    path: "/",
    element: (
      <GuestGuard>
        <Home />
      </GuestGuard>
    ),
    public: true,
  },

  // 認証関連ルート（ログイン済みの場合はリダイレクト）
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
    public: true,
  },
  {
    path: "/register",
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
    public: true,
  },

  // Google認証コールバックルート（要件に従って/auth/callbackに変更）
  {
    path: "/auth/callback",
    element: <SocialCallback />,
    public: true,
  },

  // 保護されたルート（認証が必要）
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <div>Profile Page (Coming Soon)</div>
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: "/matches",
    element: (
      <ProtectedRoute>
        <MatchesPage />
      </ProtectedRoute>
    ),
    protected: true,
  },
] as const;

/**
 * ルート設定をReact Router形式で生成
 */
export function generateRoutes() {
  return routes.map((route, index) => (
    <Route
      key={route.path || index}
      path={route.path}
      element={route.element}
    />
  ));
}
