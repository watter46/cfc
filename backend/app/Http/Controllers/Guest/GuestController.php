<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Guest\LatestGamesCollection;
use App\Models\Game;
use App\Repositories\Json\TenGamesJsonRepository;
use App\UseCases\Admin\Game\Sync\SyncGameAction;
use App\UseCases\Admin\Game\Sync\SyncGamesAction;
use App\UseCases\Guest\FetchLatestGames;

class GuestController extends ApiController
{
    public function index(FetchLatestGames $fetchLatestGames)
    {
        return new LatestGamesCollection($fetchLatestGames());
    }

    public function dev2(SyncGamesAction $syncGamesAction)
    {
        $syncGamesAction(2024);
    }

    public function dev(SyncGameAction $syncGameAction)
    {
        $id = Game::first()->id;

        $syncGameAction($id);
    }

    public function dev3(SyncGameAction $syncGameAction, TenGamesJsonRepository $j)
    {
        // 1208347

        // Game::pluck('id')->each(function ($id) use ($syncGameAction) {
        //     $syncGameAction($id);
        // });

        // insert用のデータを作成する
        // $j->saveAll();
        // dd($j->getGames());
    }
}
