<?php

declare(strict_types = 1);

use App\Http\Controllers\Guest\GuestController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GuestController::class, 'index'])->name('top');
Route::get('/dev', [GuestController::class, 'dev']);
Route::get('/dev2', [GuestController::class, 'dev2']);
Route::get('/dev3', [GuestController::class, 'dev3']);

Route::middleware('auth:sanctum')->group(function () {

});
