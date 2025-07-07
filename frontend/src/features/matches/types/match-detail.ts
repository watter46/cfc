/**
 * 試合詳細画面で使用する型定義
 */

export interface MatchDetailData {
  id: number;
  api_fixture_id: number;
  started_at: string;
  finished_at: string;
  is_end: boolean;
  is_details_fetched: boolean;
  score: MatchScore;
  rateable: boolean;
  created_at: string | null;
  updated_at: string | null;
  home_team: Team;
  away_team: Team;
  winner_team_id: number | null;
  league: League;
  season: Season;
  game_user: GameUser;
  game_players: GamePlayer[];
}

export interface MatchScore {
  away: number;
  home: number;
  fulltime: {
    away: number;
    home: number;
  };
  halftime: {
    away: number;
    home: number;
  };
}

export interface Team {
  id: number;
  name: string;
  logo_path: string;
  has_image: boolean;
}

export interface League {
  id: number;
  name: string;
  logo_path: string;
  has_image: boolean;
}

export interface Season {
  id: number;
  year: number;
}

export interface GameUser {
  id: number | null;
  mom_count: number | null;
  mom_game_player_id: number | null;
  is_rated: boolean | null;
}

export interface GamePlayer {
  id: number;
  is_starter: boolean;
  grid: string | null;
  position: PlayerPosition;
  minutes_played: number;
  assists: number;
  goals: number | null;
  api_rating: number;
  avg_user_rating: number | null;
  user_rated_count: number;
  is_mom: number;
  player: Player;
  team: {
    id: number | null;
    name: string | null;
  };
  player_statistic: PlayerStatistic;
  my_rating: number | null;
}

export interface Player {
  id: number;
  name: string;
  position: PlayerPosition;
  has_image: boolean;
}

export interface PlayerStatistic {
  shots_total: number | null;
  shots_on_target: number | null;
  passes_total: number | null;
  passes_accuracy: number | null;
  key_passes: number | null;
  tackles: number | null;
  blocks: number | null;
  interceptions: number | null;
  duels_won: number | null;
  duels_total: number | null;
  dribbles_success: number | null;
  dribbles_attempts: number | null;
  fouls_committed: number | null;
  fouls_drawn: number | null;
  yellow_cards: number;
  red_cards: number;
  saves: number | null;
  goals_conceded: number;
}

export type PlayerPosition = "G" | "D" | "M" | "F";

export interface MatchDetailResponse {
  data: MatchDetailData;
}

/**
 * レーティング表示タイプ
 */
export type RatingType = "my" | "user" | "api";

/**
 * フィールドポジション（gridを解析した結果）
 */
export interface FieldPosition {
  row: number;
  col: number;
}

/**
 * フォーメーション配置用の選手情報
 */
export interface FormationPlayer extends GamePlayer {
  fieldPosition: FieldPosition;
  firstName: string;
}
