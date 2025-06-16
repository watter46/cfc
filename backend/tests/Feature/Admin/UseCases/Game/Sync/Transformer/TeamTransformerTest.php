<?php

declare(strict_types=1);

namespace Tests\Feature\UseCases\Admin\Game\Sync\Transformer;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Transformer\TeamTransformer;
use Tests\TestCase;

final class TeamTransformerTest extends TestCase
{
    private TeamTransformer $transformer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transformer = new TeamTransformer;
    }

    public function test_upsert用データ変換で重複除去が機能する(): void
    {
        // 重複を含むTeamDTOを準備
        $teamDtos = [
            new TeamDto(id: 1, name: 'Manchester United', logo: 'logo1.png'),
            new TeamDto(id: 2, name: 'Liverpool', logo: 'logo2.png'),
            new TeamDto(id: 1, name: 'Manchester United', logo: 'logo1.png'), // 重複
            new TeamDto(id: 3, name: 'Chelsea', logo: 'logo3.png'),
            new TeamDto(id: 2, name: 'Liverpool FC', logo: 'logo2_updated.png'), // ID重複、データ更新
        ];

        $result = $this->transformer->transformToUpsertData($teamDtos);

        // 重複が除去され、3つのユニークなチームのみ残ることを確認
        $this->assertCount(3, $result);

        // 期待される構造を確認
        $expectedApiIds = [1, 2, 3];
        $actualApiIds = array_column($result, 'api_team_id');
        sort($actualApiIds);

        $this->assertEquals($expectedApiIds, $actualApiIds);

        // 各データの構造を確認
        foreach ($result as $teamData) {
            $this->assertArrayHasKey('api_team_id', $teamData);
            $this->assertArrayHasKey('name', $teamData);
            $this->assertArrayHasKey('logo_path', $teamData);
            $this->assertArrayHasKey('updated_at', $teamData);
        }
    }

    public function test_空配列を渡した場合空配列が返される(): void
    {
        $result = $this->transformer->transformToUpsertData([]);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function test_単一の_team_dt_oでも正常に変換される(): void
    {
        $teamDtos = [
            new TeamDto(id: 100, name: 'Arsenal', logo: 'arsenal.png'),
        ];

        $result = $this->transformer->transformToUpsertData($teamDtos);

        $this->assertCount(1, $result);
        $this->assertEquals(100, $result[0]['api_team_id']);
        $this->assertEquals('Arsenal', $result[0]['name']);
        $this->assertEquals('arsenal.png', $result[0]['logo_path']);
    }
}
