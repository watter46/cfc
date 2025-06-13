<?php

declare(strict_types=1);

namespace App\Repositories\ApiFootball;

use App\Repositories\Json\JsonRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;

final class LocalApiFootballRepository implements ApiFootballRepositoryInterface
{
    public function __construct(private JsonRepository $repository) {}

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
}
