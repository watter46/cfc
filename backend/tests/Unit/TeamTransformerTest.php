<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Transformer\TeamTransformer;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

final class TeamTransformerTest extends TestCase
{
    private TeamTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new TeamTransformer;
        Carbon::setTestNow('2025-06-09 15:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_to_upsert_data_個別チームデータ変換(): void
    {
        $teamDto = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: 'https://example.com/logo.png',
            winner: null,
        );

        // FixtureListDtoを作成してテスト
        $fixture = $this->createFixture($teamDto, $teamDto);
        $fixtureListDto = new FixtureListDto(collect([$fixture]));

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(1, $result); // 同じチームなので重複除去されて1つ
        $this->assertEquals(33, $result[0]['api_team_id']);
        $this->assertEquals('Manchester United', $result[0]['name']);
        $this->assertEquals('https://example.com/logo.png', $result[0]['logo_path']);
        $this->assertNotNull($result[0]['updated_at']);
    }

    public function test_to_upsert_data_無効な引数処理(): void
    {
        $fixtureListDto = new FixtureListDto(collect([]));

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_to_upsert_data_正常なデータ変換と重複除去(): void
    {
        $fixtureListDto = $this->createSampleFixtureListDto();

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(2, $result); // home, away の2チーム

        // ホームチーム
        $this->assertEquals(33, $result[0]['api_team_id']);
        $this->assertEquals('Manchester United', $result[0]['name']);
        $this->assertEquals('https://example.com/home_logo.png', $result[0]['logo_path']);

        // アウェイチーム
        $this->assertEquals(34, $result[1]['api_team_id']);
        $this->assertEquals('Manchester City', $result[1]['name']);
        $this->assertEquals('https://example.com/away_logo.png', $result[1]['logo_path']);
    }

    public function test_to_upsert_data_重複チームの除去(): void
    {
        $fixtureListDto = $this->createFixtureListWithDuplicateTeams();

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(2, $result); // 重複が除去されて2チームのみ

        // チームIDで確認
        $teamIds = collect($result)->pluck('api_team_id')->toArray();
        $this->assertContains(33, $teamIds);
        $this->assertContains(34, $teamIds);
    }

    public function test_to_upsert_data_空の_fixture_list(): void
    {
        $fixtureListDto = new FixtureListDto(collect([]));

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_to_upsert_data_空のロゴの処理(): void
    {
        $fixtureListDto = $this->createFixtureListWithEmptyLogo();

        $result = $this->transformer->toUpsertData($fixtureListDto);

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertNull($result[0]['logo_path']); // 空文字がnullとして処理される
    }

    private function createSampleFixtureListDto(): FixtureListDto
    {
        $homeTeam = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: 'https://example.com/home_logo.png',
            winner: true,
        );

        $awayTeam = new TeamDto(
            id: 34,
            name: 'Manchester City',
            logo: 'https://example.com/away_logo.png',
            winner: false,
        );

        $fixture = $this->createFixture($homeTeam, $awayTeam);

        return new FixtureListDto(collect([$fixture]));
    }

    private function createFixtureListWithDuplicateTeams(): FixtureListDto
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

        // 同じチーム同士の試合を複数作成（重複テスト用）
        $fixture1 = $this->createFixture($homeTeam, $awayTeam, 12345);
        $fixture2 = $this->createFixture($homeTeam, $awayTeam, 12346);

        return new FixtureListDto(collect([$fixture1, $fixture2]));
    }

    private function createFixtureListWithEmptyLogo(): FixtureListDto
    {
        $homeTeam = new TeamDto(
            id: 33,
            name: 'Manchester United',
            logo: '', // empty logo
            winner: null,
        );

        $awayTeam = new TeamDto(
            id: 34,
            name: 'Manchester City',
            logo: 'https://example.com/logo2.png',
            winner: null,
        );

        $fixture = $this->createFixture($homeTeam, $awayTeam);

        return new FixtureListDto(collect([$fixture]));
    }

    private function createFixture(TeamDto $homeTeam, TeamDto $awayTeam, int $id = 12345): FixtureDto
    {
        $goals = new GoalsDto(home: 1, away: 1);

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

        return new FixtureDto(
            id: $id,
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
