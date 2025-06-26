export interface User {
  id: string;
  name: string;
  email: string;
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
 * 型定義は features/matches/types/api.ts に移動しました
 * import { Match } from "@/features/matches/types/api" を使用してください
 *
 * 以下は下位互換性のためのレガシー型定義です
 */

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

// バックエンドAPIからのMatch データレスポンス形式（レガシー）
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

// バックエンドAPIからのレスポンス全体（レガシー）
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

// 実際のAPIレスポンス形式（現在使用中）
export interface ActualMatchData {
  date: string;
  score: Score;
  home: Team;
  away: Team;
  WinnerTeamId: number | null;
  isRateable: boolean;
}

export interface LaravelMatchResponse {
  data: LaravelMatchData[];
}

// 実際のAPIレスポンス形式
export interface ActualMatchResponse {
  data: ActualMatchData[];
}
