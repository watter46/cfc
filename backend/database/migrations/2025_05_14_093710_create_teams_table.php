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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->integer('api_team_id')->unique()->comment('APIチームID');
            $table->string('name')->comment('チーム名');
            $table->string('logo_path')->nullable()->comment('チームロゴパス');
            $table->boolean('has_image')->default(false)->comment('画像が設定されているか判定');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
