<?php

namespace App\UseCases\Admin\Game\Sync\Service;

use App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports\PlayerCandidateDto;
use App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports\SearchResultDto;
use App\UseCases\Utils\Name;
use Illuminate\Support\Collection;

class PlayerMatchingService
{
    public function matchPlayer(SearchResultDto $dto, Collection $player): ?Collection
    {
        $candidates = $dto->candidates
            ->filter(function (PlayerCandidateDto $candidate) use ($player) {
                return Name::create($player->get('name'))
                    ->equal(Name::create($candidate->getName()));
            });

        if ($candidates->isEmpty()) {
            return null;
        }

        $candidate = $candidates->first();

        return collect([
            'flash_id'       => $candidate->id,
            'flash_image_id' => $candidate->getImageId(),
        ]);
    }
}
