<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('user/auth')->group(function () {
    // ソーシャルログイン - リダイレクト
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->where('provider', 'google|x');

    // ソーシャルログイン - コールバック
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->where('provider', 'google|x');
});
