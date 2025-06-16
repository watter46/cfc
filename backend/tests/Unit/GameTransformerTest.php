<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Transformer\GameTransformer;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

final class GameTransformerTest extends TestCase
{
    private GameTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new GameTransformer;
        Carbon::setTestNow('2025-06-09 15:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_to_upsert_data_正常なデータ変換(): void
    {
        $fixtureListDto = $this->createSampleFixtureListDto();
        $relationIds = $this->createSampleRelationIds();

        $result = $this->transformer->toUpsertData($fixtureListDto, $relationIds);

        $this->assertIsArray($result);
        $this->assertCount(1, $result);

        $gameData = $result[0];
        $this->assertEquals(12345, $gameData['api_fixture_id']);
        $this->assertEquals(1, $gameData['home_team_id']);
        $this->assertEquals(2, $gameData['away_team_id']);
        $this->assertEquals(1, $gameData['winner_team_id']);
        $this->assertEquals(1, $gameData['league_id']);
        $this->assertEquals(1, $gameData['season_id']);
        $this->assertTrue($gameData['is_end']);
        $this->assertFalse($gameData['is_details_fetched']);
        $this->assertNotNull($gameData['score']);
        $this->assertNotNull($gameData['started_at']);
        $this->assertNotNull($gameData['finished_at']);
        $this->assertNotNull($gameData['updated_at']);
    }

    public function test_to_upsert_data_不完全なマッピングデータをフィルタリング(): void
    {
        $fixtureListDto = $this->createSampleFixtureListDto();
        $relationIds = collect([
            'teamMapping'   => collect([33 => 1]), // away_teamのマッピングがない
            'leagueMapping' => collect([39 => 1]),
            'seasonMapping' => collect([2024 => 1]),
        ]);

        $result = $this->transformer->toUpsertData($fixtureListDto, $relationIds);

        $this->assertIsArray($result);
        $this->assertCount(0, $result); // フィルタリングされて空になる
    }

    public function test_to_upsert_data_空の_fixture_list(): void
    {
        $fixtureListDto = new FixtureListDto(collect([]));
        $relationIds = $this->createSampleRelationIds();

        $result = $this->transformer->toUpsertData($fixtureListDto, $relationIds);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_to_upsert_data_引き分けの場合のwinner_team_id(): void
    {
        $fixtureListDto = $this->createDrawFixtureListDto();
        $relationIds = $this->createSampleRelationIds();

        $result = $this->transformer->toUpsertData($fixtureListDto, $relationIds);

        $this->assertIsArray($result);
        $this->assertCount(1, $result);
        $this->assertNull($result[0]['winner_team_id']); // 引き分けなのでnull
    }

    public function test_to_upsert_data_複数の終了した試合(): void
    {
        $fixtureListDto = $this->createMultipleFinishedFixtureListDto();
        $relationIds = $this->createSampleRelationIds();

        $result = $this->transformer->toUpsertData($fixtureListDto, $relationIds);

        $this->assertIsArray($result);
        $this->assertCount(2, $result); // 2つの終了した試合

        foreach ($result as $gameData) {
            $this->assertTrue($gameData['is_end']); // 全て終了している
            $this->assertNotNull($gameData['finished_at']); // 終了時刻が設定されている
            $this->assertFalse($gameData['is_details_fetched']); // 詳細は未取得
        }
    }

    private function createSampleFixtureListDto(): FixtureListDto
    {
        $homeTeam = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: 'https://example.com/logo.png',
            winner: true,
        );

        $awayTeam = new TeamDto(
            id: 34,
            name: 'Manchester City',
            logo: 'https://example.com/logo2.png',
            winner: false,
        );

        $goals = new GoalsDto(home: 2, away: 1);

        $league = new LeagueDto(
            id: 39,
            name: 'Premier League',
            country: 'England',
            logo: 'https://example.com/league.png',
            flag: 'https://example.com/flag.png',
            season: 2024,
            round: 'Regular Season - 15',
        );

        $status = new StatusDto(
            short: 'FT',
            long: 'Match Finished',
            elapsed: 90,
        );

        $fixture = new FixtureDto(
            id: 12345,
            referee: 'Test Referee',
            timezone: 'UTC',
            date: '2025-06-09T15:00:00+00:00',
            timestamp: 1733752800,
            venue: null,
            status: $status,
            league: $league,
            homeTeam: $homeTeam,
            awayTeam: $awayTeam,
            goals: $goals,
            score: null,
        );

        return new FixtureListDto(collect([$fixture]));
    }

    private function createDrawFixtureListDto(): FixtureListDto
    {
        $homeTeam = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: 'https://example.com/logo.png',
            winner: null,
        );

        $awayTeam = new TeamDto(
            id: 34,
            name: 'Manchester City',
            logo: 'https://example.com/logo2.png',
            winner: null,
        );

        $goals = new GoalsDto(home: 1, away: 1); // 引き分け

        $league = new LeagueDto(
            id: 39,
            name: 'Premier League',
            country: 'England',
            logo: 'https://example.com/league.png',
            flag: 'https://example.com/flag.png',
            season: 2024,
            round: 'Regular Season - 15',
        );

        $status = new StatusDto(
            short: 'FT',
            long: 'Match Finished',
            elapsed: 90,
        );

        $fixture = new FixtureDto(
            id: 12345,
            referee: 'Test Referee',
            timezone: 'UTC',
            date: '2025-06-09T15:00:00+00:00',
            timestamp: 1733752800,
            venue: null,
            status: $status,
            league: $league,
            homeTeam: $homeTeam,
            awayTeam: $awayTeam,
            goals: $goals,
            score: null,
        );

        return new FixtureListDto(collect([$fixture]));
    }

