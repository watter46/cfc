<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

final class ApiLogServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // APIエラーをログに記録するためのマクロを定義
        Log::macro('apiError', function (string $message, array $context = []) {
            Log::channel('api_error')->error($message, $context);
        });

        // API情報をログに記録するためのマクロを定義
        Log::macro('apiInfo', function (string $message, array $context = []) {
            Log::channel('api')->info($message, $context);
        });

        // APIデバッグ情報をログに記録するためのマクロを定義
        Log::macro('apiDebug', function (string $message, array $context = []) {
            Log::channel('api')->debug($message, $context);
        });

        // APIリクエスト/レスポンス情報をログに記録するためのマクロを定義
        Log::macro('apiRequest', function (string $message, array $context = []) {
            Log::channel('api_request')->info($message, $context);
        });
    }
}
