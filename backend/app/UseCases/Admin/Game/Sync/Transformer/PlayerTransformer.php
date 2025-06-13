<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\Models\Player;
use App\Repositories\Images\PlayerImageRepository;
use App\UseCases\Admin\Game\Sync\Service\PlayerUpdateStrategyService;
use App\UseCases\Utils\Name;
use App\UseCases\Utils\Number;
use App\UseCases\Utils\PositionType;
use Illuminate\Support\Collection;

final readonly class PlayerTransformer
{
    public function __construct(
        private PlayerImageRepository $playerImageRepository,
        private PlayerUpdateStrategyService $playerUpdateStrategyService,
    ) {}

    /**
     * FixtureDetailDtoからPlayerモデルのアップサートデータを生成
     *
     * @param  Game  $game
     * @param  GameDataFilterService  $service
     * @param  Collection<Player>  $existingPlayers
     * @return array<int, array<string, mixed>>
     */
    public function toUpsertData($game, $service, $existingPlayers)
    {
        $teamIdMapping = collect([
            $game->homeTeam->api_team_id => $game->homeTeam->id,
            $game->awayTeam->api_team_id => $game->awayTeam->id,
        ]);

        $seasonId = $game->season->id;

        // StartXIとsubstitutesをあわせてデータ成形
        $players = $service->getPlayedLineups()
            ->map(function (Collection $players, int $apiTeamId) {
                return $players
                    ->map(function (Collection $player) use ($apiTeamId) {
                        return collect([
                            'api_team_id'   => $apiTeamId,
                            'api_player_id' => $player->getDotRaw('id'),
                            'name'          => Name::create($player->getDotRaw('name'))->getFullName(),
                            'name_plain'    => Name::create($player->getDotRaw('name'))->getFullNamePlain(),
                            'position'      => PositionType::tryFromMix($player->getDotRaw('pos'))->value,
                            'number'        => Number::create($player->getDotRaw('number'))->number,
                        ]);
                    });
            })
            ->flatten(1);

        $result = $players
            ->map(function (Collection $player) use ($seasonId, $teamIdMapping, $existingPlayers) {
                $newPlayer = collect([
                    'team_id'       => $teamIdMapping->get($player->get('api_team_id')),
                    'season_id'     => $seasonId,
                    'name'          => $player->get('name'),
                    'name_plain'    => $player->get('name_plain'),
                    'position'      => $player->get('position'),
                    'number'        => $player->get('number'),
                    'api_player_id' => $player->get('api_player_id'),
                    'image_path'    => $this->playerImageRepository->getFullPath($player->get('api_player_id')),
                ]);

                return $this->playerUpdateStrategyService->update(
                    $existingPlayers->get($newPlayer->get('api_player_id')),
                    $newPlayer,
                );
            });

        return $result->toArray();
    }
}
