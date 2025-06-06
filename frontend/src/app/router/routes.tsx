import { Route } from "react-router-dom";
import { ProtectedRoute, AuthGuard } from "./ProtectedRoute";

// Page imports
import Home from "../../pages/guest/Home";
import LoginPage from "../../pages/auth/login";
import RegisterPage from "../../pages/auth/register";
import AuthApiTestPage from "../../pages/dev/api-test";
import Api from "../../pages/dev/Api";

/**
 * アプリケーションのルート定義
 */
export const routes = [
  // パブリックルート
  {
    path: "/",
    element: <Home />,
    public: true,
  },

  // 開発・テスト用ルート
  {
    path: "/dev/api",
    element: <Api />,
    public: true,
  },
  {
    path: "/dev/auth/register",
    element: <AuthApiTestPage />,
    public: true,
  },

  // 認証関連ルート（ログイン済みの場合はリダイレクト）
  {
    path: "/login",
    element: (
      <AuthGuard>
        <LoginPage />
      </AuthGuard>
    ),
    public: true,
  },
  {
    path: "/register",
    element: (
      <AuthGuard>
        <RegisterPage />
      </AuthGuard>
    ),
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
        <div>Matches Page (Coming Soon)</div>
      </ProtectedRoute>
    ),
    protected: true,
  },
  // TODO: 将来実装予定
  // {
  //   path: "/match/:id",
  //   element: (
  //     <ProtectedRoute>
  //       <Layout>
  //         <MatchDetailPage />
  //       </Layout>
  //     </ProtectedRoute>
  //   ),
  //   protected: true,
  // },
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
