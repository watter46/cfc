<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->integer('api_fixture_id')->unique()->comment('API試合ID');
            $table->foreignId('home_team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('away_team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('winner_team_id')->nullable()->constrained('teams')->onDelete('set null');
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->foreignId('season_id')->constrained()->onDelete('cascade');
            $table->json('score')->nullable()->comment('スコア');
            $table->boolean('is_end')->default(false)->comment('試合終了判定');
            $table->boolean('is_details_fetched')->default(false)->comment('詳細データ取得済み判定');
            $table->datetime('started_at')->comment('試合開始日時');
            $table->datetime('finished_at')->nullable()->comment('推定試合終了日時');
            $table->timestamps();

            $table->index('started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
