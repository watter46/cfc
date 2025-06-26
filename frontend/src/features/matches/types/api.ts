/**
 * 試合関連のAPI型定義
 */

/**
 * 試合データの型定義
 */
export interface Match {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: "upcoming" | "ongoing" | "completed" | "cancelled";
  readonly startTime: string;
  readonly endTime?: string;
  readonly maxPlayers: number;
  readonly currentPlayers: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly creator?: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly players?: Array<{
    readonly id: string;
    readonly name: string;
    readonly joinedAt: string;
  }>;
}

/**
 * 試合一覧APIのレスポンス型
 */
export interface MatchesResponse {
  readonly matches: readonly Match[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/**
 * 試合取得用のクエリパラメータ
 */
export interface MatchesQueryParams {
  readonly page?: number;
  readonly limit?: number;
  readonly status?: Match["status"];
  readonly search?: string;
}
