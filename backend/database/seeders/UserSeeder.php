<?php

namespace Database\Seeders;

use App\Models\User;
use App\Repositories\Json\InsertJsonRepository;
use App\Traits\Loggable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    use Loggable;
    
    public function __construct(private InsertJsonRepository $repository)
    {
        //
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            "ulid" => Str::ulid()->toBase32(),
            "name" => "テストユーザー",
            "email" => "test@gmail.com",
            "password" => bcrypt("testtest"),
        ]);

        // ソーシャルログインユーザーの追加
        User::create([
            'ulid' => Str::ulid()->toBase32(),
            'name' => 'wata',
            'email' => 'w.aoki.14@gmail.com',
            'email_verified_at' => null,
            'password' => null,
            'remember_token' => null,
            'role' => 'user',
            'provider' => 'google',
            'provider_id' => '101301578742379021949',
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);
    }
}
