import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * ゲスト専用ページのガードコンポーネント
 * ログイン済みユーザーを自動的に/matchesにリダイレクトします
 */
interface GuestGuardProps {
  readonly children: React.ReactNode;
}

/**
 * ゲスト用ページガード
 * 認証済みユーザーがゲスト専用ページ（ホーム画面など）にアクセスした場合、
 * 自動的にユーザー専用ページ（/matches）にリダイレクトします
 */
export function GuestGuard({
  children,
}: GuestGuardProps): React.ReactElement | null {
  const { isAuthenticated, isLoading } = useAuth();

  // 認証状態の確認中はローディング表示
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
          role="status"
          aria-label="読み込み中"
        ></div>
      </div>
    );
  }

  // ログイン済みユーザーは/matchesにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/matches" replace />;
  }

  // 未ログインユーザーはそのままページを表示
  return <>{children}</>;
}
