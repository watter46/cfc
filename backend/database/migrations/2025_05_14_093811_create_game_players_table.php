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
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->boolean('is_starter')->default(false)->comment('先発判定');
            $table->string('grid')->nullable()->comment('ポジション配置場所');
            $table->string('position')->comment('ポジション');
            $table->integer('minutes_played')->default(0)->comment('出場時間');
            $table->integer('assists')->nullable()->default(0)->comment('アシスト数');
            $table->integer('goals')->nullable()->default(0)->comment('ゴール数');
            $table->float('api_rating')->nullable()->comment('APIレーティング');
            $table->float('avg_user_rating')->nullable()->comment('ユーザー全体の平均レーティング');
            $table->integer('user_rated_count')->default(0)->comment('ユーザー全体の評価数');
            $table->integer('is_mom')->default(false)->comment('ユーザー全体のMOM判定');
            $table->timestamps();

            // 同一試合で同一選手は1回のみ出場可能
            $table->unique(['game_id', 'player_id']);

            $table->index('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_players');
    }
};
