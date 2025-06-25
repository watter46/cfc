<?php

declare(strict_types=1);

use App\Http\Controllers\Guest\GuestController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GuestController::class, 'index']);
Route::get('/dev', [GuestController::class, 'dev']);
Route::get('/find', [GuestController::class, 'find']);

// 認証不要なルート
Route::prefix('user/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('user/auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
    
    // マッチ関連のルート
    Route::get('/matches', function () {
        return response()->json(['message' => 'success2']);
    });
});
