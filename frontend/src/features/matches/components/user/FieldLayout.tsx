import type { FormationPlayer, RatingType } from "../../types/match-detail";
import { PlayerCard } from "./PlayerCard";
import { getGridStyle } from "../../utils/formation";

interface FieldLayoutProps {
  starters: FormationPlayer[];
  ratingType: RatingType;
  onPlayerClick?: (player: FormationPlayer) => void;
}

/**
 * サッカーフィールド上に選手を配置するコンポーネント
 * 将来的にSVGフィールドを背景に設定予定
 */
export function FieldLayout({
  starters,
  ratingType,
  onPlayerClick,
}: FieldLayoutProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* フィールド背景（仮） */}
      <div className="w-full h-96 bg-gradient-to-b from-space-800/50 to-space-900/50 rounded-lg border-2 border-neon-blue/30 shadow-xl relative overflow-hidden">
        {/* フィールドライン（仮）*/}
        <div className="absolute inset-4 border-2 border-neon-blue/20 rounded">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neon-blue/20 transform -translate-y-0.5" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-neon-blue/20 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* 選手配置用グリッド */}
        <div
          className="absolute inset-0 p-4"
          style={{
            display: "grid",
            gridTemplateRows: "repeat(5, 1fr)",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {starters.map((player) => (
            <div
              key={player.id}
              style={getGridStyle(player.fieldPosition)}
              className="flex items-center justify-center"
            >
              <PlayerCard
                player={player}
                ratingType={ratingType}
                onPlayerClick={onPlayerClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* フィールド情報 */}
      <div className="mt-4 text-center text-neon-blue/70 text-sm">
        <p>フィールドレイアウト（SVGフィールドは今後実装予定）</p>
        <p className="text-xs mt-1">選手をクリックして詳細を表示</p>
      </div>
    </div>
  );
}
