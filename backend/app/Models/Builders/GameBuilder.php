<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Models\Season;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

final class GameBuilder extends Builder
{
    public function isEnd()
    {
        return $this->where('is_end', true);
    }

    public function isDetailsFetched()
    {
        return $this->where('is_details_fetched', true);
    }

    /**
     * 指定の年でフィルタリングする
     *
     * @throws RuntimeException 指定のシーズンが存在しない場合
     */
    public function byYear(?int $year): self
    {
        if ($year === null) {
            return $this->currentSeason();
        }

        $season = Season::select('id')->where('year', $year)->first();

        if ($season === null) {
            throw new RuntimeException('指定のシーズンが存在しません');
        }

        return $this->where('season_id', $season->id);
    }

    /**
     * 現在のシーズンの試合を取得する
     *
     * @throws RuntimeException 現在のシーズンが存在しない場合
     */
    public function currentSeason(): self
    {
        $currentSeason = Season::select('id')->current()->first();

        if ($currentSeason === null) {
            throw new RuntimeException('現在のシーズンが存在しません');
        }

        return $this->where('season_id', $currentSeason->id);
    }

    /**
     * シーズンIDでフィルタリングする
     */
    public function bySeasonId(?int $seasonId): self
    {
        if ($seasonId === null) {
            return $this->currentSeason();
        }

        return $this->where('season_id', $seasonId);
    }

    /**
     * チームIDでフィルタリングする
     */
    public function byTeamId(int $teamId): self
    {
        return $this->where(function ($query) use ($teamId) {
            $query->where('home_team_id', $teamId)
                ->orWhere('away_team_id', $teamId);
        });
    }

    /**
     * リーグIDでフィルタリングする
     */
    public function byLeagueId(?int $leagueId): self
    {
        if ($leagueId === null) {
            return $this;
        }

        return $this->where('league_id', $leagueId);
    }

    /**
     * 今日までの試合を取得する
     */
    public function untilToday(): self
    {
        return $this
            ->where('started_at', '<=', now('UTC'))
            ->orderByDesc('started_at');
    }

    /**
     * 特定のapiFixtureIdの試合を取得する
     */
    public function apiFixtureId(int $apiFixtureId): self
    {
        return $this->where('api_fixture_id', $apiFixtureId);
    }

    /**
     * 次の試合を取得する
     */
    public function next(): self
    {
        return $this
            ->where('finished_at', '>', now('UTC'))
            ->orderBy('finished_at');
    }

    /**
     * 数日前から今までの試合を取得する
     */
    public function withinDays(int $days = 3): self
    {
        return $this->whereBetween(
            'finished_at',
            [
                Carbon::now('UTC')->subDays($days),
                Carbon::now('UTC'),
            ],
        );
    }
}
