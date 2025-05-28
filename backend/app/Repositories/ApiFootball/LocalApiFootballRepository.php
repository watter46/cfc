<?php

declare(strict_types = 1);

namespace App\Repositories\ApiFootball;

use App\Repositories\Json\JsonRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use App\UseCases\Admin\Game\Dto\ApiFootballDto\FixtureDto;
use App\UseCases\Admin\Game\Dto\ApiFootballDto\FixturesDto;

class LocalApiFootballRepository implements ApiFootballRepositoryInterface
{
    public function __construct(private JsonRepository $repository)
    {

    }

    public function fetchFixtures(int $season): FixturesDto
    {
        $data = $this->repository->getCollection('api/api_football/fixtures', $season);

        return FixturesDto::from($data);
    }

    public function fetchFixture(int $apiFixtureId): FixtureDto
    {
        $data = $this->repository->getCollection('api/api_football/fixture', $apiFixtureId);

        return FixtureDto::fromFixture($data);
    }
}
