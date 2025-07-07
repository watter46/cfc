<?php

declare(strict_types=1);

namespace App\UseCases\User\Game\Fetch;

use App\Models\Game;
use App\Traits\Loggable;
use App\UseCases\User\Game\Services\GameFilterResolver;
use App\UseCases\Utils\Services\RateableService;
use Exception;
use Illuminate\Pagination\Paginator;

/**
 * ゲーム一覧取得処理のユースケースクラス
 *
 * ユーザー向けのゲーム一覧取得処理を実行します。
 * 評価期限の判定やページネーション処理を含みます。
 */
final readonly class FetchGamesAction
{
    use Loggable;

    private const LATEST_GAMES_LIMIT = 15;

    public function __construct(
        private RateableService $rateable,
        private GameFilterResolver $resolver,
    ) {}

    /**
     * ゲーム一覧取得処理を実行
     *
     * @param  array  $inputData  リクエストデータ（トーナメント種別、ページ番号等）
     * @return Paginator ページネーション付きゲームコレクション
     */
    public function execute(array $inputData): Paginator
    {
        $this->logStart($inputData);

        try {
            $resolved = $this->resolver->resolve($inputData);
            [
                'seasonId' => $resolvedSeasonId,
                'teamId'   => $resolvedTeamId,
                'leagueId' => $resolvedLeagueId,
            ] = $resolved;

            $games = Game::query()
                ->with([
                    'gameUser:id,mom_count,mom_game_player_id,is_rated',
                    'homeTeam:id,name,logo_path',
                    'awayTeam:id,name,logo_path',
                    'league:id,name,logo_path',
                    'season:id,year',
                ])
                ->select([
                    'id',
                    'season_id',
                    'home_team_id',
                    'away_team_id',
                    'league_id',
                    'winner_team_id',
                    'started_at',
                    'finished_at',
                    'score',
                ])
                ->bySeasonId($resolvedSeasonId)
                ->byTeamId($resolvedTeamId)
                ->byLeagueId($resolvedLeagueId)
                ->untilToday()
                ->isDetailsFetched()
                ->orderByDesc('started_at')
                ->simplePaginate(self::LATEST_GAMES_LIMIT, ['*'], 'page', $inputData['page'] ?? 1);

            $mapped = $games
                ->getCollection()
                ->map(function (Game $game) {
                    $game->rateable = $this->rateable->check($game);

                    return $game;
                });

            $this->logComplete(['message' => 'ゲーム一覧取得処理が完了しました']);

            return $games->setCollection($mapped);

        } catch (Exception $e) {
            $this->logError($e, ['inputData' => $inputData]);
            throw $e;
        }
    }
}
