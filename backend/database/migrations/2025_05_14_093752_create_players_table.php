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
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->foreignId('season_id')->constrained()->onDelete('cascade');
            $table->string('name')->comment('選手名');
            $table->string('name_plain')->comment('選手名（アクセント無し）');
            $table->string('position')->nullable()->comment('ポジション');
            $table->integer('number')->nullable()->comment('背番号');
            $table->integer('api_player_id')->comment('ApiFootballの選手ID');
            $table->string('flash_id')->nullable()->comment('FlashLiveSportsの選手ID');
            $table->string('flash_image_id')->nullable()->comment('FlashLiveSports選手画像ID');
            $table->string('image_path')->nullable()->comment('選手画像パス');
            $table->boolean('is_active')->default(true)->comment('所属判定');
            $table->boolean('is_fetched')->default(false)->comment('画像データ取得済み判定');
            $table->boolean('has_image')->default(false)->comment('ストレージに画像がある判定');
            $table->timestamps();

            $table->unique(['api_player_id', 'team_id', 'season_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
