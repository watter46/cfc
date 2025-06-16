<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Service;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LineupDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\PlayerDto;
use Illuminate\Support\Collection;

final class PlayedPlayerFilterService
{
    public function __construct(private ?SupportedClubsService $supportedClubsService = null) {}

    public function from(SupportedClubsService $supportedClubsService): self
    {
        return new self($supportedClubsService);
    }

    public function getPlayerIds(): Collection
    {
        return $this->supportedClubsService->players
            ->map(function (PlayerDto $dto) {
                return $dto->players->filter(function (Collection $player) {
                    return $player->getDotRaw('statistics.0.games.minutes');
                });
            })
            ->flatten(1)
            ->pluck('player.id')
            ->values();
    }

    public function getPlayedLineups(): Collection
    {
        return $this->supportedClubsService->lineups
            ->mapWithKeys(function (LineupDto $lineup) {
                $startXI = $lineup->startXI;
                $substitutes = $lineup->substitutes;

                return collect([
                    $lineup->team->id => $startXI
                        ->merge($substitutes)
                        ->map(fn (Collection $player) => $player->get('player'))
                        ->filter(function (Collection $player) {
                            return $this->getPlayerIds()->contains($player->get('id'));
                        }),
                ]);
            });
    }

    public function getPlayedPlayers(): Collection
    {
        return $this->supportedClubsService->players
            ->mapWithKeys(function (PlayerDto $dto) {
                $mapped = $dto->players->map(function (Collection $data) {
                    $player = $data->get('player');
                    $statistics = $data->getDot('statistics.0');

                    return $player->merge($statistics);
                })
                    ->filter(function (Collection $player) {
                        return $this->getPlayerIds()->contains($player->get('id'));
                    });

                return collect([$dto->team->id => $mapped]);
            });
    }

    public function getPlayedStatistics(): Collection
    {
        return $this->supportedClubsService->players
            ->map(function (PlayerDto $dto) {
                return $dto->players->filter(function (Collection $player) {
                    return $player->getDotRaw('statistics.0.games.minutes');
                });
            })
            ->flatten(1)
            ->map(function (Collection $player) {
                $playerId = $player->getDotRaw('player.id');
                $statistics = $player->getDot('statistics.0');

                return collect([
                    'id' => $playerId,
                    ...$statistics,
                ]);
            })
            ->values();
    }
}
