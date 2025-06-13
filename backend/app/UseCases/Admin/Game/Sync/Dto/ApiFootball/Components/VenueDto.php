<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class VenueDto extends BaseDto
{
    public function __construct(
        public readonly ?int $id,
        public readonly ?string $name,
        public readonly ?string $city,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            id: $data->has('id') ? (int) $data->get('id') : null,
            name: $data->get('name'),
            city: $data->get('city'),
        );
    }
}
