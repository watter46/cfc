import type { RatingType } from "../../types/match-detail";

interface RatingToggleProps {
  currentType: RatingType;
  onTypeChange: (type: RatingType) => void;
  userRatedCount: number;
}

/**
 * レーティング表示切り替えコンポーネント
 * 自分・ユーザー全体・機械の採点を切り替え
 */
export function RatingToggle({
  currentType,
  onTypeChange,
  userRatedCount,
}: RatingToggleProps) {
  const options: Array<{
    type: RatingType;
    label: string;
    description: string;
  }> = [
    { type: "my", label: "自分の評価", description: "あなたの評価" },
    {
      type: "user",
      label: "ユーザー評価",
      description: `${userRatedCount}人が評価`,
    },
    { type: "api", label: "API評価", description: "機械学習による評価" },
  ];

  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-neon-blue font-semibold text-sm">レーティング表示</h3>

      <div className="flex flex-wrap gap-2">
        {options.map(({ type, label, description }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${
                currentType === type
                  ? "bg-gradient-to-r from-neon-blue to-neon-purple text-space-900 shadow-lg"
                  : "bg-space-800 text-neon-blue/70 border border-neon-blue/30 hover:border-neon-blue/60 hover:text-neon-blue"
              }
            `}
          >
            <div className="text-center">
              <p>{label}</p>
              <p className="text-xs opacity-70">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
