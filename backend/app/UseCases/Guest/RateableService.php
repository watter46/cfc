<?php

namespace App\UseCases\Guest;

use App\Models\Game;
use Illuminate\Support\Carbon;

class RateableService
{
    /** 評価可能期間 3日間 */
    private const RATE_PERIOD_HOURS = 24 * 3;

    public const RATE_PERIOD_EXPIRED_MESSAGE = 'Rate period has expired.';
    
    public function check(Game $game)
    {
        $specifiedDate = Carbon::parse($game->finished_at);

        return $specifiedDate->diffInHours(now('UTC')) <= self::RATE_PERIOD_HOURS;
    }
}