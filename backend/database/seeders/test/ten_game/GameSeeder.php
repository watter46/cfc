<?php

declare(strict_types = 1);

namespace Database\Seeders\test\ten_game;

use App\Repositories\Json\TenGamesJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GameSeeder extends Seeder
{
    public function __construct(private TenGamesJsonRepository $games)
    {

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('seasons')->insert($this->games->getSeasons());
        DB::table('leagues')->insert($this->games->getLeagues());
        DB::table('teams')->insert($this->games->getTeams());
        DB::table('games')->insert($this->games->getGames());
    }
}
