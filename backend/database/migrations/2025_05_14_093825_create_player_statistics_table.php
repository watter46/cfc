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
        Schema::create('player_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_player_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('shots_total')->nullable()->default(0)->comment('合計シュート数');
            $table->integer('shots_on_target')->nullable()->default(0)->comment('枠内シュート数');
            $table->integer('passes_total')->nullable()->default(0)->comment('パス数');
            $table->float('passes_accuracy')->nullable()->default(0)->comment('パス精度');
            $table->integer('key_passes')->nullable()->default(0)->comment('キーパス数');
            $table->integer('tackles')->nullable()->default(0)->comment('タックル数');
            $table->integer('blocks')->nullable()->default(0)->comment('ブロック数');
            $table->integer('interceptions')->nullable()->default(0)->comment('インターセプト数');
            $table->integer('duels_won')->nullable()->default(0)->comment('デュエル勝利数');
            $table->integer('duels_total')->nullable()->default(0)->comment('デュエル数');
            $table->integer('dribbles_success')->nullable()->default(0)->comment('ドリブル成功数');
            $table->integer('dribbles_attempts')->nullable()->default(0)->comment('ドリブル数');
            $table->integer('fouls_committed')->nullable()->default(0)->comment('ファール数');
            $table->integer('fouls_drawn')->nullable()->default(0)->comment('ファール数');
            $table->integer('yellow_cards')->nullable()->default(0)->comment('イエローカード数');
            $table->integer('red_cards')->nullable()->default(0)->comment('レッドカード数');
            $table->integer('saves')->nullable()->default(0)->comment('ゴールキーパー用: セーブ数');
            $table->integer('goals_conceded')->nullable()->default(0)->comment('ゴールキーパー用: 失点数');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_statistics');
    }
};
