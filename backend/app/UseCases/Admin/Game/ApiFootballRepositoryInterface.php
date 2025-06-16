<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;

interface ApiFootballRepositoryInterface
{
    /**
     * 指定されたシーズンの試合一覧をAPIから取得する
     *
     * @param  int  $season  試合一覧を取得するシーズン年
     * @return FixtureListDto 指定されたシーズンの試合一覧レスポンス
     */
    public function fetchFixtures(int $season): FixtureListDto;

    /**
     * 指定されたAPIの試合IDに対応する試合詳細を取得する
     *
     * @param  int  $apiFixtureId  APIの試合ID
     * @return FixtureDetailDto 試合詳細情報
     */
    public function fetchFixtureDetail(int $apiFixtureId): FixtureDetailDto;

    /**
     * 指定されたAPIリーグIDに対応するリーグ画像を取得する
     *
     * @param  int  $apiLeagueId  APIのリーグID
     * @return string 取得したリーグ画像のバイナリデータ
     */
    public function fetchLeagueImage(int $apiLeagueId): string;

    /**
     * 指定されたAPIチームIDに対応するチーム画像を取得する
     *
     * @param  int  $apiTeamId  APIのチームID
     * @return string 取得したチーム画像のバイナリデータ
     */
    public function fetchTeamImage(int $apiTeamId): string;
}
