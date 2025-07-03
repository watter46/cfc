import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestGuard } from "./GuestGuard";

// Page imports
import Home from "../../pages/guest/Home";
import SigninPage from "../../pages/auth/signin";
import SignupPage from "../../pages/auth/signup";
import { SocialCallback } from "../../pages/auth/social-callback";
import { MatchesPage } from "../../pages/matches/MatchesPage";
import { MatchDetailPage } from "../../pages/matches/MatchDetailPage";

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
    path: "/signin",
    element: (
      <GuestGuard>
        <SigninPage />
      </GuestGuard>
    ),
    public: true,
  },
  {
    path: "/signup",
    element: (
      <GuestGuard>
        <SignupPage />
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
  {
    path: "/matches/:matchId",
    element: (
      <ProtectedRoute>
        <MatchDetailPage />
      </ProtectedRoute>
    ),
    protected: true,
  },

  // 後方互換性のためのリダイレクトルート
  {
    path: "/login",
    element: <Navigate to="/signin" replace />,
    public: true,
  },
  {
    path: "/register",
    element: <Navigate to="/signup" replace />,
    public: true,
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
