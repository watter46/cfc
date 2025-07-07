<?php

declare(strict_types=1);

namespace App\UseCases\User\Game\Services;

use App\Models\League;
use App\Models\MyClub;
use App\Models\Season;
use App\Models\User;
use Exception;
use Illuminate\Support\Collection;

/**
 * ゲームフィルタリング解決サービス
 *
 * リクエストデータからシーズン、リーグ、チームのIDを解決し、
 * フィルタリング用のセレクターリストを提供します。
 */
class GameFilterResolver
{
    /**
     * inputDataからシーズン、リーグ、チームのIDを解決する
     *
     * @param  array  $inputData  リクエストデータ
     * @return array 解決されたID配列
     */
    public function resolve(array $inputData): array
    {
        [
            'user'   => $user,
            'season' => $year,
            'league' => $leagueId,
            'team'   => $teamId,
        ] = $inputData;

        /** @var User $user */
        $user->load(['myClubs:id,user_id,team_id,is_primary']);

        // 1. シーズンIDを解決
        $resolvedSeasonId = $this->resolveSeasonId($year);

        // 2. チームIDを解決
        $resolvedTeamId = $this->resolveTeamId($user, $teamId);

        // 3. リーグIDを解決
        $resolvedLeagueId = $this->resolveLeagueId($resolvedSeasonId, $resolvedTeamId, $leagueId);

        return [
            'seasonId' => $resolvedSeasonId,
            'teamId'   => $resolvedTeamId,
            'leagueId' => $resolvedLeagueId,
        ];
    }

    /**
     * セレクターリストを解決する
     *
     * @param  array  $inputData  リクエストデータ
     * @return array セレクターリスト
     */
    public function resolveSelectors(array $inputData): array
    {
        [
            'user'   => $user,
            'team'   => $teamId,
            'season' => $year,
        ] = $inputData;

        /** @var User $user */
        $user->load([
            'myClubs:id,user_id,team_id,is_primary',
            'myClubs.team:id,name,logo_path',
        ]);

        // シーズン一覧を取得
        $seasons = $this->getSeasons();

        // ユーザーのマイクラブ一覧を取得
        $myClubs = $this->getMyClubs($user);

        // リーグ一覧を取得
        $leagues = $this->getLeagues($this->resolveSeasonId($year), $this->resolveTeamId($user, $teamId));

        return [
            'selectors' => [
                'seasons'  => $seasons,
                'my_clubs' => $myClubs,
                'leagues'  => $leagues,
            ],
            'selected' => [
                'season_id' => $this->resolveSeasonId($year),
                'team_id'   => $this->resolveTeamId($user, $teamId),
                'league_id' => $this->resolveLeagueId($this->resolveSeasonId($year), $this->resolveTeamId($user, $teamId), $inputData['league'] ?? null),
            ],
        ];
    }

    /**
     * シーズンIDを解決する
     *
     * @param  int|null  $year  年（nullの場合は現在のシーズンを使用）
     * @return int シーズンID
     *
     * @throws Exception シーズンが見つからない場合
     */
    public function resolveSeasonId(?int $year): int
    {
        if ($year === null) {
            $currentSeason = Season::current()->first();
            if (! $currentSeason) {
                throw new Exception('現在のシーズンが見つかりません。');
            }

            return $currentSeason->id;
        }

        $season = Season::where('year', $year)->first();

        if (! $season) {
            throw new Exception("指定されたシーズン (年: {$year}) は存在しません。");
        }

        return $season->id;
    }

    /**
     * チームIDを解決する
     *
     * @param  User  $user  ユーザーオブジェクト
     * @param  int|null  $teamId  チームID（nullの場合はプライマリチームを使用）
     * @return int チームID
     *
     * @throws Exception チームが見つからない場合
     */
    public function resolveTeamId(User $user, ?int $teamId): int
    {
        if ($teamId === null) {
            $primaryClub = $user->myClubs->firstWhere('is_primary', true);
            if (! $primaryClub) {
                throw new Exception('プライマリチームが見つかりません。');
            }

            return $primaryClub->team_id;
        }

        // 指定されたチームIDがユーザーのマイクラブに含まれているか確認
        $userTeamIds = $user->myClubs->pluck('team_id')->toArray();
        if (! in_array($teamId, $userTeamIds, true)) {
            throw new Exception('指定されたチームはユーザーのマイクラブに含まれていません。');
        }

        return $teamId;
    }

    /**
     * リーグIDを解決する
     *
     * @param  int  $seasonId  シーズンID
     * @param  int  $teamId  チームID
     * @param  int|null  $leagueId  リーグID（nullの場合はすべてのリーグを対象）
     * @return int|null リーグID
     *
     * @throws Exception 指定されたリーグが見つからない場合
     */
    public function resolveLeagueId(int $seasonId, int $teamId, ?int $leagueId): ?int
    {
        if ($leagueId === null) {
            return null; // nullはすべてのリーグを対象とする
        }

        // 指定されたシーズンとチームに関連するリーグを取得
        $season = Season::find($seasonId);

        if (! $season) {
            throw new Exception('指定されたシーズンが見つかりません。');
        }

        $leagues = $season->leaguesByTeamId($teamId);
        if (! $leagues->contains('id', $leagueId)) {
            throw new Exception('指定されたリーグが見つかりません。');
        }

        return $leagueId;
    }

    /**
     * すべてのシーズンを取得
     *
     * @return Collection シーズンコレクション
     */
    public function getSeasons(): Collection
    {
        return Season::select(['id', 'year'])
            ->orderByDesc('year')
            ->get()
            ->map(function (Season $season) {
                return [
                    'id'   => $season->id,
                    'year' => $season->year,
                    'name' => $season->name,
                ];
            });
    }

    /**
     * ユーザーのマイクラブ一覧を取得
     *
     * @param  User  $user  ユーザーオブジェクト
     * @return Collection マイクラブコレクション
     */
    public function getMyClubs(User $user): Collection
    {
        return $user->myClubs->map(function (MyClub $myClub) {
            return $myClub->team;
        });
    }

    /**
     * 指定のシーズン チームからリーグ一覧を取得
     *
     * @param  int  $seasonId  シーズンID
     * @param  int  $teamId  チームID
     * @return Collection リーグコレクション
     */
    public function getLeagues(int $seasonId, int $teamId): Collection
    {
        // 先頭にAllを追加する
        return Season::find($seasonId)
            ->leaguesByTeamId($teamId)
            ->map(function (League $league) {
                return [
                    'id'        => $league->id,
                    'name'      => $league->name,
                    'logo_path' => $league->logo_path,
                ];
            })
            ->prepend([
                'id'        => null,
                'name'      => 'All',
                'logo_path' => null,
            ]);
    }
}
