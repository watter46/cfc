<?php

declare(strict_types=1);

namespace App\Http\Resources\User;

use App\Http\Resources\ApiResource;
use App\Models\Game;

/**
 * 試合詳細用のAPIリソースクラス
 *
 * 試合詳細データを適切な形式でJSONレスポンスに変換します。
 */
class FindGameResource extends ApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        /** @var Game $game */
        $game = $this->resource;

        return [
            'id'                 => $game->id,
            'api_fixture_id'     => $game->api_fixture_id,
            'started_at'         => $game->started_at,
            'finished_at'        => $game->finished_at,
            'is_end'             => $game->is_end,
            'is_details_fetched' => $game->is_details_fetched,
            'score'              => $game->score,
            'rateable'           => $game->rateable ?? false,
            'created_at'         => $game->created_at,
            'updated_at'         => $game->updated_at,

            // チーム情報
            'home_team' => [
                'id'        => $game->homeTeam?->id,
                'name'      => $game->homeTeam?->name,
                'logo_path' => $game->homeTeam?->logo_path,
                'has_image' => $game->homeTeam?->has_image ?? false,
            ],
            'away_team' => [
                'id'        => $game->awayTeam?->id,
                'name'      => $game->awayTeam?->name,
                'logo_path' => $game->awayTeam?->logo_path,
                'has_image' => $game->awayTeam?->has_image ?? false,
            ],

            // 勝利チーム情報
            'winner_team_id' => $game->winner_team_id,

            // リーグ情報
            'league' => [
                'id'        => $game->league?->id,
                'name'      => $game->league?->name,
                'logo_path' => $game->league?->logo_path,
                'has_image' => $game->league?->has_image ?? false,
            ],

            // シーズン情報
            'season' => [
                'id'   => $game->season?->id,
                'year' => $game->season?->year,
            ],

            // ユーザー評価情報
            'game_user' => $game->gameUser ? [
                'id'                 => $game->gameUser->id,
                'mom_count'          => $game->gameUser->mom_count,
                'mom_game_player_id' => $game->gameUser->mom_game_player_id,
                'is_rated'           => $game->gameUser->is_rated,
            ] : null,

            // 試合出場選手情報
            'game_players' => $game->gamePlayers?->map(function ($gamePlayer) {
                return [
                    'id'               => $gamePlayer->id,
                    'is_starter'       => $gamePlayer->is_starter,
                    'grid'             => $gamePlayer->grid,
                    'position'         => $gamePlayer->position,
                    'minutes_played'   => $gamePlayer->minutes_played,
                    'assists'          => $gamePlayer->assists,
                    'goals'            => $gamePlayer->goals,
                    'api_rating'       => $gamePlayer->api_rating,
                    'avg_user_rating'  => $gamePlayer->avg_user_rating,
                    'user_rated_count' => $gamePlayer->user_rated_count,
                    'is_mom'           => $gamePlayer->is_mom,
                    'player'           => [
                        'id'        => $gamePlayer->player?->id,
                        'name'      => $gamePlayer->player?->name,
                        'position'  => $gamePlayer->player?->position,
                        'has_image' => $gamePlayer->player?->has_image ?? false,
                    ],
                    'team' => [
                        'id'   => $gamePlayer->team?->id,
                        'name' => $gamePlayer->team?->name,
                    ],
                    // 選手統計情報
                    'player_statistic' => $gamePlayer->playerStatistic ? [
                        'shots_total'       => $gamePlayer->playerStatistic->shots_total,
                        'shots_on_target'   => $gamePlayer->playerStatistic->shots_on_target,
                        'passes_total'      => $gamePlayer->playerStatistic->passes_total,
                        'passes_accuracy'   => $gamePlayer->playerStatistic->passes_accuracy,
                        'key_passes'        => $gamePlayer->playerStatistic->key_passes,
                        'tackles'           => $gamePlayer->playerStatistic->tackles,
                        'blocks'            => $gamePlayer->playerStatistic->blocks,
                        'interceptions'     => $gamePlayer->playerStatistic->interceptions,
                        'duels_won'         => $gamePlayer->playerStatistic->duels_won,
                        'duels_total'       => $gamePlayer->playerStatistic->duels_total,
                        'dribbles_success'  => $gamePlayer->playerStatistic->dribbles_success,
                        'dribbles_attempts' => $gamePlayer->playerStatistic->dribbles_attempts,
                        'fouls_committed'   => $gamePlayer->playerStatistic->fouls_committed,
                        'fouls_drawn'       => $gamePlayer->playerStatistic->fouls_drawn,
                        'yellow_cards'      => $gamePlayer->playerStatistic->yellow_cards,
                        'red_cards'         => $gamePlayer->playerStatistic->red_cards,
                        'saves'             => $gamePlayer->playerStatistic->saves,
                        'goals_conceded'    => $gamePlayer->playerStatistic->goals_conceded,
                    ] : null,
                    // ユーザーの評価情報
                    'my_rating' => $gamePlayer->myRating ? [
                        'id'         => $gamePlayer->myRating->id,
                        'rating'     => $gamePlayer->myRating->rating,
                        'rate_count' => $gamePlayer->myRating->rate_count,
                        'is_mom'     => $gamePlayer->myRating->is_mom,
                    ] : null,
                ];
            })->toArray(),
        ];
    }
}
