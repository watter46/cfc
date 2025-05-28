<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Repositories\Json\InsertJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GameSeeder extends Seeder
{
    public function __construct(private InsertJsonRepository $repository)
    {

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('seasons')->insert($this->repository->getSeasons());
        DB::table('leagues')->insert($this->repository->getLeagues());
        DB::table('teams')->insert($this->repository->getTeams());
        DB::table('games')->insert($this->repository->getGames());
    }
}
