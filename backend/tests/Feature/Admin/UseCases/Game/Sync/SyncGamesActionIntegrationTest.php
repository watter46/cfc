<?php

declare(strict_types=1);

namespace Tests\Feature\UseCases\Admin\Game\Sync;

use App\Models\Game;
use App\Models\League;
use App\Models\Season;
use App\Models\Team;
use App\UseCases\Admin\Game\Sync\SyncGamesAction;
use App\UseCases\Admin\Game\Sync\Transformer\GameTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\LeagueTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\SeasonTransformer;
use App\UseCases\Admin\Game\Sync\Transformer\TeamTransformer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use ReflectionClass;
use Tests\TestCase;

/**
 * SyncGamesActionの統合テスト
 * より複雑なシナリオと実際のAPIデータ形式を使用
 */
final class SyncGamesActionIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private GameTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->transformer = new GameTransformer(
            new TeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );
    }

    public function test_複数のフィクスチャデータを一括同期できる(): void
    {
        // 複数の試合データを含むサンプル
        $multipleFixturesData = [
            [
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
            ],
            [
                'fixture' => [
                    'id'        => 215663,
                    'referee'   => 'A. Taylor',
                    'timezone'  => 'UTC',
                    'date'      => '2020-02-08T17:30:00+00:00',
                    'timestamp' => 1581181800,
                    'venue'     => [
                        'id'   => 508,
                        'name' => 'Stamford Bridge',
                        'city' => 'London',
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
                        'id'   => 49,
                        'name' => 'Chelsea',
                        'logo' => 'https://media.api-sports.io/football/teams/49.png',
                    ],
                    'away' => [
                        'id'   => 33,
                        'name' => 'Manchester United',
                        'logo' => 'https://media.api-sports.io/football/teams/33.png',
                    ],
                ],
                'goals' => [
                    'home' => 2,
                    'away' => 0,
                ],
                'score' => [
                    'halftime' => [
                        'home' => 1,
                        'away' => 0,
                    ],
                    'fulltime' => [
                        'home' => 2,
                        'away' => 0,
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
            ],
        ];

        // DTOに変換
        $fixtureDtos = [];
        foreach ($multipleFixturesData as $fixtureData) {
            $fixtureDtos[] = \App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto::fromArray($fixtureData);
        }

        // 同期前の状態確認
        $this->assertEquals(0, Team::count());
        $this->assertEquals(0, League::count());
        $this->assertEquals(0, Season::count());
        $this->assertEquals(0, Game::count());

        // 同期実行
        $result = $this->callPrivateExecute($fixtureDtos);

        // 結果確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);

        // データベース状態確認
        $this->assertEquals(3, Team::count()); // Manchester United, Leicester City, Chelsea
        $this->assertEquals(1, League::count()); // Premier League
        $this->assertEquals(1, Season::count()); // 2020シーズン
        $this->assertEquals(2, Game::count()); // 2試合

        // 個別データ確認
        $manchesterUnited = Team::where('api_team_id', 33)->first();
        $leicesterCity = Team::where('api_team_id', 34)->first();
        $chelsea = Team::where('api_team_id', 49)->first();

        $this->assertNotNull($manchesterUnited);
        $this->assertNotNull($leicesterCity);
        $this->assertNotNull($chelsea);

        // 試合1: Manchester United vs Leicester City
        $game1 = Game::where('api_fixture_id', 215662)->first();
        $this->assertNotNull($game1);
        $this->assertEquals($manchesterUnited->id, $game1->home_team_id);
        $this->assertEquals($leicesterCity->id, $game1->away_team_id);
        $this->assertEquals($leicesterCity->id, $game1->winner_team_id); // Leicester勝利

        // 試合2: Chelsea vs Manchester United
        $game2 = Game::where('api_fixture_id', 215663)->first();
        $this->assertNotNull($game2);
        $this->assertEquals($chelsea->id, $game2->home_team_id);
        $this->assertEquals($manchesterUnited->id, $game2->away_team_id);
        $this->assertEquals($chelsea->id, $game2->winner_team_id); // Chelsea勝利
    }

    public function test_同じチームが複数の試合に出場する場合重複しない(): void
    {
        // Manchester Unitedが複数試合に出場するケース
        $gamesWithSameTeam = [
            [
                'fixture' => [
                    'id'        => 215664,
                    'referee'   => 'M. Oliver',
                    'timezone'  => 'UTC',
                    'date'      => '2020-02-06T14:00:00+00:00',
                    'timestamp' => 1580994000,
                    'venue'     => null,
                    'status'    => [
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
                        'id'   => 40,
                        'name' => 'Liverpool',
                        'logo' => 'https://media.api-sports.io/football/teams/40.png',
                    ],
                ],
                'goals' => [
                    'home' => 1,
                    'away' => 1,
                ],
                'score' => [
                    'halftime' => [
                        'home' => 1,
                        'away' => 0,
                    ],
                    'fulltime' => [
                        'home' => 1,
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
            ],
            [
                'fixture' => [
                    'id'        => 215665,
                    'referee'   => 'A. Taylor',
                    'timezone'  => 'UTC',
                    'date'      => '2020-02-08T17:30:00+00:00',
                    'timestamp' => 1581181800,
                    'venue'     => null,
                    'status'    => [
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
                    'round'   => 'Regular Season - 26',
                ],
                'teams' => [
                    'home' => [
                        'id'   => 40,
                        'name' => 'Liverpool',
                        'logo' => 'https://media.api-sports.io/football/teams/40.png',
                    ],
                    'away' => [
                        'id'   => 33,
                        'name' => 'Manchester United',
                        'logo' => 'https://media.api-sports.io/football/teams/33.png',
                    ],
                ],
                'goals' => [
                    'home' => 2,
                    'away' => 0,
                ],
                'score' => [
                    'halftime' => [
                        'home' => 1,
                        'away' => 0,
                    ],
                    'fulltime' => [
                        'home' => 2,
                        'away' => 0,
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
            ],
        ];

        // DTOに変換
        $fixtureDtos = [];
        foreach ($gamesWithSameTeam as $fixtureData) {
            $fixtureDtos[] = \App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto::fromArray($fixtureData);
        }

        // 同期実行
        $result = $this->callPrivateExecute($fixtureDtos);

        // チームが重複せずに2件のみ保存されることを確認
        $this->assertEquals(2, Team::count()); // Manchester United, Liverpool
        $this->assertEquals(1, League::count()); // Premier League
        $this->assertEquals(1, Season::count()); // 2020シーズン
        $this->assertEquals(2, Game::count()); // 2試合

        // Manchester Unitedが1件のみ存在することを確認
        $manchesterUnitedTeams = Team::where('api_team_id', 33)->get();
        $this->assertEquals(1, $manchesterUnitedTeams->count());

        // 両試合でManchestrr Unitedが参照されることを確認
        $game1 = Game::where('api_fixture_id', 215664)->first();
        $game2 = Game::where('api_fixture_id', 215665)->first();
        $manchesterUnited = $manchesterUnitedTeams->first();

        $this->assertEquals($manchesterUnited->id, $game1->home_team_id);
        $this->assertEquals($manchesterUnited->id, $game2->away_team_id);
    }

    /**
     * プライベートメソッドexecuteを呼び出すヘルパー
     */
    private function callPrivateExecute(array $fixtureDtos): array
    {
        // SyncGamesActionインスタンスの作成（リアルなインスタンス作成は複雑なのでモックAPIRepositoryで対処）
        $mockApiRepository = Mockery::mock(\App\UseCases\Admin\Game\ApiFootballRepositoryInterface::class);

        // FixtureListDtoを作成
        $fixturesListDto = new \App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto(
            fixtures: collect($fixtureDtos),
        );

        // APIリポジトリのモック設定
        $mockApiRepository->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        $action = new SyncGamesAction(
            $mockApiRepository,
            $this->transformer,
            new TeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        // Reflectionを使用してprivateメソッドにアクセス
        $reflection = new ReflectionClass($action);
        $method = $reflection->getMethod('execute');
        $method->setAccessible(true);

        return $method->invokeArgs($action, [2020]);
    }
}
