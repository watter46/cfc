<?php

declare(strict_types=1);

namespace Tests\Feature\UseCases\Admin\Game\Sync;

use App\Models\Game;
use App\Models\League;
use App\Models\Season;
use App\Models\Team;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Exceptions\EmptyApiResponseException;
use App\UseCases\Admin\Game\Sync\SyncGamesAction;
use App\UseCases\Admin\Game\Sync\Transformer\GameTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\LeagueTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\SeasonTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\TeamTransformer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

final class SyncGamesActionTest extends TestCase
{
    use RefreshDatabase;

    private SyncGamesAction $action;

    private $mockApiRepository;

    private array $sampleFixturesApiData;

    protected function setUp(): void
    {
        parent::setUp();

        // モックのAPIリポジトリを作成
        $this->mockApiRepository = Mockery::mock(ApiFootballRepositoryInterface::class);

        // SyncGamesActionインスタンスを作成
        $this->action = new SyncGamesAction(
            $this->mockApiRepository,
            new GameTransformer,
            new TeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        $this->setupSampleData();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function setupSampleData(): void
    {
        $this->sampleFixturesApiData = [
            'fixture' => [
                'id'        => 215662,
                'referee'   => 'M. Oliver',
                'timezone'  => 'UTC',
                'date'      => '2020-02-06T14:00:00+00:00',
                'timestamp' => 1580994000,
                'venue'     => [
                    'id'   => 547,
                    'name' => 'Old Trafford',
                    'city' => 'Manchester',
                ],
                'status' => [
                    'long'    => 'Match Finished',
                    'short'   => 'FT',
                    'elapsed' => 90,
                ],
            ],
            'league' => [
                'id'      => 39,
                'name'    => 'Premier League',
                'country' => 'England',
                'logo'    => 'https://media.api-sports.io/football/leagues/39.png',
                'flag'    => 'https://media.api-sports.io/flags/gb.svg',
                'season'  => 2020,
                'round'   => 'Regular Season - 25',
            ],
            'teams' => [
                'home' => [
                    'id'   => 33,
                    'name' => 'Manchester United',
                    'logo' => 'https://media.api-sports.io/football/teams/33.png',
                ],
                'away' => [
                    'id'   => 34,
                    'name' => 'Leicester City',
                    'logo' => 'https://media.api-sports.io/football/teams/34.png',
                ],
            ],
            'goals' => [
                'home' => 0,
                'away' => 1,
            ],
            'score' => [
                'halftime' => [
                    'home' => 0,
                    'away' => 1,
                ],
                'fulltime' => [
                    'home' => 0,
                    'away' => 1,
                ],
                'extratime' => [
                    'home' => null,
                    'away' => null,
                ],
                'penalty' => [
                    'home' => null,
                    'away' => null,
                ],
            ],
        ];
    }

    public function test_シーズン試合データを正常に同期できる(): void
    {
        // APIからのレスポンスをモック
        $fixtureDto = FixtureDto::fromArray($this->sampleFixturesApiData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        // 同期前の状態確認
        $this->assertEquals(0, Team::count());
        $this->assertEquals(0, League::count());
        $this->assertEquals(0, Season::count());
        $this->assertEquals(0, Game::count());

        // 同期実行
        $result = $this->action->execute(2020);

        // 結果確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);

        // データベース状態確認
        $this->assertEquals(2, Team::count()); // ホーム・アウェイ
        $this->assertEquals(1, League::count());
        $this->assertEquals(1, Season::count());
        $this->assertEquals(1, Game::count());

        // チームデータ確認
        $homeTeam = Team::where('api_team_id', 33)->first();
        $awayTeam = Team::where('api_team_id', 34)->first();

        $this->assertNotNull($homeTeam);
        $this->assertNotNull($awayTeam);
        $this->assertEquals('Manchester United', $homeTeam->name);
        $this->assertEquals('Leicester City', $awayTeam->name);

        // リーグデータ確認
        $league = League::where('api_league_id', 39)->first();
        $this->assertNotNull($league);
        $this->assertEquals('Premier League', $league->name);

        // シーズンデータ確認
        $season = Season::where('year', 2020)->first();
        $this->assertNotNull($season);

        // ゲームデータ確認
        $game = Game::where('api_fixture_id', 215662)->first();
        $this->assertNotNull($game);
        $this->assertEquals($homeTeam->id, $game->home_team_id);
        $this->assertEquals($awayTeam->id, $game->away_team_id);
        $this->assertEquals($awayTeam->id, $game->winner_team_id); // アウェイ勝利
        $this->assertEquals($league->id, $game->league_id);
        $this->assertEquals($season->id, $game->season_id);
        $this->assertTrue($game->is_end);
    }

    public function test_重複データは適切に処理される(): void
    {
        // 同じデータを2回含むレスポンスをモック
        $fixtureDto = FixtureDto::fromArray($this->sampleFixturesApiData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto, $fixtureDto]), // 重複データ
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        // 同期実行
        $result = $this->action->execute(2020);

        // 重複が除去されて1件ずつ保存されることを確認
        $this->assertEquals(2, Team::count()); // ホーム・アウェイ
        $this->assertEquals(1, League::count());
        $this->assertEquals(1, Season::count());
        $this->assertEquals(1, Game::count());

        // 結果に重複除去が反映されることを確認
        $this->assertEquals(2, $result['teams']);
        $this->assertEquals(1, $result['leagues']);
        $this->assertEquals(1, $result['seasons']);
        $this->assertEquals(1, $result['games']);
    }

    public function test_ログが適切に出力される(): void
    {
        // ログをモック
        Log::shouldReceive('info')
            ->withAnyArgs()
            ->andReturnNull();

        $fixtureDto = FixtureDto::fromArray($this->sampleFixturesApiData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        $result = $this->action->execute(2020);

        // 結果が正常であることを確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);
    }

    public function test_空のシーズンデータで例外が発生する(): void
    {
        // 空のfixturesを持つDTOを作成
        $emptyFixturesListDto = new FixtureListDto(
            fixtures: collect([]), // 空のコレクション
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($emptyFixturesListDto);

        // EmptyApiResponseExceptionが発生することを確認
        $this->expectException(EmptyApiResponseException::class);
        $this->expectExceptionMessage('API応答にシーズンデータが含まれていません。');

        $this->action->execute(2020);
    }

    public function test_空のチームデータで例外が発生する(): void
    {
        // チーム情報のないfixtureを作成するか、
        // transformToUpsertDataが空の配列を返すようなモックを設定
        $fixtureDto = FixtureDto::fromArray($this->sampleFixturesApiData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        // TeamTransformerが空の配列を返すようにモック
        $mockTeamTransformer = Mockery::mock(TeamTransformer::class);
        $mockTeamTransformer->shouldReceive('transformToUpsertData')->andReturn([]);

        $action = new SyncGamesAction(
            $this->mockApiRepository,
            new GameTransformer(
                $mockTeamTransformer,
                new LeagueTransformer,
                new SeasonTransformer,
            ),
            $mockTeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        $this->expectException(EmptyApiResponseException::class);
        $this->expectExceptionMessage('API応答にチームデータが含まれていません。');

        $action->execute(2020);
    }
}
