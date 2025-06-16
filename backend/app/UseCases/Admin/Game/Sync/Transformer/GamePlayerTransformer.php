<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\Models\Game;
use App\UseCases\Admin\Game\Sync\Service\GameDataFilterService;
use Illuminate\Support\Collection;

final readonly class GamePlayerTransformer
{
    /**
     * @param  Collection<int, int>  $playerIdMapping
     * @return array<int, array<string, mixed>>
     */
    public function toUpsert(Game $game, GameDataFilterService $service, Collection $playerIdMapping)
    {
        $players = $service->getPlayedPlayers()
            ->map(function (Collection $players) use ($game) {
                return $players->map(function (Collection $player) use ($game) {
                    return collect([
                        'player_id'      => $player->get('id'),
                        'game_id'        => $game->id,
                        'is_starter'     => ! $player->getDotRaw('games.substitute'),
                        'position'       => $player->getDotRaw('games.position'),
                        'minutes_played' => $player->getDotRaw('games.minutes'),
                        'assists'        => $player->getDotRaw('goals.assists', 0),
                        'goals'          => $player->getDotRaw('goals.total', 0),
                        'api_rating'     => $player->getDotRaw('games.rating'),
                    ]);
                });
            })
            ->flatten(1);

        $lineupPlayers = $service->getPlayedLineups()
            ->flatten(1)
            ->mapOnly([
                'player_id' => 'id',
                'grid',
            ]);

        return $players
            ->groupMergeBy('player_id', $lineupPlayers)
            ->replaceKeysFromMap($playerIdMapping, ['player_id'])
            ->toArray();
    }
}
