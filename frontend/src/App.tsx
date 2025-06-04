import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuestHomePage from "./pages/guest/index.tsx";
import LoginPage from "./pages/auth/login.tsx";
import RegisterPage from "./pages/auth/register";
// import MatchDetailPage from "./pages/MatchDetailPage";
import {
  AuthProvider,
  useAuth,
} from "./features/auth/contexts/AuthContext.tsx";
import Api from "./pages/Api.tsx";

/**
 * 認証が必要なルートを保護するコンポーネント
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // ローディング中は適切なローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * 認証済みユーザーを適切なページにリダイレクトするコンポーネント
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 既にログインしている場合はホームページにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * メインアプリケーションコンポーネント
 * React Routerを使用してSPAのルーティングを管理
 */
function AppRoutes() {
  return (
    <Routes>
      {/* パブリックルート（Layoutなし） */}
      <Route path="/" element={<GuestHomePage />} />
      <Route path="/api" element={<Api />} />

      {/* 認証関連ルート（ログイン済みの場合はリダイレクト） */}
      <Route
        path="/login"
        element={
          <AuthGuard>
            <LoginPage />
          </AuthGuard>
        }
      />
      <Route
        path="/register"
        element={
          <AuthGuard>
            <RegisterPage />
          </AuthGuard>
        }
      />

      {/* 保護されたルート（認証が必要） */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div>Profile Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <div>Matches Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/match/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <MatchDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      /> */}

      {/* 404ページ - 存在しないルートは全てホームページにリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * ルートアプリケーションコンポーネント
 * 認証プロバイダーとルーターでアプリケーション全体をラップ
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
