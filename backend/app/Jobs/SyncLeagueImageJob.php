<?php

declare(strict_types=1);

namespace App\Jobs;

use App\UseCases\Admin\Game\Sync\SyncLeagueImagesAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * リーグ画像同期ジョブ
 *
 * リーグ画像の同期処理をキューで非同期実行します。
 */
class SyncLeagueImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * ジョブのコンストラクタ
     *
     * @param  Collection  $apiLeagueIds  対象リーグIDのコレクション
     */
    public function __construct(
        public readonly Collection $apiLeagueIds,
    ) {}

    /**
     * ジョブの実行
     */
    public function handle(SyncLeagueImagesAction $sync): void
    {
        $sync->execute($this->apiLeagueIds);
    }
}
