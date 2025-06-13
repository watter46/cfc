<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Utils\Season as UtilSeason;

final class SeasonTransformer
{
    /**
     * FixtureListDtoからUpsert用データ配列を一括構築（重複除去済み）
     *
     * @return array<array>
     */
    public function toUpsertData(FixtureListDto $fixturesListDto): array
    {
        $currentSeason = UtilSeason::current();

        return $fixturesListDto->fixtures
            ->map(fn ($fixture) => $fixture->league)
            ->unique('season')
            ->map(function (LeagueDto $dto) use ($currentSeason) {
                $seasonUtil = UtilSeason::fromYear($dto->season);

                return [
                    'start_date' => now()->setYear($dto->season)->startOfYear()->month(7)->startOfMonth(),
                    'end_date'   => now()->setYear($dto->season + 1)->startOfYear()->month(6)->endOfMonth(),
                    'year'       => $dto->season,
                    'is_current' => $seasonUtil->year === $currentSeason->year,
                    'updated_at' => now(),
                ];
            })
            ->values()
            ->toArray();
    }
}
