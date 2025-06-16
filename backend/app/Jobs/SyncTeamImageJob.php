<?php

declare(strict_types=1);

namespace App\Jobs;

use App\UseCases\Admin\Game\Sync\SyncTeamImagesAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * チーム画像同期ジョブ
 *
 * チーム画像の同期処理をキューで非同期実行します。
 */
class SyncTeamImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * ジョブのコンストラクタ
     *
     * @param  Collection  $teamIds  対象チームIDのコレクション
     */
    public function __construct(
        public readonly Collection $teamIds,
    ) {}

    /**
     * ジョブの実行
     */
    public function handle(SyncTeamImagesAction $sync): void
    {
        $sync->execute($this->teamIds);
    }
}
