<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Transformer\SeasonTransformer;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

final class SeasonTransformerTest extends TestCase
{
    private SeasonTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new SeasonTransformer;
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

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(1, $result);

        $seasonData = $result[0];
        $this->assertEquals(2024, $seasonData['year']);
        $this->assertNotNull($seasonData['updated_at']);
    }

    public function test_to_upsert_data_重複シーズンの削除(): void
    {
        $fixtureListDto = $this->createDuplicateSeasonsFixtureListDto();

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(2, $result); // 重複が削除されて2シーズンのみ

        $seasons = array_column($result, 'year');
        $this->assertContains(2024, $seasons);
        $this->assertContains(2023, $seasons);
    }

    public function test_to_upsert_data_空の_fixture_list(): void
    {
        $fixtureListDto = new FixtureListDto(collect([]));

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_to_upsert_data_複数のシーズン(): void
    {
        $fixtureListDto = $this->createMultipleSeasonsFixtureListDto();

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(3, $result);

        $seasons = array_column($result, 'year');
        sort($seasons);
        $this->assertEquals([2022, 2023, 2024], $seasons);

        foreach ($result as $seasonData) {
            $this->assertNotNull($seasonData['updated_at']);
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

    private function createDuplicateSeasonsFixtureListDto(): FixtureListDto
    {
        $fixtures = collect();

        // 共通のチーム情報
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
        $status = new StatusDto(short: 'FT', long: 'Match Finished', elapsed: 90);

        // 2024シーズンの試合を複数作成
        for ($i = 1; $i <= 3; $i++) {
            $league2024 = new LeagueDto(
                id: 39,
                name: 'Premier League',
                country: 'England',
                logo: 'https://example.com/league.png',
                flag: 'https://example.com/flag.png',
                season: 2024,
                round: "Regular Season - $i",
            );

            $fixture = new FixtureDto(
                id: 12340 + $i,
                referee: 'Test Referee',
                timezone: 'UTC',
                date: '2025-06-09T15:00:00+00:00',
                timestamp: 1733752800,
                venue: null,
                status: $status,
                league: $league2024,
                homeTeam: $homeTeam,
                awayTeam: $awayTeam,
                goals: $goals,
                score: null,
            );
            $fixtures->push($fixture);
        }

        // 2023シーズンの試合を1つ作成
        $league2023 = new LeagueDto(
            id: 39,
            name: 'Premier League',
            country: 'England',
            logo: 'https://example.com/league.png',
            flag: 'https://example.com/flag.png',
            season: 2023,
            round: 'Regular Season - 1',
        );

        $fixture2023 = new FixtureDto(
            id: 12350,
            referee: 'Test Referee',
            timezone: 'UTC',
            date: '2024-06-09T15:00:00+00:00',
            timestamp: 1717948800,
            venue: null,
            status: $status,
            league: $league2023,
            homeTeam: $homeTeam,
            awayTeam: $awayTeam,
            goals: $goals,
            score: null,
        );
        $fixtures->push($fixture2023);

        return new FixtureListDto($fixtures);
    }

    private function createMultipleSeasonsFixtureListDto(): FixtureListDto
    {
        $fixtures = collect();
        $seasons = [2022, 2023, 2024];

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
        $status = new StatusDto(short: 'FT', long: 'Match Finished', elapsed: 90);

        foreach ($seasons as $index => $season) {
            $league = new LeagueDto(
                id: 39,
                name: 'Premier League',
                country: 'England',
                logo: 'https://example.com/league.png',
                flag: 'https://example.com/flag.png',
                season: $season,
                round: 'Regular Season - 1',
            );

            $fixture = new FixtureDto(
                id: 12345 + $index,
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
            $fixtures->push($fixture);
        }

        return new FixtureListDto($fixtures);
    }
}
