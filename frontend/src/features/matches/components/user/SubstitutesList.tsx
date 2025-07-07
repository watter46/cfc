import type { FormationPlayer, RatingType } from "../../types/match-detail";
import { PlayerCard } from "./PlayerCard";

interface SubstitutesListProps {
  substitutes: FormationPlayer[];
  ratingType: RatingType;
  onPlayerClick?: (player: FormationPlayer) => void;
}

/**
 * 控え選手一覧表示コンポーネント
 */
export function SubstitutesList({
  substitutes,
  ratingType,
  onPlayerClick,
}: SubstitutesListProps) {
  if (substitutes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-neon-blue font-semibold text-lg mb-4 flex items-center">
        <span className="w-2 h-2 bg-neon-purple rounded-full mr-2 animate-pulse" />
        控え選手
      </h3>

      <div className="bg-space-800/30 rounded-lg border border-neon-blue/20 p-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {substitutes.map((player) => (
            <div key={player.id} className="flex flex-col items-center">
              <PlayerCard
                player={player}
                ratingType={ratingType}
                onPlayerClick={onPlayerClick}
              />
              <div className="mt-2 text-center">
                <p className="text-neon-blue/70 text-xs">
                  {player.minutes_played}分出場
                </p>
                <p className="text-neon-purple/60 text-xs">{player.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
