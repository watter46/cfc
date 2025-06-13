<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

/**
 * コーチ情報DTO
 */
final class CoachDto extends BaseDto
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly ?string $photo,
    ) {}

    public static function fromCollection(Collection $data): static
    {
        return new self(
            id: $data->has('id') ? (int) $data->get('id') : null,
            name: $data->get('name'),
            photo: $data->get('photo'),
        );
    }

    /**
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'id'    => $this->id,
            'name'  => $this->name,
            'photo' => $this->photo,
        ]);
    }
}
