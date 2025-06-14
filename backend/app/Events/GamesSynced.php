<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * ゲーム同期完了イベント
 *
 * 複数のゲームデータの同期が完了した際に発火されます。
 * 関連する画像同期処理のトリガーとして使用され、
 * APIチームIDとAPIリーグIDを含むイベントデータを伝達します。
 *
 * @example
 * $eventData = collect([
 *     'apiTeamIds' => [123, 456, 789],
 *     'apiLeagueIds' => [10, 20, 30]
 * ]);
 * GamesSynced::dispatch($eventData);
 */
class GamesSynced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * イベントのコンストラクタ
     *
     * @param  Collection  $eventData  画像同期に必要なAPIIDを含むイベントデータ
     *                                 - 'apiTeamIds': APIチームIDの配列
     *                                 - 'apiLeagueIds': APIリーグIDの配列
     */
    public function __construct(
        public readonly Collection $eventData,
    ) {}

    /**
     * APIチームIDのコレクションを取得
     *
     * @return Collection APIチームIDのコレクション
     */
    public function getApiTeamIds(): Collection
    {
        return $this->eventData->get('apiTeamIds');
    }

    /**
     * APIリーグIDのコレクションを取得
     *
     * @return Collection APIリーグIDのコレクション
     */
    public function getApiLeagueIds(): Collection
    {
        return $this->eventData->get('apiLeagueIds');
    }
}
