<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class StatusDto extends BaseDto
{
    public function __construct(
        public readonly string $long,
        public readonly string $short,
        public readonly ?int $elapsed = null,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        self::validateRequiredFields($data->toArray(), ['long', 'short']);

        return new self(
            long: (string) $data->get('long'),
            short: (string) $data->get('short'),
            elapsed: $data->has('elapsed') ? (int) $data->get('elapsed') : null,
        );
    }
}
