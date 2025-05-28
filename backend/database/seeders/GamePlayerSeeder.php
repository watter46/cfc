<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Repositories\Json\InsertJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GamePlayerSeeder extends Seeder
{
    public function __construct(private InsertJsonRepository $repository)
    {

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('game_players')->insert($this->repository->get('insert', 'game_players'));
        DB::table('player_statistics')->insert($this->repository->get('insert', 'player_statistics'));
    }
}
