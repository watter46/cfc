import type { FormationPlayer, RatingType } from "../../types/match-detail";
import { AssistIcon, GoalIcon } from "@/shared/components/icons";

interface PlayerCardProps {
  player: FormationPlayer;
  ratingType: RatingType;
  onPlayerClick?: (player: FormationPlayer) => void;
}

/**
 * フィールド上に表示する選手カードコンポーネント
 * 選手画像、アシスト数、ゴール数、レーティングを表示
 */
export function PlayerCard({
  player,
  ratingType,
  onPlayerClick,
}: PlayerCardProps) {
  const handleClick = () => {
    onPlayerClick?.(player);
  };

  // レーティング値を取得
  const getRatingValue = () => {
    switch (ratingType) {
      case "my":
        return player.my_rating;
      case "user":
        return player.avg_user_rating;
      case "api":
        return player.api_rating;
      default:
        return player.api_rating;
    }
  };

  const rating = getRatingValue();
  const displayRating = rating ? rating.toFixed(1) : "--";

  return (
    <div
      className="relative w-16 h-20 cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
      onClick={handleClick}
    >
      {/* 選手画像エリア */}
      <div className="relative w-16 h-16 rounded-full border-2 border-neon-blue bg-space-800 overflow-hidden shadow-lg shadow-neon-blue/30">
        {/* プレースホルダー画像（将来的に選手画像に置き換え） */}
        <div className="w-full h-full bg-gradient-to-br from-space-700 to-space-900 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <span className="text-neon-blue font-bold text-sm">
              {player.firstName.charAt(0)}
            </span>
          </div>
        </div>

        {/* アシスト数（左上） */}
        {player.assists > 0 && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center shadow-lg">
            <AssistIcon className="w-3 h-3 text-space-900" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-purple text-space-900 rounded-full text-xs font-bold flex items-center justify-center">
              {player.assists}
            </span>
          </div>
        )}

        {/* ゴール数（右上） */}
        {player.goals && player.goals > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-neon-purple rounded-full flex items-center justify-center shadow-lg">
            <GoalIcon className="w-3 h-3 text-space-900" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green text-space-900 rounded-full text-xs font-bold flex items-center justify-center">
              {player.goals}
            </span>
          </div>
        )}

        {/* レーティング（右下） */}
        <div className="absolute -bottom-1 -right-1 w-6 h-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded text-space-900 text-xs font-bold flex items-center justify-center shadow-lg">
          {displayRating}
        </div>
      </div>

      {/* 選手名 */}
      <div className="mt-1 text-center">
        <span className="text-neon-blue text-xs font-medium truncate block">
          {player.firstName}
        </span>
      </div>
    </div>
  );
}
