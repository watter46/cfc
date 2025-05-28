<?php

declare(strict_types = 1);

namespace App\Models\Builders;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class GameBuilder extends Builder
{
    public function isEnd()
    {
        return $this->where('is_end', true);
    }

    /**
     * リーグIDでフィルタリングする
     *
     * @param  int|null $leagueId
     * @return self
     */
    public function byLeague(?int $leagueId = null): self
    {
        return $leagueId
            ? $this->where('league_id', $leagueId)
            : $this;
    }

    /**
     * 今日までの試合を取得する
     *
     * @return self
     */
    public function untilToday(): self
    {
        return $this
            ->where('started_at', '<=', now('UTC'))
            ->orderByDesc('started_at');
    }

    /**
     * 特定のapiFixtureIdの試合を取得する
     *
     * @param  int  $apiFixtureId
     * @return self
     */
    public function apiFixtureId(int $apiFixtureId): self
    {
        return $this->where('api_fixture_id', $apiFixtureId);
    }

    /**
     * 次の試合を取得する
     *
     * @return self
     */
    public function next(): self
    {
        return $this
            ->where('finished_at', '>', now('UTC'))
            ->orderBy('finished_at');
    }

    /**
     * 数日前から今までの試合を取得する
     *
     * @param  int  $days
     * @return self
     */
    public function withinDays(int $days = 3): self
    {
        return $this->whereBetween(
            'finished_at',
            [
                Carbon::now('UTC')->subDays($days),
                Carbon::now('UTC'),
            ]
        );
    }
}
