import type { Match } from "@/shared/types/index.ts";

/**
 * 開発用のモック試合データ
 * バックエンドAPIが利用できない場合のフォールバック
 */
export const mockMatchesData: Match[] = [
  {
    date: "05/01",
    score: {
      away: 4,
      home: 1,
      penalty: {
        away: 0,
        home: 0,
      },
      fulltime: {
        away: 4,
        home: 1,
      },
      halftime: {
        away: 2,
        home: 0,
      },
      extratime: {
        away: 0,
        home: 0,
      },
    },
    home: {
      id: 37,
      name: "Djurgardens IF",
      logo_path: "http://localhost:8000/storage/image/team/364.webp",
    },
    away: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/26",
    score: {
      away: 0,
      home: 1,
      penalty: {
        away: 0,
        home: 0,
      },
      fulltime: {
        away: 0,
        home: 1,
      },
      halftime: {
        away: 0,
        home: 1,
      },
      extratime: {
        away: 0,
        home: 0,
      },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 18,
      name: "Everton",
      logo_path: "http://localhost:8000/storage/image/team/45.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/20",
    score: {
      away: 2,
      home: 1,
      penalty: {
        away: 0,
        home: 0,
      },
      fulltime: {
        away: 2,
        home: 1,
      },
      halftime: {
        away: 0,
        home: 1,
      },
      extratime: {
        away: 0,
        home: 0,
      },
    },
    home: {
      id: 19,
      name: "Fulham",
      logo_path: "http://localhost:8000/storage/image/team/36.webp",
    },
    away: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    WinnerTeamId: 1,
    isRateable: false,
  },
  {
    date: "04/17",
    score: {
      away: 2,
      home: 1,
      penalty: {
        away: 0,
        home: 0,
      },
      fulltime: {
        away: 2,
        home: 1,
      },
      halftime: {
        away: 1,
        home: 1,
      },
      extratime: {
        away: 0,
        home: 0,
      },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 36,
      name: "Legia Warszawa",
      logo_path: "http://localhost:8000/storage/image/team/339.webp",
    },
    WinnerTeamId: 36,
    isRateable: false,
  },
  {
    date: "04/13",
    score: {
      away: 2,
      home: 2,
      penalty: {
        away: 0,
        home: 0,
      },
      fulltime: {
        away: 2,
        home: 2,
      },
      halftime: {
        away: 2,
        home: 0,
      },
      extratime: {
        away: 0,
        home: 0,
      },
    },
    home: {
      id: 1,
      name: "Chelsea",
      logo_path: "http://localhost:8000/storage/image/team/49.webp",
    },
    away: {
      id: 20,
      name: "Ipswich",
      logo_path: "http://localhost:8000/storage/image/team/57.webp",
    },
    WinnerTeamId: null,
    isRateable: false,
  },
];

/**
 * 開発環境かどうかを判定する関数
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === "development";
};

/**
 * モックデータを使用するかどうかを判定する関数
 */
export const shouldUseMockData = (): boolean => {
  return isDevelopment() && import.meta.env.VITE_USE_MOCK_DATA === "true";
};
