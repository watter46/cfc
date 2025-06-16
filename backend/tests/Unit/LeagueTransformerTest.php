<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Transformer\LeagueTransformer;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

final class LeagueTransformerTest extends TestCase
{
    private LeagueTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new LeagueTransformer;
        Carbon::setTestNow('2025-06-09 15:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_to_upsert_data_基本的な変換処理(): void
    {
        $fixture = $this->createFixtureWithLeague(39, 'Premier League', 'https://example.com/premier.png');
        $fixtureListDto = new FixtureListDto(collect([$fixture]));

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(1, $result);
        $this->assertEquals(39, $result[0]['api_league_id']);
        $this->assertEquals('Premier League', $result[0]['name']);
        $this->assertEquals('https://example.com/premier.png', $result[0]['logo_path']);
        $this->assertEquals('league', $result[0]['type']);
        $this->assertNotNull($result[0]['updated_at']);
    }

    /**
     * Create a FixtureDto with the specified league information
     */
    private function createFixtureWithLeague(int $leagueId, string $leagueName, string $logo): FixtureDto
    {
        $league = new LeagueDto(
            id: $leagueId,
            name: $leagueName,
            country: 'Test Country',
            logo: $logo,
            flag: 'https://example.com/flag.png',
            season: 2024,
            round: 'Regular Season - 15',
        );

        $homeTeam = new TeamDto(
            id: 33,
            name: 'Test Home Team',
            logo: 'https://example.com/home.png',
            winner: null,
        );

        $awayTeam = new TeamDto(
            id: 34,
            name: 'Test Away Team',
            logo: 'https://example.com/away.png',
            winner: null,
        );

        $goals = new GoalsDto(home: 1, away: 1);

        $status = new StatusDto(
            short: 'FT',
            long: 'Match Finished',
            elapsed: 90,
        );

        return new FixtureDto(
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
    }
}
