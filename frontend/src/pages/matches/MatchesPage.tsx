import {
  MatchCard,
  MatchesFilter,
  MatchesPagination,
  MatchesLoadingSkeleton,
  MatchesError,
} from "@/features/matches/components/user";
import { useMatchesQuery } from "@/features/matches/hooks/user";
import MainLayout from "@/shared/components/layout/MainLayout.tsx";

/**
 * 試合ページ
 * 認証済みユーザー向けの試合一覧を表示
 * サイバーパンク・未来感のあるデザインで一貫した体験を提供
 */
export function MatchesPage() {
  const { data, isLoading, error, refetch } = useMatchesQuery();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-black to-space-900">
        {/* 背景パターン */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none" />

        <div className="relative container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* ページヘッダー */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-2 h-12 bg-gradient-to-b from-neon-blue to-neon-purple rounded-full" />
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    試合一覧
                  </h1>
                  <p className="text-space-300 text-lg">
                    あなたの試合データを確認し、パフォーマンスを追跡しましょう
                  </p>
                </div>
              </div>
            </div>

            {/* フィルター */}
            <div className="mb-8">
              <MatchesFilter />
            </div>

            {/* メインコンテンツ */}
            <div className="space-y-6">
              {/* ローディング状態 */}
              {isLoading && <MatchesLoadingSkeleton />}

              {/* エラー状態 */}
              {error && <MatchesError error={error} onRetry={refetch} />}

              {/* 試合一覧 */}
              {data && !isLoading && !error && (
                <>
                  {/* 検索結果情報 */}
                  <div className="flex items-center justify-between text-space-300 text-sm">
                    <div>
                      {data.meta.pagination.count}件の試合が見つかりました
                    </div>
                  </div>

                  {/* 試合カード一覧 */}
                  {data.data.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data.data.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 text-space-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h3 className="text-space-400 text-lg font-medium mb-2">
                        試合が見つかりませんでした
                      </h3>
                      <p className="text-space-500">
                        フィルター条件を変更して再度お試しください
                      </p>
                    </div>
                  )}

                  {/* ページネーション */}
                  {data.data.length > 0 && (
                    <div className="mt-8">
                      <MatchesPagination meta={data.meta} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
