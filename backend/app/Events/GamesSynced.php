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
 */
class GamesSynced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * イベントのコンストラクタ
     *
     * @param  Collection  $eventData  画像同期に必要なAPIIDを含むイベントデータ
     *                                 - 'teams': チームのコレクション
     *                                 - 'leagues': チームのコレクション
     */
    public function __construct(
        public readonly Collection $eventData,
    ) {}

    /**
     * 未保存のチームデータを取得
     *
     * @return Collection 未保存のチームデータを取得
     */
    public function getTeams(): Collection
    {
        return $this->eventData->get('teams');
    }

    /**
     * 未保存のリーグデータを取得
     *
     * @return Collection 未保存のリーグデータを取得
     */
    public function getLeagues(): Collection
    {
        return $this->eventData->get('leagues');
    }
}
