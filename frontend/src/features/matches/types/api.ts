/**
 * 試合関連のAPI型定義
 */

/**
 * スコア情報の型定義
 */
export interface Score {
  readonly away: number;
  readonly home: number;
  readonly fulltime: {
    readonly away: number;
    readonly home: number;
  };
  readonly halftime: {
    readonly away: number;
    readonly home: number;
  };
}

/**
 * シーズン情報の型定義
 */
export interface Season {
  readonly id: number;
  readonly name: string;
}

/**
 * チーム情報の型定義
 */
export interface Team {
  readonly id: number;
  readonly name: string;
  readonly logo_path: string;
}

/**
 * リーグ情報の型定義
 */
export interface League {
  readonly id: number;
  readonly name: string;
  readonly logo_path: string;
}

/**
 * ゲームユーザー情報の型定義
 */
export interface GameUser {
  readonly id: number | null;
  readonly user_id: number;
  readonly game_id: number;
  readonly mom_count: number | null;
  readonly mom_game_player_id: number | null;
  readonly is_rated: boolean | null;
  readonly is_winner: boolean | null; // 勝敗情報（true: 勝利, false: 敗北, null: 引き分けまたは未確定）
}

/**
 * 試合データの型定義
 */
export interface Match {
  readonly id: number;
  readonly started_at: string;
  readonly score: Score;
  readonly rateable: boolean;
  readonly season: Season;
  readonly game_user: GameUser;
  readonly teams: {
    readonly home: Team;
    readonly away: Team;
  };
  readonly league: League;
}

/**
 * ページネーション情報の型定義
 */
export interface PaginationMeta {
  readonly count: number;
  readonly per_page: number;
  readonly current_page: number;
  readonly has_more: boolean;
  readonly path: string;
}

/**
 * リンク情報の型定義
 */
export interface PaginationLinks {
  readonly first: string;
  readonly last: string | null;
  readonly prev: string | null;
  readonly next: string | null;
}

/**
 * 試合一覧APIのレスポンス型
 */
export interface MatchesResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: readonly Match[];
  readonly meta: {
    readonly pagination: PaginationMeta;
    readonly current_page: number;
    readonly from: number;
    readonly path: string;
    readonly per_page: number;
    readonly to: number;
  };
  readonly links: PaginationLinks;
  readonly selectors: {
    readonly seasons: readonly {
      readonly id: number;
      readonly year: number;
      readonly name: string;
    }[];
    readonly my_clubs: readonly {
      readonly id: number;
      readonly name: string;
      readonly logo_path: string;
    }[];
    readonly leagues: readonly {
      readonly id: number | null;
      readonly name: string;
      readonly logo_path: string | null;
    }[];
  };
  readonly selected: {
    readonly season_id: number | null;
    readonly team_id: number | null;
    readonly league_id: number | null;
  };
}

/**
 * 試合取得用のクエリパラメータ
 */
export interface MatchesQueryParams {
  readonly page?: number;
  readonly season?: number;
  readonly league?: number;
  readonly team?: number;
}

/**
 * 試合詳細取得用のクエリパラメータ
 */
export interface MatchDetailParams {
  id: number;
}

/**
 * 試合詳細APIのレスポンス型
 */
export interface MatchDetailResponse {
  data: import("./match-detail").MatchDetailData;
}
