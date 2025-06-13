<?php

declare(strict_types=1);

namespace App\Repositories\Images;

final class TeamImageRepository extends AbstractImageRepository
{
    public function getDirName(): string
    {
        return 'team';
    }
}
