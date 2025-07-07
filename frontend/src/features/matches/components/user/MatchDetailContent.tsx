import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatchDetailQuery } from "../../hooks/user/useMatchDetailQuery";
import {
  convertToFormationPlayers,
  separateStartersAndSubs,
  sortStartersByPosition,
} from "../../utils/formation";
import type { RatingType, FormationPlayer } from "../../types/match-detail";
import { MatchInfo } from "./MatchInfo";
import { FieldLayout } from "./FieldLayout";
import { SubstitutesList } from "./SubstitutesList";
import { RatingToggle } from "./RatingToggle";

/**
 * 試合詳細画面メインコンポーネント
 * フィールド上に選手を配置し、各種情報を表示
 */
export function MatchDetailContent() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [ratingType, setRatingType] = useState<RatingType>("api");

  const matchIdNumber = matchId ? parseInt(matchId, 10) : 0;

  const {
    data: matchResponse,
    isLoading,
    error,
  } = useMatchDetailQuery(matchIdNumber);

  const handlePlayerClick = (player: FormationPlayer) => {
    console.log("選手をクリック:", player);
    // 将来的に選手詳細モーダルやページに遷移
  };

  const handleBackToMatches = () => {
    navigate("/matches");
  };

  if (!matchId || matchIdNumber === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neon-red text-lg">無効な試合IDです</p>
          <button
            onClick={handleBackToMatches}
            className="px-6 py-2 bg-neon-blue text-space-900 rounded-lg font-medium hover:bg-neon-blue/80 transition-colors"
          >
            試合一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-neon-blue">試合詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neon-red text-lg">試合詳細の取得に失敗しました</p>
          <p className="text-neon-blue/60 text-sm">
            {error instanceof Error
              ? error.message
              : "不明なエラーが発生しました"}
          </p>
          <button
            onClick={handleBackToMatches}
            className="px-6 py-2 bg-neon-blue text-space-900 rounded-lg font-medium hover:bg-neon-blue/80 transition-colors"
          >
            試合一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!matchResponse?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neon-red text-lg">試合データが見つかりません</p>
          <button
            onClick={handleBackToMatches}
            className="px-6 py-2 bg-neon-blue text-space-900 rounded-lg font-medium hover:bg-neon-blue/80 transition-colors"
          >
            試合一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const match = matchResponse.data;
  const formationPlayers = convertToFormationPlayers(match.game_players);
  const { starters, substitutes } = separateStartersAndSubs(formationPlayers);
  const sortedStarters = sortStartersByPosition(starters);

  // ユーザー評価数を計算
  const totalUserRatedCount = match.game_players.reduce(
    (sum, player) => sum + player.user_rated_count,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToMatches}
            className="flex items-center space-x-2 px-4 py-2 bg-space-800 text-neon-blue border border-neon-blue/30 rounded-lg hover:border-neon-blue/60 transition-colors"
          >
            <span>←</span>
            <span>試合一覧に戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-neon-blue">試合詳細</h1>
          <div className="w-32" /> {/* スペーサー */}
        </div>

        {/* 試合基本情報 */}
        <div className="mb-8">
          <MatchInfo match={match} />
        </div>

        {/* レーティング切り替え */}
        <div className="mb-8">
          <RatingToggle
            currentType={ratingType}
            onTypeChange={setRatingType}
            userRatedCount={totalUserRatedCount}
          />
        </div>

        {/* フィールドレイアウト */}
        <div className="mb-8">
          <FieldLayout
            starters={sortedStarters}
            ratingType={ratingType}
            onPlayerClick={handlePlayerClick}
          />
        </div>

        {/* 控え選手一覧 */}
        <SubstitutesList
          substitutes={substitutes}
          ratingType={ratingType}
          onPlayerClick={handlePlayerClick}
        />
      </div>
    </div>
  );
}
