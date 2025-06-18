<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\Repositories\Images\LeagueImageRepository;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;

final class LeagueTransformer
{
    public function __construct(private LeagueImageRepository $leagueImage)
    {
        //
    }
    
    /**
     * FixtureListDtoからUpsert用データ配列を一括構築
     *
     * @return array<array>
     */
    public function toUpsertData(FixtureListDto $fixturesListDto): array
    {
        return $fixturesListDto->fixtures
            ->map(fn ($fixture) => $fixture->league)
            ->unique('id')
            ->map(fn (LeagueDto $dto) => [
                'api_league_id' => $dto->id,
                'name'          => $dto->name,
                'type'          => 'league',
                'logo_path'     => $this->leagueImage->getFullPath($dto->id),
                'updated_at'    => now(),
            ])
            ->values()
            ->toArray();
    }
}
