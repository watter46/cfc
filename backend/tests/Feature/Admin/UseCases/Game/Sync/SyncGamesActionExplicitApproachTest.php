<?php

declare(strict_types=1);

namespace Tests\Feature\UseCases\Admin\Game\Sync;

use App\Models\Game;
use App\Models\League;
use App\Models\Season;
use App\Models\Team;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
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
 * SyncGamesActionの明示的アプローチテスト
 * transformAndSaveメソッドの動作を直接確認
 */
final class SyncGamesActionExplicitApproachTest extends TestCase
{
    use RefreshDatabase;

    public function test_明示的アプローチでデータ同期が正常に動作する(): void
    {
        // テスト用のフィクスチャデータ
        $fixtureData = [
            'fixture' => [
                'id'        => 888999,
                'referee'   => 'Test Referee',
                'timezone'  => 'UTC',
                'date'      => '2023-12-01T15:00:00+00:00',
                'timestamp' => 1701435600,
                'venue'     => [
                    'id'   => 999,
                    'name' => 'Test Stadium',
                    'city' => 'Test City',
                ],
                'status' => [
                    'long'    => 'Match Finished',
                    'short'   => 'FT',
                    'elapsed' => 90,
                ],
            ],
            'league' => [
                'id'      => 888,
                'name'    => 'Test League',
                'country' => 'Test Country',
                'logo'    => 'https://example.com/league.png',
                'flag'    => 'https://example.com/flag.png',
                'season'  => 2023,
                'round'   => 'Test Round - 1',
            ],
            'teams' => [
                'home' => [
                    'id'   => 777,
                    'name' => 'Test Home Team',
                    'logo' => 'https://example.com/home.png',
                ],
                'away' => [
                    'id'   => 666,
                    'name' => 'Test Away Team',
                    'logo' => 'https://example.com/away.png',
                ],
            ],
            'goals' => [
                'home' => 2,
                'away' => 1,
            ],
            'score' => [
                'halftime' => [
                    'home' => 1,
                    'away' => 1,
                ],
                'fulltime' => [
                    'home' => 2,
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

        // DTOに変換
        $fixtureDto = FixtureDto::fromArray($fixtureData);

        // SyncGamesActionのインスタンスを作成（APIRepositoryはモック不要）
        $mockApiRepository = Mockery::mock(\App\UseCases\Admin\Game\ApiFootballRepositoryInterface::class);

        // FixtureListDtoを作成
        $fixturesListDto = new \App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto(
            fixtures: collect([$fixtureDto]),
        );

        // APIリポジトリのモック設定
        $mockApiRepository->shouldReceive('fetchFixtures')
            ->with(2020)
            ->once()
            ->andReturn($fixturesListDto);

        $action = new SyncGamesAction(
            $mockApiRepository,
            new GameTransformer(
                new TeamTransformer,
                new LeagueTransformer,
                new SeasonTransformer,
            ),
            new TeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        // Reflectionを使用してprivateメソッドにアクセス
        $reflection = new ReflectionClass($action);
        $method = $reflection->getMethod('execute');
        $method->setAccessible(true);

        // 同期前の状態確認
        $this->assertEquals(0, Team::count());
        $this->assertEquals(0, League::count());
        $this->assertEquals(0, Season::count());
        $this->assertEquals(0, Game::count());

        // 【アプローチ1】 明示的な3ステップ同期を実行
        $result = $method->invokeArgs($action, [2020]);

        // === 結果検証 ===

        // 1. 戻り値の構造確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('teams', $result);
        $this->assertArrayHasKey('leagues', $result);
        $this->assertArrayHasKey('seasons', $result);
        $this->assertArrayHasKey('games', $result);

        // 2. 各エンティティの更新数確認
        $this->assertEquals(2, $result['teams']);     // ホーム・アウェイ2チーム
        $this->assertEquals(1, $result['leagues']);   // 1リーグ
        $this->assertEquals(1, $result['seasons']);   // 1シーズン
        $this->assertEquals(1, $result['games']);     // 1試合

        // 3. データベース状態確認
        $this->assertEquals(2, Team::count());
        $this->assertEquals(1, League::count());
        $this->assertEquals(1, Season::count());
        $this->assertEquals(1, Game::count());

        // 4. 個別データ詳細確認

        // チームデータ確認
        $homeTeam = Team::where('api_team_id', 777)->first();
        $awayTeam = Team::where('api_team_id', 666)->first();

        $this->assertNotNull($homeTeam);
        $this->assertNotNull($awayTeam);
        $this->assertEquals('Test Home Team', $homeTeam->name);
        $this->assertEquals('Test Away Team', $awayTeam->name);
        $this->assertEquals('https://example.com/home.png', $homeTeam->logo_path);
        $this->assertEquals('https://example.com/away.png', $awayTeam->logo_path);

        // リーグデータ確認
        $league = League::where('api_league_id', 888)->first();
        $this->assertNotNull($league);
        $this->assertEquals('Test League', $league->name);
        $this->assertEquals('https://example.com/league.png', $league->logo_path);

        // シーズンデータ確認
        $season = Season::where('year', 2023)->first();
        $this->assertNotNull($season);

        // ゲームデータ確認
        $game = Game::where('api_fixture_id', 888999)->first();
        $this->assertNotNull($game);
        $this->assertEquals($homeTeam->id, $game->home_team_id);
        $this->assertEquals($awayTeam->id, $game->away_team_id);
        $this->assertEquals($homeTeam->id, $game->winner_team_id); // ホーム勝利
        $this->assertEquals($league->id, $game->league_id);
        $this->assertEquals($season->id, $game->season_id);
        $this->assertTrue($game->is_end);
        $this->assertFalse($game->is_details_fetched);

        // スコアデータ確認（JSON形式で保存されている）
        $this->assertNotNull($game->score);
        if (is_string($game->score)) {
            $scoreData = json_decode($game->score, true);
            $this->assertIsArray($scoreData);
            $this->assertEquals(2, $scoreData['home']);
            $this->assertEquals(1, $scoreData['away']);
            $this->assertEquals(1, $scoreData['halftime']['home']);
            $this->assertEquals(1, $scoreData['halftime']['away']);
        } else {
            // Collectionの場合の処理
            $this->assertEquals(2, $game->score['home']);
            $this->assertEquals(1, $game->score['away']);
        }
    }

    public function test_重複データの除去が正常に機能する(): void
    {
        // 同じチームが登場する2つの試合データ
        $fixture1Data = [
            'fixture' => [
                'id'        => 100001,
                'referee'   => 'Referee A',
                'timezone'  => 'UTC',
                'date'      => '2023-12-01T15:00:00+00:00',
                'timestamp' => 1701435600,
                'venue'     => null,
                'status'    => [
                    'long'    => 'Match Finished',
                    'short'   => 'FT',
                    'elapsed' => 90,
                ],
            ],
            'league' => [
                'id'      => 555,
                'name'    => 'Duplicate Test League',
                'country' => 'Test',
                'logo'    => 'https://example.com/league.png',
                'flag'    => 'https://example.com/flag.png',
                'season'  => 2023,
                'round'   => 'Round 1',
            ],
            'teams' => [
                'home' => [
                    'id'   => 111,
                    'name' => 'Common Team A',
                    'logo' => 'https://example.com/a.png',
                ],
                'away' => [
                    'id'   => 222,
                    'name' => 'Common Team B',
                    'logo' => 'https://example.com/b.png',
                ],
            ],
            'goals' => ['home' => 1, 'away' => 0],
            'score' => [
                'halftime'  => ['home' => 0, 'away' => 0],
                'fulltime'  => ['home' => 1, 'away' => 0],
                'extratime' => ['home' => null, 'away' => null],
                'penalty'   => ['home' => null, 'away' => null],
            ],
        ];

        $fixture2Data = [
            'fixture' => [
                'id'        => 100002,
                'referee'   => 'Referee B',
                'timezone'  => 'UTC',
                'date'      => '2023-12-08T15:00:00+00:00',
                'timestamp' => 1702040400,
                'venue'     => null,
                'status'    => [
                    'long'    => 'Match Finished',
                    'short'   => 'FT',
                    'elapsed' => 90,
                ],
            ],
            'league' => [
                'id'      => 555, // 同じリーグ
                'name'    => 'Duplicate Test League',
                'country' => 'Test',
                'logo'    => 'https://example.com/league.png',
                'flag'    => 'https://example.com/flag.png',
                'season'  => 2023, // 同じシーズン
                'round'   => 'Round 2',
            ],
            'teams' => [
                'home' => [
                    'id'   => 222, // 同じチーム（今度はホーム）
                    'name' => 'Common Team B',
                    'logo' => 'https://example.com/b.png',
                ],
                'away' => [
                    'id'   => 111, // 同じチーム（今度はアウェイ）
                    'name' => 'Common Team A',
                    'logo' => 'https://example.com/a.png',
                ],
            ],
            'goals' => ['home' => 2, 'away' => 1],
            'score' => [
                'halftime'  => ['home' => 1, 'away' => 1],
                'fulltime'  => ['home' => 2, 'away' => 1],
                'extratime' => ['home' => null, 'away' => null],
                'penalty'   => ['home' => null, 'away' => null],
            ],
        ];

        // DTOに変換
        $fixtureDtos = [
            FixtureDto::fromArray($fixture1Data),
            FixtureDto::fromArray($fixture2Data),
        ];

        // SyncGamesActionのインスタンスを作成
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
            new GameTransformer(
                new TeamTransformer,
                new LeagueTransformer,
                new SeasonTransformer,
            ),
            new TeamTransformer,
            new LeagueTransformer,
            new SeasonTransformer,
        );

        // privateメソッドを実行
        $reflection = new ReflectionClass($action);
        $method = $reflection->getMethod('execute');
        $method->setAccessible(true);

        // 同期実行
        $result = $method->invokeArgs($action, [2020]);

        // === 重複除去の確認 ===

        // 1. チーム数は2つ（重複除去されている）
        $this->assertEquals(2, Team::count());
        $this->assertEquals(2, $result['teams']);

        // 2. リーグ数は1つ（重複除去されている）
        $this->assertEquals(1, League::count());
        $this->assertEquals(1, $result['leagues']);

        // 3. シーズン数は1つ（重複除去されている）
        $this->assertEquals(1, Season::count());
        $this->assertEquals(1, $result['seasons']);

        // 4. 試合数は2つ（異なるfixture_idなので重複ではない）
        $this->assertEquals(2, Game::count());
        $this->assertEquals(2, $result['games']);

        // 5. 同じチームが両方の試合で使用されていることを確認
        $teamA = Team::where('api_team_id', 111)->first();
        $teamB = Team::where('api_team_id', 222)->first();

        $game1 = Game::where('api_fixture_id', 100001)->first();
        $game2 = Game::where('api_fixture_id', 100002)->first();

        // 試合1: A(ホーム) vs B(アウェイ)
        $this->assertEquals($teamA->id, $game1->home_team_id);
        $this->assertEquals($teamB->id, $game1->away_team_id);
        $this->assertEquals($teamA->id, $game1->winner_team_id);

        // 試合2: B(ホーム) vs A(アウェイ)
        $this->assertEquals($teamB->id, $game2->home_team_id);
        $this->assertEquals($teamA->id, $game2->away_team_id);
        $this->assertEquals($teamB->id, $game2->winner_team_id);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