    private function createMultipleFinishedFixtureListDto(): FixtureListDto
    {
        $fixtures = collect();

        // 1つ目の終了した試合
        $homeTeam1 = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: 'https://example.com/logo.png',
            winner: true,
        );

        $awayTeam1 = new TeamDto(
            id: 34,
            name: 'Manchester City',
            logo: 'https://example.com/logo2.png',
            winner: false,
        );

        $goals1 = new GoalsDto(home: 2, away: 1);

        $league = new LeagueDto(
            id: 39,
            name: 'Premier League',
            country: 'England',
            logo: 'https://example.com/league.png',
            flag: 'https://example.com/flag.png',
            season: 2024,
            round: 'Regular Season - 15',
        );

        $status1 = new StatusDto(
            short: 'FT',
            long: 'Match Finished',
            elapsed: 90,
        );

        $fixture1 = new FixtureDto(
            id: 12345,
            referee: 'Test Referee',
            timezone: 'UTC',
            date: '2025-06-09T15:00:00+00:00',
            timestamp: 1733752800,
            venue: null,
            status: $status1,
            league: $league,
            homeTeam: $homeTeam1,
            awayTeam: $awayTeam1,
            goals: $goals1,
            score: null,
        );

        // 2つ目の終了した試合
        $homeTeam2 = new TeamDto(
            id: 35,
            name: 'Liverpool',
            logo: 'https://example.com/logo3.png',
            winner: false,
        );

        $awayTeam2 = new TeamDto(
            id: 36,
            name: 'Chelsea',
            logo: 'https://example.com/logo4.png',
            winner: true,
        );

        $goals2 = new GoalsDto(home: 0, away: 3);

        $status2 = new StatusDto(
            short: 'FT',
            long: 'Match Finished',
            elapsed: 90,
        );

        $fixture2 = new FixtureDto(
            id: 12346,
            referee: 'Test Referee 2',
            timezone: 'UTC',
            date: '2025-06-09T17:30:00+00:00',
            timestamp: 1733761800,
            venue: null,
            status: $status2,
            league: $league,
            homeTeam: $homeTeam2,
            awayTeam: $awayTeam2,
            goals: $goals2,
            score: null,
        );

        $fixtures->push($fixture1);
        $fixtures->push($fixture2);

        return new FixtureListDto($fixtures);
    }

    private function createSampleRelationIds(): Collection
    {
        return collect([
            'teamMapping'   => collect([33 => 1, 34 => 2, 35 => 3, 36 => 4]),
            'leagueMapping' => collect([39 => 1]),
            'seasonMapping' => collect([2024 => 1]),
        ]);
    }
}
