<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Guest\GuestController;
use App\Http\Controllers\User\GameController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GuestController::class, 'index']);
Route::get('/dev', [GuestController::class, 'dev']);
Route::get('/find', [GuestController::class, 'find']);

// 認証不要なルート
Route::prefix('user/auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/signin', [AuthController::class, 'signin']);
});

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('user/auth')->group(function () {
        Route::post('/signout', [AuthController::class, 'signout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // ゲーム関連のルート
    Route::get('/matches', [GameController::class, 'index']);
    Route::get('/matches/{id}', [GameController::class, 'show']);
});
