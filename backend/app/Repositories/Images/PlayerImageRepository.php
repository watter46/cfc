<?php

declare(strict_types=1);

namespace App\Repositories\Images;

class PlayerImageRepository extends AbstractImageRepository
{
    public function getDirName(): string
    {
        return 'player';
    }
}
