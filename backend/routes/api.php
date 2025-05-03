<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('games', function () {
    return response()->json([
        'games' => [
            ['id' => 1, 'name' => 'Match 1'],
            ['id' => 2, 'name' => 'Match 2'],
        ],
    ]);
});
