<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Events\GamesSynced;
use App\Models\Game;
use App\Models\League;
use App\Models\Season;
use App\Models\Team;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Exceptions\EmptyApiResponseException;
use App\UseCases\Admin\Game\Sync\Transformer\GameTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\LeagueTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\SeasonTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\TeamTransformer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class SyncGamesAction
{
    public function __construct(
        private ApiFootballRepositoryInterface $apiFootballRepository,
        private GameTransformer $gameTransformer,
        private TeamTransformer $teamTransformer,
        private LeagueTransformer $leagueTransformer,
        private SeasonTransformer $seasonTransformer,
    ) {}

    /**
     * 指定されたシーズンの試合データを同期
     */
    public function execute(int $season): void
    {
        $fixturesListDto = $this->apiFootballRepository->fetchFixtures($season);

        // DB::transaction(function () use ($fixturesListDto) {
        //     $this->updateSeason($fixturesListDto);
        //     $this->updateLeagues($fixturesListDto);
        //     $this->updateTeams($fixturesListDto);
        //     $this->updateGames($fixturesListDto);
        // });

        $eventData = collect([
            'apiTeamIds'   => $fixturesListDto->apiTeamIds(),
            'apiLeagueIds' => $fixturesListDto->apiLeagueIds(),
        ]);

        GamesSynced::dispatch($eventData);
    }

    public function updateSeason(FixtureListDto $fixturesListDto): void
    {
        $seasonsData = $this->seasonTransformer->toUpsertData($fixturesListDto);

        if (empty($seasonsData)) {
            throw new EmptyApiResponseException('シーズン');
        }

        Season::upsert(
            $seasonsData,
            ['year'],
            ['start_date', 'end_date', 'is_current', 'updated_at'],
        );
    }

    public function updateLeagues(FixtureListDto $fixturesListDto): void
    {
        $leaguesData = $this->leagueTransformer->toUpsertData($fixturesListDto);

        if (empty($leaguesData)) {
            throw new EmptyApiResponseException('リーグ');
        }

        League::upsert(
            $leaguesData,
            ['api_league_id'],
            ['name', 'type', 'logo_path', 'updated_at'],
        );
    }

    public function updateTeams(FixtureListDto $fixturesListDto): void
    {
        $teamsData = $this->teamTransformer->toUpsertData($fixturesListDto);

        if (empty($teamsData)) {
            throw new EmptyApiResponseException('チーム');
        }

        Team::upsert(
            $teamsData,
            ['api_team_id'],
            ['name', 'logo_path', 'updated_at'],
        );
    }

    public function updateGames(FixtureListDto $fixturesListDto): void
    {
        $relationIds = $this->resolveGameRelationIds($fixturesListDto);

        $gamesData = $this->gameTransformer->toUpsertData($fixturesListDto, $relationIds);

        if (empty($gamesData)) {
            throw new EmptyApiResponseException('ゲーム');
        }

        Game::upsert(
            $gamesData,
            ['api_fixture_id'],
            [
                'home_team_id', 'away_team_id', 'winner_team_id',
                'league_id', 'season_id', 'score', 'is_end',
                'is_details_fetched', 'started_at', 'finished_at', 'updated_at',
            ],
        );
    }

    /**
     * ゲームの関連IDを解決
     */
    private function resolveGameRelationIds(FixtureListDto $fixturesListDto): Collection
    {
        $teamMapping = Team::whereIn('api_team_id', $fixturesListDto->apiTeamIds())
            ->pluck('id', 'api_team_id');

        $leagueMapping = League::whereIn('api_league_id', $fixturesListDto->apiLeagueIds())
            ->pluck('id', 'api_league_id');

        $seasonMapping = Season::whereIn('year', $fixturesListDto->getUniqueSeasonYears())
            ->pluck('id', 'year');

        return collect([
            'teamMapping'   => $teamMapping,
            'leagueMapping' => $leagueMapping,
            'seasonMapping' => $seasonMapping,
        ]);
    }
}
