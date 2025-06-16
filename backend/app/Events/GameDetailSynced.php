<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * ゲーム詳細同期完了イベント
 *
 * 個別のゲーム詳細データの同期が完了した際に発火されます。
 */
class GameDetailSynced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * イベントのコンストラクタ
     *
     * @param  Collection  $eventData  同期されたゲーム
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

    /**
     * 未保存のプレイヤーデータを取得
     *
     * @return Collection 未保存のプレイヤーデータを取得
     */
    public function getPlayers(): Collection
    {
        return $this->eventData->get('players');
    }
}
