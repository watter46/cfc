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
  id: string;
  name: string;
  logo?: string;
  players: Player[];
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // Laravel側からフォーマット済みの日付文字列
  score?: string; // Laravel側からのスコア文字列（例: "2-1"）
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string; // 勝利チームのID
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

// Laravel APIからのMatch データレスポンス形式
export interface LaravelMatchData {
  date: string;
  score?: string;
  home: Team;
  away: Team;
  WinnerTeamId?: string;
  isRateable: boolean;
}

// Laravel APIからのレスポンス全体
export interface LaravelMatchResponse {
  data: LaravelMatchData[];
}
