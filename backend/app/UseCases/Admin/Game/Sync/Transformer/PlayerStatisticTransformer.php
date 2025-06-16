<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\UseCases\Admin\Game\Sync\Service\GameDataFilterService;
use Illuminate\Support\Collection;

final readonly class PlayerStatisticTransformer
{
    /**
     * プレイヤー統計データをupsert用の配列に変換
     *
     * @param  Collection<int, int>  $gamePlayerIdMapping  api_player_id => game_player_id のマッピング
     * @return array<int, array<string, mixed>>
     */
    public function toUpsert(GameDataFilterService $service, Collection $gamePlayerIdMapping): array
    {
        // プレイヤー統計データを取得
        $playerStatistics = $service->getPlayedStatistics();

        return $playerStatistics
            ->replaceKeysFromMap($gamePlayerIdMapping, ['id'])
            ->mapOnlyFlat([
                'game_player_id'    => 'id',
                'shots_total'       => 'shots.total',
                'shots_on_target'   => 'shots.on',
                'passes_total'      => 'passes.total',
                'passes_accuracy'   => 'passes.accuracy',
                'key_passes'        => 'passes.key',
                'tackles'           => 'tackles.total',
                'blocks'            => 'tackles.blocks',
                'interceptions'     => 'tackles.interceptions',
                'duels_won'         => 'duels.won',
                'duels_total'       => 'duels.total',
                'dribbles_success'  => 'dribbles.success',
                'dribbles_attempts' => 'dribbles.attempts',
                'fouls_committed'   => 'fouls.committed',
                'fouls_drawn'       => 'fouls.drawn',
                'yellow_cards'      => 'cards.yellow',
                'red_cards'         => 'cards.red',
                'saves'             => 'goals.saves',
                'goals_conceded'    => 'goals.conceded',
            ])
            ->toArray();
    }
}
