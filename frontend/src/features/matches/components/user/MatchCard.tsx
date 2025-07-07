import type { Match } from "@/features/matches/types/api";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./MatchCard.module.css";

interface MatchCardProps {
  readonly match: Match;
}

/**
 * 試合カードコンポーネント
 * サイバーパンク・未来感のあるデザインで試合情報を表示
 */
export function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const matchDate = new Date(match.started_at);
  const isUpcoming = matchDate > new Date();
  const hasScore = match.score.home > 0 || match.score.away > 0;

  const handleMatchClick = () => {
    navigate(`/matches/${match.id}`);
  };

  // is_winnerベースでスコアの色を決定
  const getScoreColor = () => {
    if (isUpcoming) {
      return "text-neon-purple"; // 予定の試合
    }

    if (match.game_user?.is_winner === null) {
      return "text-space-400"; // 引き分け（グレー）
    }

    if (match.game_user?.is_winner === true) {
      return "text-neon-green"; // 勝利（緑）
    } else {
      return "text-red-400"; // 敗北（赤）
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleMatchClick}>
      {/* グラデーション背景 */}
      <div
        className={`
          relative bg-gradient-to-br from-space-800/50 via-space-900/80 to-black rounded-xl transition-all duration-300 overflow-hidden
          ${
            match.rateable
              ? styles.gradientBorderCard
              : "border border-neon-blue/30 group-hover:border-neon-blue/60"
          }
        `}
      >
        {/* ホバー効果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-4 space-y-3 z-10">
          {/* ヘッダー: 試合日時とリーグ情報 */}
          <div className="flex items-center justify-between">
            {/* 左: 試合開始日時（月/日形式） */}
            <div className="text-space-300">
              <time dateTime={match.started_at} className="text-sm font-medium">
                {matchDate.getMonth() + 1}/{matchDate.getDate()}
              </time>
            </div>

            {/* 右: リーグ情報 */}
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-neon-blue truncate max-w-[180px]">
                {match.league.name}
              </h3>
              <img
                src={match.league.logo_path}
                alt={match.league.name}
                className="w-6 h-6 rounded-full bg-white/90 p-0.5 ring-1 ring-neon-blue/30"
              />
            </div>
          </div>

          {/* メイン: チーム対戦情報 */}
          <div className="flex items-center justify-between">
            {/* ホームチーム */}
            <div className="flex flex-col items-center space-y-1 flex-1 max-w-[35%]">
              <img
                src={match.teams.home.logo_path}
                alt={match.teams.home.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0"
              />
              <div className="text-center">
                <p className="text-white font-semibold text-xs md:text-sm truncate">
                  {match.teams.home.name}
                </p>
                <p className="text-space-400 text-xs">HOME</p>
              </div>
            </div>

            {/* スコア表示（中央固定） */}
            <div className="flex-shrink-0 text-center px-2 md:px-4">
              {hasScore || !isUpcoming ? (
                <div className="flex items-center justify-center space-x-2">
                  <span
                    className={`text-lg md:text-xl font-bold ${getScoreColor()}`}
                  >
                    {match.score.home}
                  </span>
                  <span className={`${getScoreColor()}`}>-</span>
                  <span
                    className={`text-lg md:text-xl font-bold ${getScoreColor()}`}
                  >
                    {match.score.away}
                  </span>
                </div>
              ) : (
                <div className="text-neon-purple font-medium animate-pulse">
                  VS
                </div>
              )}
            </div>

            {/* アウェイチーム */}
            <div className="flex flex-col items-center space-y-1 flex-1 max-w-[35%]">
              <img
                src={match.teams.away.logo_path}
                alt={match.teams.away.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0"
              />
              <div className="text-center">
                <p className="text-white font-semibold text-xs md:text-sm truncate">
                  {match.teams.away.name}
                </p>
                <p className="text-space-400 text-xs">AWAY</p>
              </div>
            </div>
          </div>

          {/* フッター: 評価情報 */}
          {match.game_user && (
            <div className="flex items-center justify-between pt-2">
              {/* 左下: 評価済み状態 */}
              <div className="flex items-center space-x-1">
                {match.game_user.is_rated ? (
                  <div className="flex items-center space-x-1 text-neon-green">
                    <Check size={12} />
                    <span className="text-xs">評価済み</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-space-400">
                    <Check size={12} />
                    <span className="text-xs">未評価</span>
                  </div>
                )}
              </div>

              {/* 右下: 評価可能状態 */}
              <div className="flex items-center space-x-1">
                {match.rateable ? (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-green-500/15 to-green-600/15 backdrop-blur-sm px-2 py-1 rounded-md border border-green-500/30 shadow-sm">
                    <Check size={10} className="text-green-400" />
                    <span className="text-xs font-medium text-green-400">
                      評価可能
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-red-500/15 to-red-600/15 backdrop-blur-sm px-2 py-1 rounded-md border border-red-500/30 shadow-sm">
                    <Check size={10} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      評価不可
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
