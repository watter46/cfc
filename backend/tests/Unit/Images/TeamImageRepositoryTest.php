<?php

declare(strict_types=1);

namespace Tests\Unit\Images;

use App\Repositories\Images\LeagueImageRepository;
use App\Repositories\Images\PlayerImageRepository;
use App\Repositories\Images\Team\TeamImageRepository;
use PHPUnit\Framework\TestCase;

final class TeamImageRepositoryTest extends TestCase
{
    public function test_チームリポジトリ()
    {
        $teamImageRepository = new TeamImageRepository;

        $test = $teamImageRepository->getFullPath(1);

    }

    public function test_プレイヤーリポジトリ()
    {
        $playerImageRepository = new PlayerImageRepository;

        $test = $playerImageRepository->getFullPath(1);

        // dd($test);
    }

    public function test_リーグリポジトリ()
    {
        $leagueImageRepository = new LeagueImageRepository;

        $test = $leagueImageRepository->getFullPath(1);

        dd($test);
    }
}
