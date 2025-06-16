<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

abstract class AdminTestCase extends BaseTestCase
{
    use DatabaseTransactions;

    protected static $migrated = false;

    protected $seeder;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2024-11-11 00:00');

        if (! self::$migrated) {
            $this->artisan('migrate');

            self::$migrated = true;
        }

        if (! $this->seeder) {
            return;
        }

        $this->executeSeed($this->seeder);
    }

    public function executeSeed($seeder)
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 既存のテストデータをクリア
        $tables = ['game_players', 'games', 'players', 'teams', 'seasons'];
        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        if (is_string($seeder)) {
            $this->artisan('db:seed', ['--class' => $seeder]);

            return;
        }

        foreach ($seeder as $seed) {
            $this->artisan('db:seed', ['--class' => $seed]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
