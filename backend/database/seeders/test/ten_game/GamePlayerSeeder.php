<?php

declare(strict_types = 1);

namespace Database\Seeders\test\ten_game;

use App\Repositories\Json\TenGamesJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GamePlayerSeeder extends Seeder
{
    public function __construct(private TenGamesJsonRepository $repository)
    {

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('game_players')->insert($this->repository->get('test/ten_games', 'game_players'));
        DB::table('player_statistics')->insert($this->repository->get('test/ten_games', 'player_statistics'));
    }
}
