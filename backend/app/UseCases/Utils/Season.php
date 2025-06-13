<?php

declare(strict_types=1);

namespace App\UseCases\Utils;

use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

// TODO: CWCなどシーズン期間の例外の対処を考える
final readonly class Season
{
    private const SEASON_END_MONTH = 6;

    private function __construct(
        public int $year,
    ) {}

    public static function isCurrent(Carbon $startDate, Carbon $endDate): bool
    {
        return $startDate->isBefore(now()) && $endDate->isAfter(now());
    }

    /**
     * 現在のシーズンを取得
     */
    public static function current(): self
    {
        $now = now();

        $season = $now->year;

        if ($now->month >= 1 && $now->month <= self::SEASON_END_MONTH) {
            $season -= 1;
        }

        return new self($season);
    }

    /**
     * 日付からシーズンを取得
     */
    public static function fromDate(Carbon $date): self
    {
        $season = $date->year;

        if ($date->month >= 1 && $date->month <= self::SEASON_END_MONTH) {
            $season -= 1;
        }

        return new self($season);
    }

    /**
     * 年からシーズンを取得
     */
    public static function fromYear(int $year): self
    {
        return new self($year);
    }

    /**
     * シーズンをテキストで取得 ex:24/25
     *
     * @return string
     */
    public function toText()
    {
        $currentYear = Str::substr($this->year, 2, 2);
        $nextYear = Str::substr($this->year + 1, 2, 2);

        return $currentYear.'/'.$nextYear;
    }
}
