<?php

declare(strict_types=1);

namespace Tests\Feature\Guest;

use Database\Seeders\test\ten_game\GamePlayerSeeder;
use Database\Seeders\test\ten_game\GameSeeder;
use Database\Seeders\test\ten_game\PlayerSeeder;

final class FetchGamesTest extends GuestTestCase
{
    protected $seeder = [
        GameSeeder::class,
        PlayerSeeder::class,
        GamePlayerSeeder::class,
    ];

    /*
        現在時間 UTC 2024-11-11

        最新5件
        1208107 2024-10-27 Newcastle
        1310475 2024-10-30 Newcastle
        1208117 2024-11-03 Manchester United
        1299338 2024-11-07 FC Noah
        1208125 2024-11-10 Arsenal
    */
    public function test_最新の5件が取得できる()
    {
        $response = $this->getJson('/api');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'date',
                        'score',
                        'home',
                        'away',
                        'WinnerTeamId',
                        'isRateable',
                    ],
                ],
            ]);

        $this->assertSame('11/10', $response->json('data.0.date'));
        $this->assertSame('11/07', $response->json('data.1.date'));
        $this->assertSame('11/03', $response->json('data.2.date'));
        $this->assertSame('10/30', $response->json('data.3.date'));
        $this->assertSame('10/27', $response->json('data.4.date'));
    }

    public function test_試合が3日以内に行われたなら評価できる判定である()
    {
        $response = $this->getJson('/api');

        $this->assertTrue($response->json('data.0.isRateable'));
        $this->assertFalse($response->json('data.1.isRateable'));
        $this->assertFalse($response->json('data.2.isRateable'));
        $this->assertFalse($response->json('data.3.isRateable'));
        $this->assertFalse($response->json('data.4.isRateable'));
    }
}
