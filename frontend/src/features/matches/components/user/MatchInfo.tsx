import type { MatchDetailData } from "../../types/match-detail";

interface MatchInfoProps {
  match: MatchDetailData;
}

/**
 * 試合基本情報表示コンポーネント
 */
export function MatchInfo({ match }: MatchInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-r from-space-800/50 to-space-900/50 rounded-lg border border-neon-blue/30 p-6 shadow-xl">
      {/* リーグ情報 */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {match.league.has_image && (
            <img
              src={match.league.logo_path}
              alt={match.league.name}
              className="w-6 h-6"
            />
          )}
          <h2 className="text-neon-blue font-semibold text-lg">
            {match.league.name}
          </h2>
        </div>
        <p className="text-neon-purple/60 text-sm">
          {match.season.year}シーズン
        </p>
      </div>

      {/* チーム vs チーム */}
      <div className="flex items-center justify-between mb-6">
        {/* ホームチーム */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {match.home_team.has_image && (
            <img
              src={match.home_team.logo_path}
              alt={match.home_team.name}
              className="w-12 h-12"
            />
          )}
          <h3 className="text-neon-blue font-medium text-center">
            {match.home_team.name}
          </h3>
        </div>

        {/* スコア */}
        <div className="flex flex-col items-center space-y-2 px-6">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-neon-green">
              {match.score.home}
            </span>
            <span className="text-neon-blue/60">-</span>
            <span className="text-3xl font-bold text-neon-green">
              {match.score.away}
            </span>
          </div>
          <div className="text-xs text-neon-blue/60">
            前半: {match.score.halftime.home} - {match.score.halftime.away}
          </div>
          {match.is_end && (
            <div className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded">
              試合終了
            </div>
          )}
        </div>

        {/* アウェイチーム */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {match.away_team.has_image && (
            <img
              src={match.away_team.logo_path}
              alt={match.away_team.name}
              className="w-12 h-12"
            />
          )}
          <h3 className="text-neon-blue font-medium text-center">
            {match.away_team.name}
          </h3>
        </div>
      </div>

      {/* 試合日時 */}
      <div className="text-center space-y-1">
        <p className="text-neon-blue/70 text-sm">
          開始: {formatDate(match.started_at)}
        </p>
        {match.finished_at && (
          <p className="text-neon-blue/70 text-sm">
            終了: {formatDate(match.finished_at)}
          </p>
        )}
      </div>

      {/* 勝者表示 */}
      {match.winner_team_id && (
        <div className="mt-4 text-center">
          <p className="text-neon-purple font-medium">
            勝者:{" "}
            {match.winner_team_id === match.home_team.id
              ? match.home_team.name
              : match.away_team.name}
          </p>
        </div>
      )}
    </div>
  );
}
