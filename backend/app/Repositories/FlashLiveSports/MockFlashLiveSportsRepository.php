<?php

namespace App\Repositories\FlashLiveSports;

use App\Repositories\Images\PlayerImageRepository;
use App\Repositories\Json\JsonRepository;
use App\UseCases\Admin\Game\FlashLiveSportsRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports\SearchResultDto;
use Illuminate\Support\Collection;

class MockFlashLiveSportsRepository implements FlashLiveSportsRepositoryInterface
{
    public function __construct(private JsonRepository $json, private PlayerImageRepository $playerImage) {}

    public function searchByName(Collection $player): SearchResultDto
    {
        $apiPlayerId = $player->get('api_player_id');

        $data = $this->json->getCollection('api/flash_live_sports', "$apiPlayerId");

        return SearchResultDto::fromCollection($data);
    }

    public function fetchPlayerImage(Collection $player): ?string
    {
        return $this->playerImage->get($player->get('api_player_id'));
    }
}
