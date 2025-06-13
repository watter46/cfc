<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LineupDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\PlayerDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatisticsDto;
use App\UseCases\Utils\SupportedClubs;
use Illuminate\Support\Collection;

final readonly class SupportedFixtureDetailDto
{
    public function __construct(
        public FixtureDetailDto $fixtureDetailDto,
        public Collection $supportedTeamIds,
    ) {}

    /**
     * コレクションからDTOを作成
     */
    public static function from(FixtureDetailDto $fixtureDetailDto): self
    {
        return new self($fixtureDetailDto, SupportedClubs::ids());
    }

    // /**
    //  * 指定されたチームIDコレクションから該当する選手IDを取得
    //  *
    //  * @return Collection<int>
    //  */
    // public function getPlayers(): Collection
    // {
    //     /** @var Collection<PlayerDto> */
    //     $teamPlayers = collect();

    //     if ($teamIds->contains($this->getHomeTeam()->id)) {
    //         $teamPlayers->push($this->getPlayeredHomePlayers());
    //     }

    //     if ($teamIds->contains($this->getAwayTeam()->id)) {
    //         $teamPlayers->push($this->getPlayeredAwayPlayers());
    //     }

    //     return $teamPlayers
    //         ->flatten(1)
    //         ->values();
    // }

    /**
     * 出場した選手IDを取得
     *
     * @return Collection<int>
     */
    public function getPlayedPlayerIds()
    {
        return $this->filterSupported($this->fixtureDetailDto->players)
            ->map(function (PlayerDto $dto) {
                return $dto->players->filter(function (Collection $player) {
                    return $player->getDotRaw('statistics.0.games.minutes');
                });
            })
            ->flatten(1)
            ->pluck('player.id')
            ->values();
    }

    /**
     * サポートされているチームのStatisticDtoを取得
     *
     * @return Collection<StatisticDto>
     */
    public function getStatistics(): Collection
    {
        return $this->filterSupported($this->fixtureDetailDto->statistics);
    }

    /**
     * サポートされているチームのLineupDtoを取得
     *
     * @return Collection<LineupDto>
     */
    public function getLineups(): Collection
    {
        return $this->filterSupported($this->fixtureDetailDto->lineups);
    }

    /**
     * サポートされているチームのPlayerDtoを取得
     *
     * @return Collection<PlayerDto>
     */
    public function getPlayers(): Collection
    {
        return $this->filterSupported($this->fixtureDetailDto->players);
    }

    /**
     * サポートされているチームの選手情報を取得
     *
     * @return Collection<PlayerDto|LineupDto|StatisticDto>
     */
    private function filterSupported(Collection $dtos): Collection
    {
        return $dtos
            ->filter(function (PlayerDto|LineupDto|StatisticsDto $dto) {
                return $this->supportedTeamIds->contains($dto->team->id);
            })
            ->values();
    }
}
