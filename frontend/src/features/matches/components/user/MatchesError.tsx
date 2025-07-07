interface MatchesErrorProps {
  error: Error | null;
  onRetry?: () => void;
}

/**
 * 試合一覧のエラー表示コンポーネント
 * API取得エラー時にユーザーフレンドリーなメッセージを表示
 */
export function MatchesError({ error, onRetry }: MatchesErrorProps) {
  const getErrorMessage = (error: Error | null): string => {
    if (!error) return "不明なエラーが発生しました";

    // ネットワークエラー
    if (
      error.message.includes("Network Error") ||
      error.message.includes("NETWORK_ERROR")
    ) {
      return "ネットワークに接続できません。インターネット接続を確認してください。";
    }

    // 認証エラー
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      return "認証が必要です。再度ログインしてください。";
    }

    // サーバーエラー
    if (
      error.message.includes("500") ||
      error.message.includes("Internal Server Error")
    ) {
      return "サーバーでエラーが発生しました。しばらく時間をおいて再試行してください。";
    }

    // その他のエラー
    return "データの取得に失敗しました。";
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-gradient-to-br from-red-900/20 via-space-800/50 to-space-900/80 rounded-xl border border-red-500/30 p-8 max-w-md w-full mx-4">
        {/* エラーアイコン */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* エラーメッセージ */}
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-red-400">
            データの取得に失敗しました
          </h3>
          <p className="text-space-300 text-sm leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* 再試行ボタン */}
        {onRetry && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-space-900 font-medium rounded-lg hover:shadow-lg hover:shadow-neon-blue/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              再試行
            </button>
          </div>
        )}

        {/* デバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-xs">
            <summary className="text-space-400 cursor-pointer hover:text-space-300 transition-colors">
              詳細エラー情報（開発環境のみ）
            </summary>
            <pre className="mt-2 p-2 bg-space-900/50 rounded text-red-300 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
