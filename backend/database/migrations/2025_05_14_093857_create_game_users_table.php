<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->foreignId('season_id')->constrained()->onDelete('cascade')->comment('シーズンID');
            $table->integer('mom_count')->default(0)->comment('残りMOM評価可能数');
            $table->foreignId('mom_game_player_id')->nullable()->constrained('game_players')->onDelete('set null');
            $table->boolean('is_rated')->default(false)->comment('評価済み判定');
            $table->timestamps();

            // 1ユーザーが1試合に対して持つレコードは1つのみ
            $table->unique(['user_id', 'game_id']);
            
            // シーズン検索用インデックス
            $table->index('season_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_users');
    }
};
