<?php

namespace App\UseCases\Admin\Game\Sync;

use App\Repositories\Images\LeagueImageRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use Illuminate\Support\Collection;

class SyncLeagueImagesAction
{
    public function __construct(
        private LeagueImageRepository $leagueImage,
        private ApiFootballRepositoryInterface $apiFootball,
    ) {}

    public function execute(Collection $apiLeagueIds): void
    {
        $invalidApiLeagueIds = $apiLeagueIds->filter(function (int $apiLeagueId) {
            return ! $this->leagueImage->exist($apiLeagueId);
        });

        $invalidApiLeagueIds->each(function (int $apiLeagueId) {
            $binaryData = $this->apiFootball->fetchLeagueImage($apiLeagueId);
            
            $this->leagueImage->save($apiLeagueId, $binaryData);
        });
    }
}
