<?php

namespace App\Http\Resources\User;

use App\Http\Resources\ApiResourceCollection;
use App\Models\Game;

class FetchGamesCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<int|string, mixed>
     */
    public function toArray($request): array
    {
        $response = parent::toArray($request);

        $response['data'] = $this->collection->map(function (Game $game) {
            return [
                'id'         => $game->id,
                'started_at' => $game->started_at,
                'score'      => $game->score,
                'rateable'   => $game->rateable,
                'season'     => [
                    'id'   => $game->season->id,
                    'name' => $game->season->name,
                ],
                'game_user' => [
                    'id'                 => $game->gameUser->id,
                    'user_id'            => $game->gameUser->user_id,
                    'game_id'            => $game->gameUser->game_id,
                    'mom_count'          => $game->gameUser->mom_count,
                    'mom_game_player_id' => $game->gameUser->mom_game_player_id,
                    'is_rated'           => $game->gameUser->is_rated,
                ],
                'teams' => [
                    'home' => [
                        'id'        => $game->homeTeam->id,
                        'name'      => $game->homeTeam->name,
                        'logo_path' => $game->homeTeam->logo_path,
                    ],
                    'away' => [
                        'id'        => $game->awayTeam->id,
                        'name'      => $game->awayTeam->name,
                        'logo_path' => $game->awayTeam->logo_path,
                    ],
                ],
                'league' => [
                    'id'        => $game->league->id,
                    'name'      => $game->league->name,
                    'logo_path' => $game->league->logo_path,
                ],
            ];
        });

        return $response;
    }
}
