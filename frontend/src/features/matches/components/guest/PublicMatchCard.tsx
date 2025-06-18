import type { Match } from "@/shared/types/index.ts";
import { Check, Lock } from "lucide-react";

/**
 * 公開試合カードコンポーネントのProps型
 */
interface PublicMatchCardProps {
  readonly match: Match;
  readonly onSelect?: (match: Match) => void;
}

/**
 * 試合結果を表示する公開カードコンポーネント
 * 試合日、チーム情報、スコア、勝敗結果を表示します
 */
export function PublicMatchCard({ match, onSelect }: PublicMatchCardProps) {
  /**
   * カードクリック時の処理
   */
  const handleCardClick = () => {
    onSelect?.(match);
  };

  /**
   * 勝者チームを判定するヘルパー関数
   */
  const getWinnerStatus = (teamId: number): "winner" | "loser" | "draw" => {
    if (match.WinnerTeamId === null) return "draw";
    return match.WinnerTeamId === teamId ? "winner" : "loser";
  };

  /**
   * チームロゴのフルパスを取得する関数
   */
  const getTeamLogoUrl = (logoPath?: string): string => {
    if (!logoPath) return "/images/default-team-logo.png";
    return logoPath.startsWith("http") ? logoPath : `/${logoPath}`;
  };

  const homeStatus = getWinnerStatus(match.home.id);
  const awayStatus = getWinnerStatus(match.away.id);

  return (
    <div
      className="card-glass p-4 hover:shadow-neon-blue transition-all duration-300 cursor-pointer group relative overflow-hidden border border-space-600/40 shadow-lg shadow-neon-blue/10"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      {/* カードヘッダー - 試合日と評価可能状態 */}
      <div className="flex items-center justify-between mb-3 relative">
        {/* 左側: 試合日 */}
        <div className="flex items-center">
          <div className="relative">
            <div className="text-xs md:text-sm font-medium text-gray-300 px-2 py-1.5">
              {match.date}
            </div>
          </div>
        </div>

        {/* 右側: 評価可能状態 */}
        <div className="flex items-center">
          <div className="relative">
            {match.isRateable ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500/15 to-green-600/15 backdrop-blur-sm px-2 py-1.5 rounded-md border border-green-500/30 shadow-sm animate-pulse-slow">
                <Check size={12} className="text-green-400" />
                <span className="text-xs md:text-sm font-medium text-green-400">
                  評価可能
                </span>
                {/* 評価可能の発光効果 */}
                <div className="absolute inset-0 bg-green-400/20 rounded-md blur-[3px] animate-slow-pulse-glow pointer-events-none"></div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/15 to-red-600/15 backdrop-blur-sm px-2 py-1.5 rounded-md border border-red-500/30 shadow-sm animate-pulse-slow">
                <Lock size={12} className="text-red-400" />
                <span className="text-xs md:text-sm font-medium text-red-400">
                  評価不可
                </span>
                {/* 評価不可の発光効果 */}
                <div className="absolute inset-0 bg-red-400/20 rounded-md blur-[3px] animate-slow-pulse-glow pointer-events-none"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ - チームロゴ、スコア、チーム名 */}
      <div className="relative mb-3">
        {/* チームロゴとチーム名のコンテナ */}
        <div className="flex items-center">
          {/* ホームチーム */}
          <div className="flex flex-col items-center flex-1">
            <img
              src={getTeamLogoUrl(match.home.logo_path)}
              alt={`${match.home.name} logo`}
              className="w-10 h-10 md:w-14 md:h-14 object-contain mb-2"
            />
            <p
              className={`font-medium text-sm md:text-base text-center truncate w-full px-2 ${
                homeStatus === "winner" ? "text-green-400" : "text-gray-400"
              }`}
            >
              {match.home.name}
            </p>
          </div>

          {/* アウェイチーム */}
          <div className="flex flex-col items-center flex-1">
            <img
              src={getTeamLogoUrl(match.away.logo_path)}
              alt={`${match.away.name} logo`}
              className="w-10 h-10 md:w-14 md:h-14 object-contain mb-2"
            />
            <p
              className={`font-medium text-sm md:text-base text-center truncate w-full px-2 ${
                awayStatus === "winner" ? "text-green-400" : "text-gray-400"
              }`}
            >
              {match.away.name}
            </p>
          </div>
        </div>

        {/* スコア部分 - ロゴの中心に合わせて配置 */}
        <div className="absolute top-5 md:top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-3xl font-bold text-white">
              {match.score.fulltime.home}
            </span>
            <div className="w-3 md:w-4 h-0.5 bg-white"></div>
            <span className="text-2xl md:text-3xl font-bold text-white">
              {match.score.fulltime.away}
            </span>
          </div>
        </div>
      </div>

      {/* ホバー効果用のオーバーレイ */}
      <div className="absolute inset-0 border border-neon-blue/0 group-hover:border-neon-blue/50 rounded-lg transition-all duration-300 pointer-events-none group-hover:shadow-lg group-hover:shadow-neon-blue/30"></div>

      {/* カード周りの微細な発光効果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5 rounded-lg blur-sm opacity-30 animate-slow-pulse-glow pointer-events-none"></div>
    </div>
  );
}

export default PublicMatchCard;
