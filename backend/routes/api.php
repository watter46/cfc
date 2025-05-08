<?php

declare(strict_types=1);

use App\Http\Controllers\User\AuthController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
});
