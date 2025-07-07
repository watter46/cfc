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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('ulid')->unique();
            $table->string('name')->comment('ユーザー名');
            $table->string('email')->unique()->comment('メールアドレス');
            $table->timestamp('email_verified_at')->nullable()->comment('メールアドレス確認日時');
            $table->string('password')->nullable()->comment('パスワード');
            $table->string('remember_token')->nullable()->comment('リメンバートークン');
            $table->string('role')->default('user')->comment('ユーザー権限');
            $table->string('provider')->nullable()->comment('プロバイダー');
            $table->string('provider_id')->nullable()->comment('プロバイダーID');
            $table->text('two_factor_secret')->nullable()->comment('Admin: 2段階認証シークレット');
            $table->boolean('two_factor_enabled')->default(false)->comment('Admin: 2段階認証有効化');
            $table->timestamps();

            $table->index(['provider', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
