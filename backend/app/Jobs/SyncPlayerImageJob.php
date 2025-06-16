<?php

declare(strict_types=1);

namespace App\Jobs;

use App\UseCases\Admin\Game\Sync\SyncPlayerImagesAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * プレイヤー画像同期ジョブ
 *
 * プレイヤー画像の同期処理をキューで非同期実行します。
 */
class SyncPlayerImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * ジョブのコンストラクタ
     *
     * @param  Collection  $players  対象プレイヤーのコレクション
     */
    public function __construct(
        public readonly Collection $players,
    ) {}

    /**
     * ジョブの実行
     */
    public function handle(SyncPlayerImagesAction $sync): void
    {
        $sync->execute($this->players);
    }
}
