<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Repositories\Json\InsertJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlayerSeeder extends Seeder
{
    public function __construct(private InsertJsonRepository $repository)
    {

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('players')->insert($this->repository->getPlayers());
    }
}
