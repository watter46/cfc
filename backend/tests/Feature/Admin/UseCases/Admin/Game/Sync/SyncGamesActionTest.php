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
use Database\Seeders\test\ten_game\GamePlayerSeeder;
use Database\Seeders\test\ten_game\GameSeeder;
use Database\Seeders\test\ten_game\PlayerSeeder;
use Feature\Admin\AdminTestCase;
use Illuminate\Support\Facades\Log;
use Mockery;

final class SyncGamesActionTest extends AdminTestCase
{
    private SyncGamesAction $action;

    private $mockApiRepository;

    private array $sampleFixturesApiData;

    // 10試合分のテストデータを使用
    protected $seeder = [
        GameSeeder::class,
        PlayerSeeder::class,
        GamePlayerSeeder::class,
    ];

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
        // 事前条件：シーダーで10試合分のデータが既に存在している
        $this->assertEquals(10, Game::count());
        $existingGamesCount = Game::count();
        $existingTeamsCount = Team::count();
        $existingLeaguesCount = League::count();
        $existingSeasonsCount = Season::count();

        // 新しい試合データ（既存データとは異なるfixture_id）
        $newFixtureData = $this->sampleFixturesApiData;
        $newFixtureData['fixture']['id'] = 999999; // 新しいID
        $newFixtureData['teams']['home']['id'] = 999;
        $newFixtureData['teams']['away']['id'] = 998;
        $newFixtureData['league']['id'] = 999;
        $newFixtureData['league']['season'] = 2025;

        $fixtureDto = FixtureDto::fromArray($newFixtureData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2025)
            ->once()
            ->andReturn($fixturesListDto);

        // 同期実行
        $result = $this->action->execute(2025);

        // 結果確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);

        // 新しいデータが追加されることを確認
        $this->assertEquals(2, $result['teams']); // 新しいホーム・アウェイチーム
        $this->assertEquals(1, $result['leagues']); // 新しいリーグ
        $this->assertEquals(1, $result['seasons']); // 新しいシーズン
        $this->assertEquals(1, $result['games']); // 新しい試合

        // データベース状態確認：既存データ + 新データ
        $this->assertEquals($existingTeamsCount + 2, Team::count());
        $this->assertEquals($existingLeaguesCount + 1, League::count());
        $this->assertEquals($existingSeasonsCount + 1, Season::count());
        $this->assertEquals($existingGamesCount + 1, Game::count());

        // 新しく追加されたゲームデータを確認
        $newGame = Game::where('api_fixture_id', 999999)->first();
        $this->assertNotNull($newGame);
        $this->assertTrue($newGame->is_end);
        $this->assertFalse($newGame->is_details_fetched);
    }

    public function test_重複データは適切に処理される(): void
    {
        // 既存の試合データの1つを取得
        $existingGame = Game::first();
        $this->assertNotNull($existingGame);

        // 既存の試合と同じapi_fixture_idを持つ新しいデータを作成
        $duplicateFixtureData = $this->sampleFixturesApiData;
        $duplicateFixtureData['fixture']['id'] = $existingGame->api_fixture_id;

        // 既存のチーム・リーグ・シーズンIDを使用
        $homeTeam = Team::first();
        $awayTeam = Team::skip(1)->first();
        $league = League::first();
        $season = Season::first();

        $duplicateFixtureData['teams']['home']['id'] = $homeTeam->api_team_id;
        $duplicateFixtureData['teams']['away']['id'] = $awayTeam->api_team_id;
        $duplicateFixtureData['league']['id'] = $league->api_league_id;
        $duplicateFixtureData['league']['season'] = $season->year;

        $fixtureDto = FixtureDto::fromArray($duplicateFixtureData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto, $fixtureDto]), // 同じデータを2回
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with($season->year)
            ->once()
            ->andReturn($fixturesListDto);

        $gameCountBefore = Game::count();

        // 同期実行
        $result = $this->action->execute($season->year);

        // 重複が除去されて同じ件数が維持されることを確認
        $this->assertEquals($gameCountBefore, Game::count());

        // upsertにより既存データが更新されることを確認
        $this->assertEquals(0, $result['teams']); // 既存チーム、新規追加なし
        $this->assertEquals(0, $result['leagues']); // 既存リーグ、新規追加なし
        $this->assertEquals(0, $result['seasons']); // 既存シーズン、新規追加なし
        $this->assertEquals(1, $result['games']); // 1件処理（重複除去済み）
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
