import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 要件: トークンベース認証に変更
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("auth_token");

  console.log("ProtectedRoute - トークンチェック:", { hasToken: !!token });

  if (!token) {
    console.log("トークンがないため、ログインページにリダイレクト");
    return <Navigate to="/login" replace />;
  }

  console.log("トークンが存在するため、保護されたコンテンツを表示");
  return <>{children}</>;
}

/**
 * 認証済みユーザーを適切なページにリダイレクトするコンポーネント
 */
export function AuthGuard({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 既にログインしている場合は/matchesページにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/matches" replace />;
  }

  return <>{children}</>;
}
