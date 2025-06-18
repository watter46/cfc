<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\Repositories\Images\TeamImageRepository;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;

final class TeamTransformer
{
    public function __construct(private readonly TeamImageRepository $teamImage)
    {
        
    }
    
    /**
     * FixtureListDtoからUpsert用データ配列に一括構築
     *
     * @return array<array>
     */
    public function toUpsertData(FixtureListDto $fixturesListDto): array
    {
        return $fixturesListDto->fixtures
            ->flatMap(fn ($fixture) => [$fixture->homeTeam, $fixture->awayTeam])
            ->unique('id')
            ->map(fn (TeamDto $dto) => [
                'api_team_id' => $dto->id,
                'name'        => $dto->name,
                'logo_path'   => $this->teamImage->getFullPath($dto->id),
                'updated_at'  => now(),
            ])
            ->values()
            ->toArray();
    }
}
