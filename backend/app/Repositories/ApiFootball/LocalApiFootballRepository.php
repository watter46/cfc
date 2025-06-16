<?php

declare(strict_types=1);

namespace App\Repositories\ApiFootball;

use App\Repositories\Images\LeagueImageRepository;
use App\Repositories\Images\TeamImageRepository;
use App\Repositories\Json\JsonRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use Exception;
use Illuminate\Support\Facades\Http;

final class LocalApiFootballRepository implements ApiFootballRepositoryInterface
{
    public function __construct(
        private JsonRepository $repository,
        private LeagueImageRepository $leagueImage,
        private TeamImageRepository $teamImage,
    ) {}

    public function fetchFixtures(int $season, ?int $leagueId = null): FixtureListDto
    {
        $data = $this->repository->getCollection('api/api_football/fixtures', $season);

        return FixtureListDto::fromApiResponse($data);
    }

    public function fetchFixtureDetail(int $apiFixtureId): FixtureDetailDto
    {
        $data = $this->repository->getCollection('api/api_football/fixture', $apiFixtureId);

        return FixtureDetailDto::fromCollection($data);
    }

    public function fetchLeagueImage(int $apiLeagueId): string
    {
        return $this->leagueImage->get($apiLeagueId);
    }

    public function fetchTeamImage(int $apiTeamId): string
    {
        return $this->teamImage->get($apiTeamId);
    }

    // public function fetchLeagueImage(int $apiLeagueId): string
    // {
    //     return $this->httpClient("https://media-4.api-sports.io/football/leagues/$apiLeagueId.png");
    // }

    // public function fetchTeamImage(int $apiTeamId): string
    // {
    //     return $this->httpClient("https://media-4.api-sports.io/football/teams/$apiTeamId.png");
    // }

    // private function httpClient(string $url, ?array $queryParams = null): string
    // {
    //     try {
    //         $response = Http::withHeaders([
    //             'X-RapidAPI-Host' => config('api-football.api-host'),
    //             'X-RapidAPI-Key'  => config('api-football.api-key'),
    //         ])
    //             ->retry(1, 500)
    //             ->get($url, $queryParams);

    //         return $response->throw()->body();

    //     } catch (Exception $e) {
    //         throw $e;
    //     }
    // }
}
