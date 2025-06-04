import type {
  Match,
  LaravelMatchData,
  LaravelMatchResponse,
} from "@/shared/types";

// Featured matches for HomePage - Laravel JSONデータに基づく
export const featuredMatches: Match[] = [
  {
    id: "1",
    homeTeam: {
      id: "1",
      name: "FC Barcelona",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    awayTeam: {
      id: "2",
      name: "Real Madrid",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    date: "2025-04-30 19:45",
    score: "2-1",
    homeScore: 2,
    awayScore: 1,
    winnerTeamId: "1",
    isRateable: true,
  },
  {
    id: "2",
    homeTeam: {
      id: "3",
      name: "Liverpool",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    awayTeam: {
      id: "4",
      name: "Manchester City",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    date: "2025-05-01 20:00",
    score: "3-2",
    homeScore: 3,
    awayScore: 2,
    winnerTeamId: "3",
    isRateable: true,
  },
  {
    id: "3",
    homeTeam: {
      id: "5",
      name: "Bayern Munich",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    awayTeam: {
      id: "6",
      name: "Borussia Dortmund",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    date: "2025-05-05 18:30",
    score: "1-0",
    homeScore: 1,
    awayScore: 0,
    winnerTeamId: "5",
    isRateable: false, // 評価不可の例
  },
  {
    id: "4",
    homeTeam: {
      id: "7",
      name: "Chelsea",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    awayTeam: {
      id: "8",
      name: "Arsenal",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    date: "2025-05-08 16:30",
    score: "0-2",
    homeScore: 0,
    awayScore: 2,
    winnerTeamId: "8",
    isRateable: true,
  },
  {
    id: "5",
    homeTeam: {
      id: "9",
      name: "Juventus",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    awayTeam: {
      id: "10",
      name: "AC Milan",
      logo: "https://via.placeholder.com/64",
      players: [],
    },
    date: "2025-05-10 20:45",
    score: "1-1",
    homeScore: 1,
    awayScore: 1,
    winnerTeamId: undefined, // 引き分け
    isRateable: false, // 評価不可の例
  },
];

// Laravel APIからのデータをMatch型に変換するユーティリティ関数
export const convertLaravelMatchToMatch = (
  laravelMatch: LaravelMatchData,
  id: string,
): Match => {
  // スコア文字列から個別スコアを抽出
  let homeScore: number | undefined;
  let awayScore: number | undefined;

  if (laravelMatch.score) {
    const scoreParts = laravelMatch.score.split("-");
    if (scoreParts.length === 2) {
      homeScore = parseInt(scoreParts[0], 10);
      awayScore = parseInt(scoreParts[1], 10);
    }
  }

  return {
    id,
    homeTeam: laravelMatch.home,
    awayTeam: laravelMatch.away,
    date: laravelMatch.date,
    score: laravelMatch.score,
    homeScore,
    awayScore,
    winnerTeamId: laravelMatch.WinnerTeamId,
    isRateable: laravelMatch.isRateable,
  };
};

// Laravel APIからのレスポンス全体を変換
export const convertLaravelMatchResponse = (
  response: LaravelMatchResponse,
): Match[] => {
  return response.data.map((match, index) =>
    convertLaravelMatchToMatch(match, `${index + 1}`),
  );
};

export default featuredMatches;
