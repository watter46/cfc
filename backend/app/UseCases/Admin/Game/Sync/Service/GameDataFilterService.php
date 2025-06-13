<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Service;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use Illuminate\Support\Collection;

final readonly class GameDataFilterService
{
    public function __construct(
        private SupportedClubsService $supportedClubsService,
        private PlayedPlayerFilterService $playedPlayerFilterService,
    ) {}

    public function from(FixtureDetailDto $dto)
    {
        $supportedClubsService = $this->supportedClubsService->from($dto);
        $playedPlayerFilterService = $this->playedPlayerFilterService->from($supportedClubsService);

        return new self(
            $supportedClubsService,
            $playedPlayerFilterService,
        );
    }

    /**
     * 試合情報を取得
     */
    public function getFixture(): FixtureDto
    {
        return $this->supportedClubsService->fixture;
    }

    /**
     * 出場している選手のIDを取得
     *
     * @return array<int>
     */
    public function getPlayedPlayerIds(): array
    {
        return $this->playedPlayerFilterService
            ->getPlayerIds()
            ->toArray();
    }

    public function getPlayedLineups(): Collection
    {
        return $this->playedPlayerFilterService->getPlayedLineups();
    }

    public function getPlayedPlayers(): Collection
    {
        return $this->playedPlayerFilterService->getPlayedPlayers();
    }

    public function getPlayedStatistics(): Collection
    {
        return $this->playedPlayerFilterService->getPlayedStatistics();
    }
}
