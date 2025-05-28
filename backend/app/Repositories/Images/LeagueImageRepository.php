<?php

declare(strict_types=1);

namespace App\Repositories\Images;

class LeagueImageRepository extends AbstractImageRepository
{
    public function getDirName(): string
    {
        return 'league';
    }
}
