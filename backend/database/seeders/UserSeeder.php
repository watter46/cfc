<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // test@gmail.com password:testtestでユーザーを作成
        User::factory()->create([
            'email'    => 'test@gmail.com',
            'password' => bcrypt('testtest'),
        ]);
    }
}
