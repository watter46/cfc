<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class TeamDto extends BaseDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $logo,
        public readonly ?bool $winner = null,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        self::validateRequiredFields($data->toArray(), ['id', 'name', 'logo']);

        return new self(
            id: (int) $data->get('id'),
            name: (string) $data->get('name'),
            logo: (string) $data->get('logo'),
            winner: $data->has('winner') ? (bool) $data->get('winner') : null,
        );
    }
}
