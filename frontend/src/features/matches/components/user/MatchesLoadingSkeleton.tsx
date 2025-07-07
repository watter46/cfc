interface MatchesLoadingSkeletonProps {
  count?: number;
}

/**
 * 試合一覧のローディングスケルトンコンポーネント
 * データ取得中に表示するプレースホルダー
 */
export function MatchesLoadingSkeleton({
  count = 6,
}: MatchesLoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-space-800/50 via-space-900/80 to-black rounded-xl border border-space-600/30 p-4 animate-pulse"
        >
          {/* ヘッダー部分 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-space-600/50 rounded-full"></div>
              <div className="w-20 h-4 bg-space-600/50 rounded"></div>
            </div>
            <div className="w-6 h-6 bg-space-600/50 rounded-full"></div>
          </div>

          {/* メイン試合情報 */}
          <div className="flex items-center justify-between mb-3">
            {/* ホームチーム */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-space-600/50 rounded-full"></div>
              <div className="w-16 h-4 bg-space-600/50 rounded"></div>
            </div>

            {/* スコア */}
            <div className="flex items-center space-x-3 px-6">
              <div className="w-8 h-8 bg-space-600/50 rounded"></div>
              <div className="w-4 h-4 bg-space-600/50 rounded"></div>
              <div className="w-8 h-8 bg-space-600/50 rounded"></div>
            </div>

            {/* アウェイチーム */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <div className="w-16 h-4 bg-space-600/50 rounded"></div>
              <div className="w-10 h-10 bg-space-600/50 rounded-full"></div>
            </div>
          </div>

          {/* フッター部分 */}
          <div className="flex items-center justify-between">
            <div className="w-24 h-3 bg-space-600/50 rounded"></div>
            <div className="w-16 h-3 bg-space-600/50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
