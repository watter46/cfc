<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

/**
 * 試合統計情報DTO
 */
final class StatisticsDto extends BaseDto
{
    public function __construct(
        public readonly TeamDto $team,
        public readonly Collection $statistics, // 統計データのコレクション
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            team: TeamDto::fromCollection($data->get('team')),
            statistics: $data->get('statistics', collect()),
        );
    }

    /**
     * 指定された統計項目の値を取得
     */
    public function getStatistic(string $type): mixed
    {
        foreach ($this->statistics as $stat) {
            if ($stat['type'] === $type) {
                return $stat['value'];
            }
        }

        return null;
    }

    /**
     * ボール支配率を取得
     */
    public function getBallPossession(): ?string
    {
        return $this->getStatistic('Ball Possession');
    }

    /**
     * 総シュート数を取得
     */
    public function getTotalShots(): ?int
    {
        $shots = $this->getStatistic('Total Shots');

        return $shots ? (int) $shots : null;
    }

    /**
     * 枠内シュート数を取得
     */
    public function getShotsOnGoal(): ?int
    {
        $shots = $this->getStatistic('Shots on Goal');

        return $shots ? (int) $shots : null;
    }

    /**
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'team'       => $this->team->toArray(),
            'statistics' => $this->statistics,
        ]);
    }
}
