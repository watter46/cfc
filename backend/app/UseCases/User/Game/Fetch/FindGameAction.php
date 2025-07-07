<?php

declare(strict_types=1);

namespace App\UseCases\User\Game\Fetch;

use App\Models\Game;
use App\Models\User;
use App\Traits\Loggable;
use App\UseCases\Utils\Services\RateableService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * 試合詳細取得処理のユースケースクラス
 *
 * ユーザー向けの試合詳細取得処理を実行します。
 * 評価期限の判定や詳細データの取得を含みます。
 */
final readonly class FindGameAction
{
    use Loggable;

    public function __construct(
        private RateableService $rateable,
    ) {}

    /**
     * 試合詳細取得処理を実行
     *
     * @param  array  $inputData  リクエストデータ（ゲームID、ユーザー情報等）
     * @return Game 試合詳細データ
     *
     * @throws ModelNotFoundException 試合が見つからない場合
     */
    public function execute(array $inputData): Game
    {
        $this->logStart($inputData);

        try {
            /** @var User $user */
            $user = $inputData['user'];
            $gameId = $inputData['id'];

            // 試合詳細を取得（詳細な関連データを含める）
            $game = Game::query()
                ->with([
                    'gameUser:id,game_id,user_id,mom_count,mom_game_player_id,is_rated',
                    'homeTeam:id,name,logo_path,has_image',
                    'awayTeam:id,name,logo_path,has_image',
                    'league:id,name,logo_path,has_image',
                    'season:id,year',
                    'gamePlayers:id,game_id,player_id,is_starter,grid,position,minutes_played,assists,goals,api_rating,avg_user_rating,user_rated_count,is_mom',
                    'gamePlayers.player:id,name,position,has_image',
                    'gamePlayers.playerStatistic',
                    'gamePlayers.myRating',
                ])
                ->select([
                    'id',
                    'api_fixture_id',
                    'season_id',
                    'home_team_id',
                    'away_team_id',
                    'league_id',
                    'winner_team_id',
                    'started_at',
                    'finished_at',
                    'is_end',
                    'score',
                    'is_details_fetched',
                    'created_at',
                    'updated_at',
                ])
                ->isDetailsFetched() // 詳細データが取得済みの試合のみ
                ->findOrFail($gameId);

            // 評価期限の判定を追加
            $game->rateable = $this->rateable->check($game);

            $this->logComplete([
                'game_id' => $gameId,
                'message' => '試合詳細取得処理が完了しました',
            ]);

            return $game;

        } catch (ModelNotFoundException $e) {
            $this->logError($e, [
                'game_id' => $inputData['game_id'] ?? null,
                'message' => '試合が見つかりません',
            ]);
            throw $e;
        } catch (Exception $e) {
            $this->logError($e, [
                'game_id' => $inputData['game_id'] ?? null,
                'message' => '試合詳細取得処理でエラーが発生しました',
            ]);
            throw $e;
        }
    }
}
