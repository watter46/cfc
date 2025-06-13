<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Service;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LineupDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\PlayerDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatisticsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use Illuminate\Support\Collection;
use RuntimeException;

final readonly class SupportedClubsService
{
    private const SUPPORT_API_TEAM_ID_LIST = [
        'chelsea' => 49,
    ];

    public function __construct(
        public ?FixtureDto $fixture = null,
        public Collection $lineups = new Collection,
        public Collection $statistics = new Collection,
        public Collection $players = new Collection,
    ) {}

    public function from(FixtureDetailDto $dto)
    {
        if (! $this->hasRequired($dto)) {
            throw new RuntimeException('Invalid FixtureDetailDto: Missing required data.');
        }

        $fixture = $dto->fixture;
        $lineups = $this->filterSupported($dto->lineups);
        $statistics = $this->filterSupported($dto->statistics);
        $players = $this->filterSupported($dto->players);

        return new self(
            $fixture,
            $lineups,
            $statistics,
            $players,
        );
    }

    /**
     * サポートされているチームのみにフィルタリング
     *
     * @return Collection<PlayerDto|LineupDto|StatisticDto>
     */
    private function filterSupported(Collection $dtos): Collection
    {
        return $dtos
            ->filter(function (PlayerDto|LineupDto|StatisticsDto $dto) {
                return collect(self::SUPPORT_API_TEAM_ID_LIST)->contains($dto->team->id);
            })
            ->values();
    }

    /**
     * lineups statistics playersが存在するか判定する
     *
     * @return bool
     */
    private function hasRequired(FixtureDetailDto $dto)
    {
        return $dto->lineups?->isNotEmpty() &&
               $dto->statistics?->isNotEmpty() &&
               $dto->players?->isNotEmpty();
    }
}
