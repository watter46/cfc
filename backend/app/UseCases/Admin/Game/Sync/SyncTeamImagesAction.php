<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Repositories\Images\TeamImageRepository;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * チーム画像同期処理のユースケースクラス
 *
 * チーム画像の確認・取得・保存を管理します。
 */
final readonly class SyncTeamImagesAction
{
    public function __construct(
        private TeamImageRepository $teamImage,
        private ApiFootballRepositoryInterface $apiFootball,
    ) {}

    public function execute(Collection $apiTeamIds): void
    {
        $invalidApiTeamIds = $apiTeamIds->filter(function (int $apiTeamId) {
            return ! $this->teamImage->exist($apiTeamId);
        });
        
        $invalidApiTeamIds->each(function (int $apiTeamId) {
            $binaryData = $this->apiFootball->fetchTeamImage($apiTeamId);
            
            $this->teamImage->save($apiTeamId, $binaryData);
        });
    }
}
