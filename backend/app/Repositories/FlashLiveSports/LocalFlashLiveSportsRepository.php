<?php

namespace App\Repositories\FlashLiveSports;

use App\Repositories\Images\PlayerImageRepository;
use App\Repositories\Json\JsonRepository;
use App\UseCases\Admin\Game\FlashLiveSportsRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports\SearchResultDto;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class LocalFlashLiveSportsRepository implements FlashLiveSportsRepositoryInterface
{
    public function __construct(
        private JsonRepository $json,
        private PlayerImageRepository $playerImage,
    ) {}

    public function searchByName(Collection $player): SearchResultDto
    {
        $data = $this->json->getCollection('api/flash_live_sports', $player->get('api_player_id'));

        if ($data->isEmpty()) {
            $json = $this->httpClient('https://flashlive-sports.p.rapidapi.com/v1/search/multi-search', [
                'locale' => config('flash-live-sports.locale'),
                'query'  => $player->get('name'),
            ]);

            $this->json->save('api/flash_live_sports', $player->get('api_player_id'), $json);

            $data = $this->json->getCollection('api/flash_live_sports', $player->get('api_player_id'));

            return SearchResultDto::fromCollection($data);
        }

        return SearchResultDto::fromCollection($data);
    }

    public function fetchPlayerImage(Collection $player): ?string
    {
        if (! $this->playerImage->exist($player->get(('api_player_id')))) {
            $playerImage = $this->httpClient('https://flashlive-sports.p.rapidapi.com/v1/images/data', [
                'image_id' => $player->get('flash_image_id'),
            ]);

            return $playerImage;
        }

        return $this->playerImage->get($player->get(('api_player_id')));
    }

    private function httpClient(string $url, ?array $queryParams = null): string
    {
        try {
            $response = Http::withHeaders([
                'Cache-Control'   => 'no-cache',
                'X-RapidAPI-Host' => config('flash-live-sports.api-host'),
                'X-RapidAPI-Key'  => config('flash-live-sports.api-key'),
            ])
                ->retry(1, 500)
                ->get($url, $queryParams);

            return $response->throw()->body();
        } catch (Exception $e) {
            throw $e;
        }
    }
}
