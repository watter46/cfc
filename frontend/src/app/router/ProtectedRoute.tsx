import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * Cookie-based認証を使用
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // 認証情報の読み込み中は何も表示しない
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
