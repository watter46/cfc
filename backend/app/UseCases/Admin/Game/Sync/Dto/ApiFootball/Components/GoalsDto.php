<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class GoalsDto extends BaseDto
{
    public function __construct(
        public readonly ?int $home,
        public readonly ?int $away,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            home: $data->has('home') ? (int) $data->get('home') : null,
            away: $data->has('away') ? (int) $data->get('away') : null,
        );
    }
}
