<?php

declare(strict_types=1);

namespace Tests\Feature\Admin\UseCases\Game\Sync;

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
use DB;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\Feature\Admin\AdminTestCase;

final class SyncGamesActionTest extends AdminTestCase
{
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

    /**
     * テスト用データベースをクリア（空のデータから開始したいテスト用）
     */
    private function clearDatabase(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $tables = ['game_players', 'games', 'players', 'teams', 'seasons', 'leagues'];
        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * 基本的なテストデータを作成（League, Season, Team）
     */
    private function createBasicTestData(): array
    {
        $league = League::create([
            'id'      => 39,
            'name'    => 'Premier League',
            'country' => 'England',
            'logo'    => 'https://media.api-sports.io/football/leagues/39.png',
            'flag'    => 'https://media.api-sports.io/flags/gb.svg',
        ]);

        $season = Season::create([
            'id'         => 1,
            'league_id'  => $league->id,
            'year'       => 2020,
            'start_date' => '2020-08-01',
            'end_date'   => '2021-05-23',
            'is_current' => true,
        ]);

        $homeTeam = Team::create([
            'id'   => 33,
            'name' => 'Manchester United',
            'logo' => 'https://media.api-sports.io/football/teams/33.png',
        ]);

        $awayTeam = Team::create([
            'id'   => 34,
            'name' => 'Leicester City',
            'logo' => 'https://media.api-sports.io/football/teams/34.png',
        ]);

        return [
            'league'   => $league,
            'season'   => $season,
            'homeTeam' => $homeTeam,
            'awayTeam' => $awayTeam,
        ];
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
        // 空のデータから開始
        $this->clearDatabase();

        // 基本テストデータを作成
        $testData = $this->createBasicTestData();

        // 事前条件：データベースが空であることを確認
        $this->assertEquals(0, Game::count());
        $this->assertEquals(2, Team::count()); // 作成したホーム・アウェイチーム
        $this->assertEquals(1, League::count()); // 作成したリーグ
        $this->assertEquals(1, Season::count()); // 作成したシーズン

        // APIから取得する試合データを準備
        $fixtureData = $this->sampleFixturesApiData;
        $fixtureDto = FixtureDto::fromArray($fixtureData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        // 同期実行
        $result = $this->action->execute(2020);

        // 結果確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);

        // 新しいデータが追加されることを確認
        $this->assertEquals(0, $result['teams']); // 既に存在するチーム
        $this->assertEquals(0, $result['leagues']); // 既に存在するリーグ
        $this->assertEquals(0, $result['seasons']); // 既に存在するシーズン
        $this->assertEquals(1, $result['games']); // 新しい試合

        // データベース状態確認
        $this->assertEquals(2, Team::count()); // 既存のテストデータ
        $this->assertEquals(1, League::count()); // 既存のテストデータ
        $this->assertEquals(1, Season::count()); // 既存のテストデータ
        $this->assertEquals(1, Game::count()); // 新しく追加された試合

        // 新しく追加されたゲームデータを確認
        $newGame = Game::where('api_fixture_id', 215662)->first();
        $this->assertNotNull($newGame);
        $this->assertTrue($newGame->is_end);
        $this->assertFalse($newGame->is_details_fetched);
    }

    public function test_重複データは適切に処理される(): void
    {
        // 基本テストデータを作成
        $testData = $this->createBasicTestData();

        // 最初のゲームを作成
        $gameData = [
            'api_fixture_id'     => 215662,
            'home_team_id'       => $testData['homeTeam']->id,
            'away_team_id'       => $testData['awayTeam']->id,
            'season_id'          => $testData['season']->id,
            'league_id'          => $testData['league']->id,
            'started_at'         => '2020-02-06 14:00:00',
            'status'             => 'FT',
            'is_end'             => true,
            'is_details_fetched' => false,
            'score_json'         => json_encode(['home' => 0, 'away' => 1]),
        ];

        $existingGame = Game::create($gameData);

        // 同じapi_fixture_idを持つ重複データを作成
        $duplicateFixtureData = $this->sampleFixturesApiData;

        $fixtureDto = FixtureDto::fromArray($duplicateFixtureData);
        $fixturesListDto = new FixtureListDto(
            fixtures: collect([$fixtureDto, $fixtureDto]), // 同じデータを2回
        );

        $this->mockApiRepository
            ->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        $gameCountBefore = Game::count();

        // 同期実行
        $result = $this->action->execute(2020);

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
        // toUpsertDataが空の配列を返すようなモックを設定
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
            new GameTransformer,
            $mockTeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        $this->expectException(EmptyApiResponseException::class);
        $this->expectExceptionMessage('API応答にチームデータが含まれていません。');

        $action->execute(2020);
    }
}
