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
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('game_player_id')->constrained()->onDelete('cascade');
            $table->float('rating')->comment('レーティング');
            $table->integer('rate_count')->default(1)->comment('残り評価可能数');
            $table->boolean('is_mom')->default(false)->comment('MOM判定');
            $table->timestamps();

            // 1ユーザーが同一試合の同一選手を評価するのは1レコードのみ
            $table->unique(['user_id', 'game_player_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
