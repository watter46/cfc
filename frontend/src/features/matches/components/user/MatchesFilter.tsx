import { useSearchParams } from "react-router-dom";
import { useMatchesQuery } from "@/features/matches/hooks/user";

interface FilterOption {
  readonly value: string;
  readonly label: string;
  readonly logoPath?: string | null;
}

interface MatchesFilterProps {
  readonly className?: string;
}

/**
 * 試合フィルターコンポーネント
 * シーズン・リーグ・チームでフィルタリング可能
 * APIから取得したselectorsデータを使用
 */
export function MatchesFilter({ className = "" }: MatchesFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data } = useMatchesQuery();

  // 現在の選択値を取得（URLパラメータ優先、なければselectedからの初期値を使用）
  const currentSeasonId =
    searchParams.get("season") ||
    (data?.selected.season_id ? data.selected.season_id.toString() : "");
  const currentLeagueId =
    searchParams.get("league") ||
    (data?.selected.league_id ? data.selected.league_id.toString() : "");
  const currentTeamId =
    searchParams.get("team") ||
    (data?.selected.team_id ? data.selected.team_id.toString() : "");

  // APIから取得したselectorsデータのみを使用（独自の「すべて」オプションは追加しない）
  const seasonOptions: FilterOption[] =
    data?.selectors.seasons.map((season) => ({
      value: season.id.toString(),
      label: season.name,
    })) || [];

  const leagueOptions: FilterOption[] =
    data?.selectors.leagues.map((league) => ({
      value: league.id?.toString() || "",
      label: league.name,
      logoPath: league.logo_path,
    })) || [];

  const teamOptions: FilterOption[] =
    data?.selectors.my_clubs.map((club) => ({
      value: club.id.toString(),
      label: club.name,
      logoPath: club.logo_path,
    })) || [];

  /**
   * フィルター値を更新
   * ページ番号は1にリセット
   */
  function updateFilter(key: string, value: string) {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // フィルター変更時はページを1に戻す
    newParams.set("page", "1");

    setSearchParams(newParams);
  }

  /**
   * すべてのフィルターを初期値（selected）に戻す
   */
  function clearFilters() {
    const newParams = new URLSearchParams();
    newParams.set("page", "1");

    // APIのselectedの初期値を設定
    if (data?.selected.season_id) {
      newParams.set("season", data.selected.season_id.toString());
    }
    if (data?.selected.league_id) {
      newParams.set("league", data.selected.league_id.toString());
    }
    if (data?.selected.team_id) {
      newParams.set("team", data.selected.team_id.toString());
    }

    setSearchParams(newParams);
  }

  // フィルターがアクティブかどうかを判定（初期値と異なる場合）
  const hasActiveFilters =
    currentSeasonId !== (data?.selected.season_id?.toString() || "") ||
    currentLeagueId !== (data?.selected.league_id?.toString() || "") ||
    currentTeamId !== (data?.selected.team_id?.toString() || "");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* フィルター見出し */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span className="w-1 h-6 bg-gradient-to-b from-neon-blue to-neon-purple rounded-full" />
          <span>フィルター</span>
        </h2>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-neon-blue hover:text-neon-purple transition-colors duration-200 hover:underline"
          >
            クリア
          </button>
        )}
      </div>

      {/* フィルター選択 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* シーズン選択 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-space-300">
            シーズン
          </label>
          <select
            value={currentSeasonId}
            onChange={(e) => updateFilter("season", e.target.value)}
            className="w-full px-3 py-2 bg-space-800/80 border border-space-600/50 rounded-lg text-white placeholder-space-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all duration-200"
          >
            {seasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* リーグ選択 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-space-300">
            リーグ
          </label>
          <select
            value={currentLeagueId}
            onChange={(e) => updateFilter("league", e.target.value)}
            className="w-full px-3 py-2 bg-space-800/80 border border-space-600/50 rounded-lg text-white placeholder-space-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all duration-200"
          >
            {leagueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* チーム選択 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-space-300">
            チーム
          </label>
          <select
            value={currentTeamId}
            onChange={(e) => updateFilter("team", e.target.value)}
            className="w-full px-3 py-2 bg-space-800/80 border border-space-600/50 rounded-lg text-white placeholder-space-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all duration-200"
          >
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* アクティブフィルター表示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {currentSeasonId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
              {
                seasonOptions.find((opt) => opt.value === currentSeasonId)
                  ?.label
              }
            </span>
          )}
          {currentLeagueId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neon-green/20 text-neon-green border border-neon-green/30">
              {
                leagueOptions.find((opt) => opt.value === currentLeagueId)
                  ?.label
              }
            </span>
          )}
          {currentTeamId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
              {teamOptions.find((opt) => opt.value === currentTeamId)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
