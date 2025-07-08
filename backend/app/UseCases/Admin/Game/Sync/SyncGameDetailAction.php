<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Events\GameDetailSynced;
use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\Player;
use App\Models\PlayerStatistic;
use App\Traits\Loggable;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Service\GameDataFilterService;
use App\UseCases\Admin\Game\Sync\Service\ImageSyncDataService;
use App\UseCases\Admin\Game\Sync\Service\SupportedClubsService;
use App\UseCases\Admin\Game\Sync\Transformer\GamePlayerTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\GameTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\PlayerStatisticTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\PlayerTransformer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final readonly class SyncGameDetailAction
{
    use Loggable;
    public function __construct(
        private ApiFootballRepositoryInterface $repository,
        private GameTransformer $gameTransformer,
        private PlayerTransformer $playerTransformer,
        private GamePlayerTransformer $gamePlayerTransformer,
        private PlayerStatisticTransformer $playerStatisticTransformer,
        private SupportedClubsService $supportedClubService,
        private GameDataFilterService $gameDataFilterService,
        private ImageSyncDataService $imageSyncDataService,
    ) {}

    /**
     * ApiFootballから試合詳細データを取得して
     * Game Player GamePlayer PlayerStatisticモデルを更新
     *
     * 一試合のみの詳細データを同期する
     * データ保存後にGameDetailSyncedイベントを発火
     *
     * @throws RuntimeException 試合が完了していない場合
     */
    public function execute(int $apiFixtureId): void
    {
        $fixtureDetail = $this->repository->fetchFixtureDetail($apiFixtureId);

        // 試合完了チェック
        if (! $fixtureDetail->isFinished()) {
            throw new RuntimeException("Game is not finished. Cannot sync detail data for fixture ID: {$apiFixtureId}");
        }

        $game = $this->validateGameExists($apiFixtureId);

        $service = $this->gameDataFilterService->from($fixtureDetail);

        DB::transaction(function () use ($game, $service) {
            $this->updateGame($game, $service);
            $this->updatePlayers($game, $service);
            $this->updateGamePlayers($game, $service);
            $this->updatePlayerStatistics($game, $service);
        });

        $eventData = collect([
            'teams'   => $this->imageSyncDataService->getTeamsWithoutImages(),
            'leagues' => $this->imageSyncDataService->getLeaguesWithoutImages(),
            'players' => $this->imageSyncDataService->getPlayersWithoutImages(),
        ]);

        GameDetailSynced::dispatch($eventData);
    }

    /**
     * 試合の存在確認
     */
    private function validateGameExists(int $apiFixtureId): Game
    {
        /** @var Game|null $game */
        $game = Game::with([
            'homeTeam:id,api_team_id',
            'awayTeam:id,api_team_id',
            'season:id,year',
        ])
            ->where('api_fixture_id', $apiFixtureId)
            ->first();

        if (! $game) {
            throw new ModelNotFoundException("Game not found with api_fixture_id: {$apiFixtureId}");
        }

        return $game;
    }

    /**
     * 試合詳細の更新
     */
    private function updateGame(Game $game, GameDataFilterService $service): void
    {
        $teamIdMapping = collect([
            $game->homeTeam->api_team_id => $game->homeTeam->id,
            $game->awayTeam->api_team_id => $game->awayTeam->id,
        ]);

        $gameData = $this->gameTransformer->toUpdateData($service, $teamIdMapping);

        $game->update($gameData);
    }

    /**
     * プレイヤーの更新
     */
    private function updatePlayers(Game $game, GameDataFilterService $service): void
    {
        $supportedPlayerIds = $service->getPlayedPlayerIds();

        $existingPlayers = Player::query()
            ->whereIn('api_player_id', $supportedPlayerIds)
            ->get(['api_player_id', 'name', 'position'])
            ->keyBy('api_player_id');

        $playersData = $this->playerTransformer
            ->toUpsertData(
                $game,
                $service,
                $existingPlayers,
            );

        Player::upsert(
            $playersData,
            ['api_player_id', 'team_id', 'season_id'],
            [
                'api_player_id', 'team_id', 'season_id', 'name', 'name_plain', 'position',
                'number', 'image_path',
            ],
        );
    }

    /**
     * ゲームプレイヤーの更新
     */
    private function updateGamePlayers(Game $game, GameDataFilterService $service): void
    {
        $playerIdMapping = Player::query()
            ->whereIn('api_player_id', $service->getPlayedPlayerIds())
            ->pluck('id', 'api_player_id');

        $gamePlayersData = $this->gamePlayerTransformer
            ->toUpsert(
                $game,
                $service,
                $playerIdMapping,
            );

        GamePlayer::upsert(
            $gamePlayersData,
            ['game_id', 'player_id'],
            [
                'is_starter', 'grid', 'position', 'minutes_played',
                'assists', 'goals', 'api_rating', 'updated_at',
            ],
        );
    }

    /**
     * プレイヤー統計の更新
     */
    private function updatePlayerStatistics(Game $game, GameDataFilterService $service): void
    {
        $gamePlayerIdMapping = GamePlayer::query()
            ->where('game_id', $game->id)
            ->with('player:id,api_player_id')
            ->get(['id', 'player_id'])
            ->mapWithKeys(function (GamePlayer $gamePlayer) {
                return collect([$gamePlayer->player->api_player_id => $gamePlayer->id]);
            });

        $playerStatisticsData = $this->playerStatisticTransformer->toUpsert($service, $gamePlayerIdMapping);

        PlayerStatistic::upsert(
            $playerStatisticsData,
            ['game_player_id'],
            [
                'shots_total', 'shots_on_target', 'passes_total', 'passes_accuracy',
                'key_passes', 'tackles', 'blocks', 'interceptions', 'duels_won',
                'duels_total', 'dribbles_success', 'dribbles_attempts',
                'fouls_committed', 'fouls_drawn', 'yellow_cards', 'red_cards',
                'saves', 'goals_conceded',
            ],
        );
    }
}
