import { useMatches } from "@/features/matches/hooks/useMatches";
import type { Match } from "@/features/matches/types/api";

/**
 * 試合ページ
 * 認証済みユーザー向けの試合一覧を表示
 */
export function MatchesPage() {
  const { data, isLoading, error } = useMatches();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">試合管理</h1>
          <p className="text-gray-600">
            参加可能な試合を確認し、新しい試合を作成することができます。
          </p>
        </div>

        {/* 認証ステータス確認 */}
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">
                ✅ 認証済み - 試合データを取得中
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              認証トークン:{" "}
              {localStorage.getItem("auth_token") ? "設定済み" : "未設定"}
            </p>
          </div>
        </div>

        {/* データ取得状態表示 */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              試合データ取得状況
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600">データを読み込み中...</span>
              </div>
            )}
            {error && (
              <div className="text-red-600">
                エラー:{" "}
                {error instanceof Error
                  ? error.message
                  : "不明なエラーが発生しました"}
              </div>
            )}
            {data && (
              <div className="text-green-600 font-medium">
                📡 取得完了: {data.total}件の試合 (ページ {data.page})
              </div>
            )}
          </div>
        </div>

        {/* 試合一覧 */}
        {data && data.matches && data.matches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.matches.map((match: Match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {match.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      match.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : match.status === "ongoing"
                        ? "bg-green-100 text-green-800"
                        : match.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {match.status === "upcoming"
                      ? "開催予定"
                      : match.status === "ongoing"
                      ? "開催中"
                      : match.status === "completed"
                      ? "終了"
                      : "キャンセル"}
                  </span>
                </div>
                
                {match.description && (
                  <p className="text-gray-600 text-sm mb-4">{match.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>開始時間:</span>
                    <span>{new Date(match.startTime).toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>参加者:</span>
                    <span>{match.currentPlayers}/{match.maxPlayers}</span>
                  </div>
                  {match.creator && (
                    <div className="flex justify-between">
                      <span>作成者:</span>
                      <span>{match.creator.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : data && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">参加可能な試合がありません</div>
            <p className="text-gray-400 mt-2">新しい試合を作成してみましょう</p>
          </div>
        ) : null}

        {/* ページネーション情報 */}
        {data && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            {data.hasPrevPage && <span>前のページ</span>}
            {data.hasPrevPage && data.hasNextPage && <span> | </span>}
            {data.hasNextPage && <span>次のページ</span>}
          </div>
        )}
      </div>
    </div>
  );
}
