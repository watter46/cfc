<?php

declare(strict_types = 1);

namespace App\Http\Resources\Guest;

use App\Http\Resources\ApiResourceCollection;
use App\Models\Game;

class LatestFinishedGamesCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'data' => $this->collection
                ->map(function (Game $game) {
                    return [
                        'date' => $game->formatted_started_at,
                        'score' => $game->score,
                        'home' => $game->homeTeam,
                        'away' => $game->awayTeam,
                        'WinnerTeamId' => $game->winner_team_id,
                        'isRateable' => $game->isRateable,
                    ];
                }),
        ];
    }
}
