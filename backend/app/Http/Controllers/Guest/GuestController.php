<?php

declare(strict_types=1);

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Guest\LatestFinishedGamesCollection;
use App\Models\Game;
use App\UseCases\Admin\Game\Sync\SyncGameDetailAction;
use App\UseCases\Admin\Game\Sync\SyncGamesAction;
use App\UseCases\Guest\FetchLatestFinishedGames;

final class GuestController extends ApiController
{
    public function index(FetchLatestFinishedGames $fetchLatestFinishedGames)
    {
        return new LatestFinishedGamesCollection($fetchLatestFinishedGames());
    }

    public function dev(SyncGamesAction $syncGamesAction)
    {
        $syncGamesAction->execute(2024);

        return response()->json(['message' => 'Games sync completed']);
    }

    public function find(SyncGameDetailAction $syncGameDetail)
    {
        $apiFixtureId = Game::first()->api_fixture_id;

        $syncGameDetail->execute($apiFixtureId);

        return response()->json(['message' => 'Game detail sync completed']);
    }
}
