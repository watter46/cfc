<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class LeagueDto extends BaseDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $country,
        public readonly string $logo,
        public readonly string $flag,
        public readonly int $season,
        public readonly string $round,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        self::validateRequiredFields($data->toArray(), ['id', 'name', 'country', 'logo', 'flag', 'season', 'round']);

        return new self(
            id: (int) $data->get('id'),
            name: (string) $data->get('name'),
            country: (string) $data->get('country'),
            logo: (string) $data->get('logo'),
            flag: (string) $data->get('flag'),
            season: (int) $data->get('season'),
            round: (string) $data->get('round'),
        );
    }
}
