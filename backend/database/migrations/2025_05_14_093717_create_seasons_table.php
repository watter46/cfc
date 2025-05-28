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
        Schema::create('seasons', function (Blueprint $table) {
            $table->id();
            $table->date('start_date')->comment('シーズン開始日');
            $table->date('end_date')->comment('シーズン終了日');
            $table->integer('year')->unique()->comment('シーズン年');
            $table->boolean('is_current')->default(false)->comment('現在のシーズンか判定');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seasons');
    }
};
