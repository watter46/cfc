export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  teamId: string;
  avatar?: string;
}

export const Position = {
  Goalkeeper: "GK",
  Defender: "DF",
  Midfielder: "MF",
  Forward: "FW",
} as const;

export type Position = (typeof Position)[keyof typeof Position];

export interface Team {
  id: number;
  name: string;
  logo_path?: string;
  players?: Player[];
}

/**
 * 試合のスコア情報
 */
export interface Score {
  away: number;
  home: number;
  penalty: {
    away: number;
    home: number;
  };
  fulltime: {
    away: number;
    home: number;
  };
  halftime: {
    away: number;
    home: number;
  };
  extratime: {
    away: number;
    home: number;
  };
}

/**
 * APIから取得される試合データの型定義
 * バックエンドのAPIレスポンスと一致するように設計
 */
export interface Match {
  date: string; // フォーマット: "MM/DD"
  score: Score; // 終了した試合のみなので常にnon-null
  home: Team;
  away: Team;
  WinnerTeamId: number | null; // 勝利チームのID（引き分けの場合はnull）
  isRateable: boolean; // 評価可能かどうか
}

// MatchStatusはLIVEが不要なので、CompletedとUpcomingのみ
export const MatchStatus = {
  Upcoming: "UPCOMING",
  Completed: "COMPLETED",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export interface PlayerRating {
  playerId: string;
  matchId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface PositionCoordinate {
  player: Player;
  x: number;
  y: number;
}

// バックエンドAPIからのMatch データレスポンス形式
export interface BackendMatchData {
  date: string;
  score: {
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
  };
  home: {
    id: number;
    logo_path: string;
  };
  away: {
    id: number;
    logo_path: string;
  };
  WinnerTeamId: number | null;
  isRateable: boolean;
}

// バックエンドAPIからのレスポンス全体
export interface BackendMatchResponse {
  data: BackendMatchData[];
}

// 下位互換のためのLegacy型定義（削除予定）
export interface LaravelMatchData {
  date: string;
  score?: string;
  home: Team;
  away: Team;
  WinnerTeamId?: string;
  isRateable: boolean;
}

export interface LaravelMatchResponse {
  data: LaravelMatchData[];
}
