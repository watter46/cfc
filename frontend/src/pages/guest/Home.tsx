import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Trophy, Share2 } from "lucide-react";
import MainLayout from "@/shared/components/layout/MainLayout.tsx";
import PublicMatchCard from "@/features/matches/components/guest/PublicMatchCard.tsx";
import { useGuestRecentMatches } from "@/features/matches/hooks/guest/useGuestMatches.ts";
import type { ActualMatchData as Match } from "@/shared/types/index.ts";

/**
 * ローディングスピナーコンポーネント
 */
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
    </div>
  );
}

/**
 * エラー表示コンポーネント
 */
function ErrorMessage({ error }: { error: Error }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-400 mb-4">試合データの読み込みに失敗しました</p>
      <p className="text-gray-400 text-sm">{error.message}</p>
    </div>
  );
}

const GuestHomePage: React.FC = () => {
  // 最新の5試合を取得（ゲスト用フック使用）
  const {
    data: recentMatches,
    isLoading: matchesLoading,
    error,
  } = useGuestRecentMatches(5);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-field-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-space-900/90 to-space-800/90"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue animate-pulse-slow">
              選手を評価してあなたの視点を共有しよう
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              試合後の選手パフォーマンスをあなたの評価軸で採点し、コミュニティと共有しましょう。あなたの視点が新たな議論を生み出します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn btn-primary py-3 px-8 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  始める
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
              <Link
                to="/matches"
                className="btn border border-neon-blue bg-transparent text-neon-blue hover:bg-neon-blue/10 py-3 px-8 text-lg"
              >
                試合を見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section className="py-16 bg-space-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Recent Matches
            </h2>
            <a
              href="/matches"
              className="text-neon-blue hover:underline flex items-center gap-1.5"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {matchesLoading ? (
              <div className="col-span-full">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="col-span-full">
                <ErrorMessage error={error} />
              </div>
            ) : recentMatches && recentMatches.length > 0 ? (
              recentMatches.map((match: Match, index: number) => (
                <PublicMatchCard
                  key={`${match.home.id}-${match.away.id}-${match.date}-${index}`}
                  match={match}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">試合データがありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-space-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              CFCRatingでできること
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              試合後の選手パフォーマンスを評価し、あなたの見解をコミュニティと共有しましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-glass p-6 hover:shadow-neon-blue transition-all duration-300">
              <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4">
                <Star size={24} className="text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                選手を詳細評価
              </h3>
              <p className="text-gray-400">
                選手のパフォーマンスを1～10点で各選手の活躍度を詳しく評価できます。
              </p>
            </div>

            <div className="card-glass p-6 hover:shadow-neon-purple transition-all duration-300">
              <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center mb-4">
                <Trophy size={24} className="text-neon-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                MOM（最優秀選手）選出
              </h3>
              <p className="text-gray-400">
                最も印象的だった選手を1人選んでMan of the
                Matchとして評価できます。
              </p>
            </div>

            <div className="card-glass p-6 hover:shadow-neon-green transition-all duration-300">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-4">
                <Share2 size={24} className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                SNSシェア機能
              </h3>
              <p className="text-gray-400">
                評価結果を画像やテキストで出力し、SNSへ簡単にシェア。あなたの評価を世界に発信しましょう。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-space-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-field-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              あなたの視点で選手を評価し、独自の見解を共有しませんか？
            </h2>
            <p className="text-gray-300 mb-8">
              世界中のサッカーファンと一緒に選手を評価し、あなたの見解を共有しましょう。
            </p>
            <a
              href="/register"
              className="btn btn-primary py-3 px-8 text-lg inline-block"
            >
              無料でアカウント作成
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default GuestHomePage;
