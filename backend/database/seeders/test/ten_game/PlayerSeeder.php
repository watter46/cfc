<?php

declare(strict_types=1);

namespace Database\Seeders\test\ten_game;

use App\Repositories\Json\TenGamesJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

final class PlayerSeeder extends Seeder
{
    public function __construct(private TenGamesJsonRepository $repository) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('players')->insert($this->repository->get('test/ten_games', 'players'));
    }
}
