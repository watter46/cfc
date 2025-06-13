<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

/**
 * 選手情報DTO
 */
final class PlayerDto extends BaseDto
{
    public function __construct(
        public readonly TeamDto $team,
        public readonly Collection $players, // 選手データのコレクション
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            team: TeamDto::fromCollection($data->get('team')),
            players: $data->get('players', collect()),
        );
    }

    /**
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'team'    => $this->team->toArray(),
            'players' => $this->players,
        ]);
    }
}
