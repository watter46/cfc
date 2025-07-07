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
        Schema::create('player_seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->foreignId('season_id')->constrained()->onDelete('cascade');
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->date('joined_date')->nullable()->comment('加入日');
            $table->date('left_date')->nullable()->comment('退籍日');
            $table->boolean('completed_season')->default(true)->comment('シーズン完走判定');
            $table->timestamps();

            // 複合ユニーク制約
            $table->unique(['player_id', 'season_id', 'team_id']);

            // 個別のインデックスも追加
            $table->index('player_id');
            $table->index('season_id');
            $table->index('team_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_seasons');
    }
};
