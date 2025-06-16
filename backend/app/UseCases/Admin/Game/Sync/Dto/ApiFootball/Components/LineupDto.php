<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

/**
 * ラインナップ情報DTO
 */
final class LineupDto extends BaseDto
{
    public function __construct(
        public readonly TeamDto $team,
        public readonly string $formation,
        public readonly Collection $startXI,     // 先発11人
        public readonly Collection $substitutes, // 控え選手
        public readonly ?CoachDto $coach,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            team: TeamDto::fromCollection($data->get('team')),
            formation: $data->get('formation', ''),
            startXI: $data->get('startXI', collect()),
            substitutes: $data->get('substitutes', collect()),
            coach: $data->has('coach') ? CoachDto::fromCollection($data->get('coach')) : null,
        );
    }

    /**
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'team'        => $this->team->toArray(),
            'formation'   => $this->formation,
            'startXI'     => $this->startXI,
            'substitutes' => $this->substitutes,
            'coach'       => $this->coach?->toArray(),
        ]);
    }
}
