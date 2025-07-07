<?php

declare(strict_types=1);

namespace App\UseCases\Utils\Services;

use App\Models\Game;
use Illuminate\Support\Carbon;

/**
 * ゲームの評価可能期間を判定するサービスクラス
 *
 * 評価期間のロジックを共通化し、各ドメインから再利用できるようにします。
 */
final class RateableService
{
    /** 評価可能期間（3日間） */
    private const RATE_PERIOD_HOURS = 24 * 3;

    public const RATE_PERIOD_EXPIRED_MESSAGE = 'Rate period has expired.';

    /**
     * ゲームが評価可能かどうかを判定
     *
     * @param  Game  $game  対象ゲーム
     * @return bool 評価可能な場合はtrue
     */
    public function check(Game $game): bool
    {
        $specifiedDate = Carbon::parse($game->finished_at);

        return $specifiedDate->diffInHours(now('UTC')) <= self::RATE_PERIOD_HOURS;
    }
}
