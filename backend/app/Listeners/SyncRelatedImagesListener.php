<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\GameDetailSynced;
use App\Events\GamesSynced;
use App\Jobs\SyncLeagueImageJob;
use App\Jobs\SyncTeamImageJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Queue;

/**
 * 関連画像同期処理リスナー
 *
 * ゲーム同期完了後に関連する画像（チーム、リーグ、プレイヤー）の
 * 同期処理を開始します。
 */
class SyncRelatedImagesListener implements ShouldQueue
{
    /**
     * イベントハンドラー
     */
    public function handle(GamesSynced|GameDetailSynced $event): void
    {
        if ($event instanceof GamesSynced) {
            $this->executeLagueImageSync($event->getApiLeagueIds());
            $this->executeTeamImageSync($event->getApiTeamIds());

            return;
        }
    }

    private function executeLagueImageSync(Collection $apiLeagueIds): void
    {
        Queue::push(new SyncLeagueImageJob($apiLeagueIds));
    }

    private function executeTeamImageSync(Collection $apiTeamIds): void
    {
        Queue::push(new SyncTeamImageJob($apiTeamIds));
    }
}
