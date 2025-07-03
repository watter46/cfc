import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * ソーシャルサインイン認証コールバックページ
 * 責務：認証成功確認・認証成功時の遷移のみ
 */
export function SocialCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("認証プロトコル初期化中...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        setMessage("認証状態確認中...");

        // クエリパラメータのエラーチェック（オプション）
        const error = searchParams.get("error");
        if (error) {
          setIsError(true);
          setMessage("認証プロトコル失敗");
          setTimeout(() => {
            navigate("/signin", {
              state: {
                error: `ソーシャルサインインに失敗しました: ${error}`,
              },
            });
          }, 1500);
          return;
        }

        // 認証状態を直接確認（Cookieベース）
        setMessage("認証システム接続中...");
        await checkAuth();

        setIsSuccess(true);
        setMessage("認証完了！システムにアクセス中...");

        // 認証成功時は即座に試合ページに遷移
        setTimeout(() => {
          navigate("/matches", { replace: true });
        }, 1500);
      } catch (error) {
        setIsError(true);
        setMessage("認証処理エラー");
        setTimeout(() => {
          navigate("/signin", {
            state: {
              error: "認証処理中にエラーが発生しました",
            },
          });
        }, 1500);
      }
    };

    processAuth();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div
      className="min-h-screen bg-space-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      aria-busy={!isSuccess && !isError}
      aria-live="polite"
    >
      {/* 背景パターン */}
      <div className="absolute inset-0 bg-field-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-space-900/90 to-space-800/90"></div>

      {/* ローディングコンテンツ */}
      <div className="relative z-10 text-center">
        <div className="bg-space-800/50 backdrop-blur-sm border border-space-700 rounded-xl p-8 max-w-md w-full shadow-2xl">
          {/* 未来感のあるアニメーション・アイコン */}
          {isSuccess ? (
            <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green to-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-space-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-neon-green animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-neon-green to-green-400 rounded-full opacity-20 animate-ping"></div>
            </div>
          ) : isError ? (
            <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-space-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-400 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-20 animate-ping"></div>
            </div>
          ) : (
            <div className="h-20 w-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-space-600 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-neon-blue border-r-neon-purple rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-transparent border-t-neon-purple border-l-neon-blue rounded-full animate-spin animate-reverse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full opacity-10 animate-pulse"></div>
            </div>
          )}

          {/* メッセージ */}
          <p
            className={`text-xl mb-2 ${
              isSuccess
                ? "text-green-400"
                : isError
                  ? "text-red-400"
                  : "text-white"
            }`}
          >
            {message}
          </p>
          <p className="text-gray-400 text-sm">
            {isSuccess
              ? "まもなく移動します..."
              : isError
                ? "数秒後にログインページに戻ります"
                : "しばらくお待ちください..."}
          </p>

          {/* プログレスバー（成功・エラー時は非表示） */}
          {!isSuccess && !isError && (
            <div className="mt-6 w-full bg-space-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
