<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Game\FetchGamesRequest;
use App\Http\Requests\User\Game\FindGameRequest;
use App\Http\Resources\User\FetchGamesCollection;
use App\Http\Resources\User\FindGameResource;
use App\UseCases\User\Game\Fetch\FetchGamesAction;
use App\UseCases\User\Game\Fetch\FetchGameSelectorsAction;
use App\UseCases\User\Game\Fetch\FindGameAction;

/**
 * ユーザー向けゲーム関連のコントローラー
 *
 * ユーザー向けのゲーム情報取得APIエンドポイントを提供します。
 */
final class GameController extends Controller
{
    public function __construct(
        private readonly FetchGamesAction $fetchGames,
        private readonly FetchGameSelectorsAction $fetchGameSelectors,
        private readonly FindGameAction $findGame,
    ) {}

    /**
     * ゲーム一覧取得
     *
     * @param  FetchGamesRequest  $request  バリデーション済みリクエスト
     * @return FetchGamesCollection ゲーム一覧のリソースコレクション
     */
    public function index(FetchGamesRequest $request): FetchGamesCollection
    {
        $games = $this->fetchGames->execute($request->inputData());

        return (new FetchGamesCollection($games))
            ->additional($this->fetchGameSelectors->execute($request->inputData()))
            ->setMessage('試合一覧を取得しました');
    }

    /**
     * 試合詳細取得
     *
     * @param  FindGameRequest  $request  バリデーション済みリクエスト
     * @return FindGameResource 試合詳細のリソース
     */
    public function show(FindGameRequest $request): FindGameResource
    {
        $game = $this->findGame->execute($request->inputData());

        return (new FindGameResource($game))
            ->setMessage('試合詳細を取得しました');
    }
}
