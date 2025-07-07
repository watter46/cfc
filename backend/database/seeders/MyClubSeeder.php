<?php

namespace Database\Seeders;

use App\Repositories\Json\InsertJsonRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MyClubSeeder extends Seeder
{
    public function __construct(private InsertJsonRepository $repository)
    {
        //
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('my_clubs')->insert($this->repository->getMyClubs());
    }
}
