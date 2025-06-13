<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class ScoreDto extends BaseDto
{
    public function __construct(
        public readonly ?GoalsDto $halftime,
        public readonly ?GoalsDto $fulltime,
        public readonly ?GoalsDto $extratime,
        public readonly ?GoalsDto $penalty,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            halftime: $data->has('halftime') ? GoalsDto::fromCollection($data->get('halftime')) : null,
            fulltime: $data->has('fulltime') ? GoalsDto::fromCollection($data->get('fulltime')) : null,
            extratime: $data->has('extratime') ? GoalsDto::fromCollection($data->get('extratime')) : null,
            penalty: $data->has('penalty') ? GoalsDto::fromCollection($data->get('penalty')) : null,
        );
    }
}
