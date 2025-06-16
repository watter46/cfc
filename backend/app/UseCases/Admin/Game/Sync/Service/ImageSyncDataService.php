<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Service;

use App\Models\League;
use App\Models\Player;
use App\Models\Season;
use App\Models\Team;
use Illuminate\Support\Collection;

/**
 * 画像同期データサービス
 *
 * SyncGameDetailから呼び出され、今シーズンのチームとリーグの画像を
 * 同期するためのデータを提供します。
 */
class ImageSyncDataService
{
    /**
     * 画像が未設定のリーグのidとapi_league_idを取得
     *
     * @return Collection<array{id: int, api_league_id: int}> api_league_idのコレクション
     */
    public function getLeaguesWithoutImages(): Collection
    {
        return League::query()
            ->where('has_image', false)
            ->get(['id', 'api_league_id'])
            ->map(fn (League $league) => $league->toArray());
    }

    /**
     * 画像が未設定のチームのidとapi_team_idを取得
     *
     * @return Collection<array{id: int, api_team_id: int}> api_team_idのコレクション
     */
    public function getTeamsWithoutImages(): Collection
    {
        return Team::query()
            ->where('has_image', false)
            ->get(['id', 'api_team_id'])
            ->map(fn (Team $team) => $team->toArray());
    }

    /**
     * 画像が未設定の選手のデータを取得（今シーズン限定）
     *
     * 以下の条件を満たす今シーズンの選手のデータを取得します：
     * - 今シーズン（is_current = true）に所属している選手
     * - has_imageがfalse または flash_idまたはflash_image_idがnull
     * - is_fetchedがtrueのものは除外
     *
     * @return Collection<array{id: int, api_player_id: int, flash_id: ?string, flash_image_id: ?string, team_name: string}> 選手データのコレクション（チーム名を含む）
     */
    public function getPlayersWithoutImages(): Collection
    {
        $currentSeason = Season::where('is_current', true)->first();

        if (! $currentSeason) {
            return collect();
        }

        return Player::query()
            ->with('team:id,name')
            ->where('season_id', $currentSeason->id)
            ->where(function ($query) {
                $query->where('has_image', false)
                    ->orWhereNull('flash_id')
                    ->orWhereNull('flash_image_id');
            })
            ->where('is_fetched', false)
            ->get(['id', 'name', 'api_player_id', 'flash_id', 'flash_image_id', 'team_id'])
            ->map(fn (Player $player) => collect([
                'id'             => $player->id,
                'name'           => $player->name,
                'api_player_id'  => $player->api_player_id,
                'flash_id'       => $player->flash_id,
                'flash_image_id' => $player->flash_image_id,
                'team_name'      => $player->team->name,
            ]));
    }
}
