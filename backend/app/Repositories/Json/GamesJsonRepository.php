<?php

declare(strict_types=1);

namespace App\Repositories\Json;

final class GamesJsonRepository extends JsonRepository
{
    private const JSON_KEYS = ['score', 'teams', 'league'];

    public function toModels(string $dirName, int|string $fileName)
    {
        return collect($this->get($dirName, $fileName))
            ->deepCollect()
            ->map(function ($game) {
                return $game->map(function ($column, $key) {
                    if (collect(self::JSON_KEYS)->contains($key)) {
                        return json_encode($column);
                    }

                    return $column;
                });
            })->toArray();
    }
}
